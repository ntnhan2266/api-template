import { Request, Response } from 'express';
import { AbstractRoutes } from '../../routes-base';
import { OrderController } from './order.controller';
import { OrderProvider } from './order.provider';

export class OrderRoutes<C extends OrderController<OrderProvider>> extends AbstractRoutes<C> {
  protected setRoutes(): void {
    this.routes = [
      {
        path: '/api/v1/order/:id',
        method: 'get',
        handler: [
          this.middlewares.assertBody,
          (req: Request, res: Response) => {
            this.controller.getOrderById(res, Number(req.params.id));
          }
        ]
      }
    ];
  }
}
