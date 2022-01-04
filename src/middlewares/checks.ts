import { Express, Request, Response, NextFunction } from 'express';
import { resolve as pathResolve } from 'path';
import { config } from 'dotenv';
import { StatusCodes } from 'http-status-codes';
import bearerToken from 'express-bearer-token';


config({ path: pathResolve(__dirname, '../.env') });

export class CheckMiddleware {
  constructor(private app: Express) {
    this.init();
  }

  private init(): void {
    this.app.use(bearerToken());
  }

  assertBody = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (!req.body || Object.keys(req.body).length <= 0) {
      res.status(StatusCodes.BAD_REQUEST)
        .send(`Bad Request, missing body.`);
    }
    else {
      next();
    }
  };
}
