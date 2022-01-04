import { Routes } from '../services/routes';
import { Express } from 'express';


export const applyMiddleware = (
  middlewareWrappers: Array<((app: Express) => void)>,
  app: Express
): void => {
  for (const wrapper of middlewareWrappers) {
      wrapper(app);
  }
};

export const applyRoutes = (routes: Routes, app: Express): void => {
  for (const abstractRoute of routes.getRoutes()) {
      for (const route of abstractRoute.getRoutes()) {
          app[route.method](route.path, route.handler);
      }
  }
};

export * from './logger';
export * from './cache-adapter';
export * from './db-provider';
