import { AbstractUpdater } from '../../../../routes-base';
import { OrderCache } from '../order.cache';

export class OrderUpdater extends AbstractUpdater {

  protected cache!: OrderCache;

  protected init(): void {
    this.cache = new OrderCache(this.cacheAdapter);
  }
}
