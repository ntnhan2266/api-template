import { CheckMiddleware } from '../middlewares';
import { OrderController } from '../services/public/order/order.controller';
import { OrderProvider } from '../services/public/order/order.provider';
import { OrderRoutes } from '../services/public/order/order.routes';
import { AbstractController, AbstractProvider, AbstractRoutes, IDAL } from './routes-base';

export class Routes {

  private routes: Array<AbstractRoutes<AbstractController<AbstractProvider>>> = [];

  constructor(
    private dal: IDAL,
    private middlewares: CheckMiddleware) {
    this.routes = [
      this.getOrderRoutes(),
    ];
  }

  getRoutes(): Array<AbstractRoutes<AbstractController<AbstractProvider>>> {
    return this.routes;
  }

  private getOrderRoutes(): OrderRoutes<OrderController<OrderProvider>> {
    const provider: OrderProvider = new OrderProvider(this.dal);
    const controller: OrderController<OrderProvider> = new OrderController(provider);
    const routes: OrderRoutes<OrderController<OrderProvider>> = new OrderRoutes(controller, this.middlewares);

    return routes;
  }
}
