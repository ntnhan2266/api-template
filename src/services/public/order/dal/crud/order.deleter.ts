import { AbstractDeleter } from '../../../../routes-base';
import { OrderCache } from '../order.cache';

export class OrderDeleter extends AbstractDeleter {

  protected cache!: OrderCache;

  protected init(): void {
    this.cache = new OrderCache(this.cacheAdapter);
  }
}
