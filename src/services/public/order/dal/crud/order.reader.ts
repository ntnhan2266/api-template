import { AbstractReader } from '../../../../routes-base';
import { OrderCache } from '../order.cache';

export class OrderReader extends AbstractReader {

  protected cache!: OrderCache;

  protected init(): void {
    this.cache = new OrderCache(this.cacheAdapter);
  }
}
