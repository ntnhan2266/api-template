import { AbstractCreator } from '../../../../routes-base';
import { OrderCache } from '../order.cache';

export class OrderCreator extends AbstractCreator {

  protected cache!: OrderCache;

  protected init(): void {
    this.cache = new OrderCache(this.cacheAdapter);
  }
}
