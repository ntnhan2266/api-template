import { config } from 'dotenv';
import { resolve } from 'path';
import { Callback, ClientOpts, RedisClient, RetryStrategyOptions } from 'redis';
import { Logger } from './utils';
import { LogLevel } from './enums';

config({ path: resolve(__dirname, '.env') });
const REDIS_URL: string | undefined = process.env.REDIS_URL;
const REDIS_PASS: string | undefined = process.env.REDIS_PASS;

const LOG_PREFIX = 'Redis';
const REDIS_SCOPE_PREFIX = "lambda_backend_";

export enum RedisMode {
  Publisher = 'publisher',
  Subscriber = 'subscriber',
  MessageQueue = 'message-queue'
}

export class Redis {
  private client: RedisClient;
  private mode: RedisMode;

  constructor(mode: RedisMode, private logger: Logger) {
    this.mode = mode;

    if (!REDIS_URL) {
      const msg = 'Missing URL for Redis';
      throw new Error(msg);
    }

    const opts: ClientOpts = {
      host: REDIS_URL,
      retry_strategy: (retryOptions: RetryStrategyOptions) => this.reconnectStrategy(retryOptions)
    };

    if (REDIS_PASS) {
      opts.password = REDIS_PASS;
    }

    this.client = new RedisClient(opts);
  }

  disconnect(): void {
    this.client.quit();
  }

  getUnderlyingRedisClient(): RedisClient {
    return this.client;
  }

  async flushAll(): Promise<string | undefined> {
    return new Promise<string | undefined>(() => {
      const cb: Callback<string> = (err: Error | null, reply: string | null) => {
        if (!err) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          this.logger.log(`Flushing redis cache... ${reply}`, LogLevel.Warning, LOG_PREFIX);
          return;
        }
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.logger.log(`Flushing redis cache... ${err}`, LogLevel.Error, LOG_PREFIX);
      };

      this.client.flushall(cb);
    });
  }


  /**
   * Attempts to get an cached item
   */
  async GET(key: string, global?: boolean): Promise<string | undefined> {
    key = this.prefixKey(key, global);

    this.logger.log(`GET ${key}`, LogLevel.Verbose, LOG_PREFIX);
    return new Promise<string | undefined>((res: (value: string | undefined) => void) => {
      const cb: Callback<string | null> = (err: Error | null, reply: string | null) => {
        if (!err) {
          this.logger.log(`GET Result: '${reply as string}'`, LogLevel.Verbose, LOG_PREFIX);
          res(reply as string);
          return;
        }
        res(undefined);
      };
      this.logger.log(`GET no result`, LogLevel.Verbose, LOG_PREFIX);
      this.client.get(key, cb);
    });
  }


  /**
   * Attempts to get an cached item
   */
  async EXPIREAT(key: string, timestamp: number, global?: boolean): Promise<number> {
    key = this.prefixKey(key, global);

    this.logger.log(`Telling Redis to expire ${key} at unix timestamp ${timestamp}`, LogLevel.Verbose, LOG_PREFIX);
    return new Promise<number>((res: (value: number) => void) => {
      const cb: Callback<number> = (err: Error | null, reply: number | null) => {
        if (!err) {
          res(reply as number);
          return;
        }
        res(0);
      };

      this.client.EXPIREAT(key, timestamp, cb);
    });
  }


  async DELETE(key: string, global?: boolean): Promise<number> {
    key = this.prefixKey(key, global);

    this.logger.log(`DELETE ${key}`, LogLevel.Verbose, LOG_PREFIX);
    return new Promise<number>((res: (value: number) => void) => {
      const cb: Callback<number> = (err: Error | null, reply: number) => {
        if (!err) {
          res(reply);
          return;
        }
        res(0);
      };

      this.client.DEL(key, cb);
    });
  }

  /**
   * SETs a key value pair in the cache
   */
  async SET(key: string, value: string, global?: boolean): Promise<void> {
    key = this.prefixKey(key, global);

    this.logger.log(`SET ${key} => '${value}'`, LogLevel.Verbose, LOG_PREFIX);
    return new Promise<void>((res: () => void) => {

      const cb: Callback<'OK'> = () => {
        res();
      };
      this.client.set(key, value, cb);
    });
  }

  private prefixKey(key: string, global?: boolean): string {
    if (global) {
      return key;
    }
    return `${REDIS_SCOPE_PREFIX}${key}`;
  }

  private reconnectStrategy(options: RetryStrategyOptions): number | undefined | Error {
    let err: Error | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (options.error?.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with
      // a individual error
      err = new Error('The server refused the connection');
    }
    else if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands
      // with a individual error
      err = new Error('Retry time exhausted');
    }

    if (err) {
      this.logger.log(`Error: ${err.message} `, LogLevel.Warning, LOG_PREFIX);
    }

    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // Reconnect after
    const reconnectAfter: number = Math.min(options.attempt * 1000, 3000);
    this.logger.log(
      `Will reconnect in ${reconnectAfter / 1000}s (${this.mode})`,
      LogLevel.Warning,
      LOG_PREFIX
    );
    return reconnectAfter;
  }
}
