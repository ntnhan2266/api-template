import { CheckMiddleware } from '../middlewares';
import { IRoute } from '../types';
import { CacheAdapter } from '../utils/cache-adapter';
import { DbProvider } from '../utils/db-provider';
import { Logger } from '../utils/logger';


export abstract class AbstractRoutes<C extends AbstractController<AbstractProvider>> {

  protected routes!: Array<IRoute>;

  constructor(protected controller: C, protected middlewares: CheckMiddleware) {
    this.setRoutes();
  }
  getRoutes(): Array<IRoute> {
    return this.routes;
  }

  protected abstract setRoutes(): void;

}

export abstract class AbstractController<P extends AbstractProvider> {
  constructor(protected provider: P) { }
}

export abstract class AbstractProvider {
  constructor(protected dal: IDAL) {
    this.init();
  }

  protected abstract init(): void;
  protected abstract getReader(): AbstractReader;
  protected abstract getCreator(): AbstractCreator;
  protected abstract getUpdater(): AbstractUpdater;
  protected abstract getDeleter(): AbstractDeleter;
}

export abstract class AbstractDAL {
  protected dbProvider: DbProvider;
  protected cacheAdapter: CacheAdapter;
  protected abstract cache: AbstractCache;
  constructor(protected dal: IDAL) {
    this.cacheAdapter = dal.cacheAdapter;
    this.dbProvider = dal.dbProvider;
    this.init();
  }

  protected abstract init(): void;
}

export abstract class AbstractCache {
  constructor(protected cacheAdapter: CacheAdapter) { }
}

export interface IDAL {
  cacheAdapter: CacheAdapter;
  dbProvider: DbProvider;
  logger: Logger;
}

export abstract class AbstractReader extends AbstractDAL { }
export abstract class AbstractCreator extends AbstractDAL { }
export abstract class AbstractUpdater extends AbstractDAL { }
export abstract class AbstractDeleter extends AbstractDAL { }
