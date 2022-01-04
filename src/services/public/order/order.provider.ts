import { AbstractProvider } from '../../routes-base';
import { OrderCreator } from './dal/crud/order.creator';
import { OrderReader } from './dal/crud/order.reader';
import { OrderUpdater } from './dal/crud/order.updater';
import { OrderDeleter } from './dal/crud/order.deleter';

export class OrderProvider extends AbstractProvider {

  //#region CREATE

  //#endregion

  //#region READ

  //#endregion

  //#region DELETE

  //#endregion

  //#region INIT AND CRUD
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected init(): void {
  }

  protected getCreator(): OrderCreator {
    return new OrderCreator(this.dal);
  }
  protected getReader(): OrderReader {
    return new OrderReader(this.dal);
  }

  protected getUpdater(): OrderUpdater {
    return new OrderUpdater(this.dal);
  }

  protected getDeleter(): OrderDeleter {
    return new OrderDeleter(this.dal);
  }

  //#endregion

  //#region PRIVATE METHODS

  //#endregion
}
