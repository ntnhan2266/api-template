import { config } from 'dotenv';
import express from 'express';
import http from 'http';
import { resolve } from 'path';
import { DEFAULT_HTTP_PORT } from './config/config';
import { CheckMiddleware, HttpMiddlewares } from './middlewares';
import { Redis, RedisMode } from './redis';
import { Routes } from './services/routes';
import { IDAL } from './services/routes-base';
import { applyRoutes } from './utils';
import { CacheAdapter } from './utils/cache-adapter';
import { Logger } from './utils/logger';
import { DbProvider } from './utils';
import { LogLevel } from './enums';

config({ path: resolve(__dirname, '.env') });

let logger: Logger | undefined;

process.on('uncaughtException', (e: Error) => {
  if (logger) {
    logger.log(e, LogLevel.Error);
  }
});

process.on('unhandledRejection', (e: unknown | null | undefined) => {
  if (logger && e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    logger.log(`${e}`, LogLevel.Error);
  }
});


const bootstrapApplication: () => void = () => {

  logger = new Logger();

  const app: express.Express = express();

  // Create redis instance
  const cacheRedis: Redis = new Redis(RedisMode.Publisher, logger);
  const cacheAdapter: CacheAdapter = new CacheAdapter(cacheRedis);

  // Create an instance of DbProvider (singleton)
  const dbProvider: DbProvider = new DbProvider(logger);

  // Combining dependencies for routes in one object
  const dal: IDAL = {
    cacheAdapter: cacheAdapter,
    dbProvider: dbProvider,
    logger: logger,
  };

  const checksMiddleware: CheckMiddleware = new CheckMiddleware(app);

  // Creating instances of all our routes
  // (and thus providers, controllers, caches, etc.)
  const routesNew: Routes = new Routes(dal, checksMiddleware);

  new HttpMiddlewares(logger, app);
  applyRoutes(routesNew, app);

  // Serving the swagger dogs
  app.use('/', express.static(resolve(__dirname, 'public')));

  // Use port 4013 unless there exists a preconfigured port
  const httpPort: string = process.env.PORT ?? DEFAULT_HTTP_PORT;
  const httpServer: http.Server = http.createServer(app);

  httpServer.listen(httpPort, () => {
    if (logger) {
      logger.log(
        `Listening on ${process.env.EXPRESS_USE_CUSTOM_SSL ? 'https' : 'http'}://localhost:${httpPort} ...`,
        LogLevel.Warning, // We want to see this even if the level to display is on Warning
        'HTTP Server'
      );
    }
  });
};

bootstrapApplication();
