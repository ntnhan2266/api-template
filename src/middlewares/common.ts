import express, { Request, Response, NextFunction, Express } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import forwarded from 'forwarded';
import cors from 'cors';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { LogLevel } from '../enums';
import { applyMiddleware, Logger } from '../utils';


export class HttpMiddlewares {
  constructor(private logger: Logger, private app: Express) {
    this.applyMiddleware();
  }
  
  private cors = (app: Express): void => { app.use(cors({ credentials: true, origin: true })); };

  private rateLimit = (app: Express): void => {
    const limiter: RateLimitRequestHandler = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 100, // limit each IP to 10 requests per windowMs
      keyGenerator: (req: Request) => {
        const address: Array<string> = forwarded(req);
        if (address.length > 0) {
          // The first address would be (in our case) the IP of our reverse proxy (IIS)
          // The last address in the array is the client IP
          return address[address.length - 1];
        }
        return req.ip;
      }
    });
    app.use(limiter);
  };

  private bodyParser = (app: Express): void => {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
  };

  private compression = (app: Express): void => {
    app.use(compression());
  };

  private helmet = (app: Express): void => {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src-attr': [
            "'self'",
            "'unsafe-eval'",
            "'unsafe-inline'"
          ],
          'script-src': [
            "'self'",
            "'unsafe-eval'",
            "'unsafe-inline'"
          ],
          'default-src': [
            "'self'",
            "*.visualstudio.com",
          ]
        }
      }
    }));
  };

  private errorHandler = (app: Express): void => {

    const mid = (err: Error, _req: Request, res: Response, next: NextFunction): void => {
      if (!res.headersSent) {
        this.logger.log(err, LogLevel.Error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({
            error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
          });
      }
      else {
        next(err);
      }
    };

    app.use(mid);

  };

  private applyMiddleware(): void {
    const middlewares: Array<(app: express.Express) => void> = [
      this.cors,
      this.rateLimit,
      this.bodyParser,
      this.compression,
      this.helmet,
      this.errorHandler
    ];

    applyMiddleware(middlewares, this.app);
  }
}
