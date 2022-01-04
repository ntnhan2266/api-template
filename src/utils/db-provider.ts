import { resolve } from 'path';
import { config } from 'dotenv';
import { Connection, createConnection } from 'typeorm';
import { Logger } from './logger';
import { LogLevel } from '../enums';
import { Order } from '../entities';

const LOG_PREFIX = 'DbProvider';

/**
 * The class responsible for communication with database.
 * The code below currently aims to connect to a mysql.
 */
export class DbProvider {
  private connection!: Connection;

  constructor(private logger: Logger) {
    config({ path: resolve(__dirname, '../.env') });

    if (!process.env.SQL_DB_host
      || !process.env.SQL_DB_username
      || !process.env.SQL_DB_password
      || !process.env.SQL_DB_database
      || !process.env.SQL_DB_port) {
      throw new Error('SQL environment not configured');
    }

    const DB_HOST: string = process.env.SQL_DB_host;
    const DB_DATABASE: string = process.env.SQL_DB_database;
    const DB_USERNAME: string = process.env.SQL_DB_username as string;
    const DB_PWD: string = process.env.SQL_DB_password;
    const DB_PORT = Number(process.env.SQL_DB_port);

    createConnection({
      type: "mysql",
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PWD,
      database: DB_DATABASE,
      entities: [
        Order
      ],
      synchronize: process.env.API_ENVIRONMENT === 'development',
      logging: false
    }).then((pool: Connection) => {
      this.connection = pool;
      this.logger.log(`Connection has been established successfully`, LogLevel.Verbose, LOG_PREFIX);
    }).catch((error: unknown) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      this.logger.log(`Unable to connect to the database: ${error}`, LogLevel.Error, LOG_PREFIX);
    })
  }

  async disconnect(): Promise<void> {
    try {
      await this.connection.close();
      this.logger.log(`Disconnected from the database successfully`, LogLevel.Verbose, LOG_PREFIX);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      this.logger.log(`Unable to disconnect from the database: ${error}`, LogLevel.Error, LOG_PREFIX);
    }
  }

  getPool(): Connection {
    return this.connection;
  }
}
