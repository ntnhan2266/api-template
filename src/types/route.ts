import { Handler } from 'express';

export interface IRoute {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete';
  handler: Handler | Array<Handler>;
}
