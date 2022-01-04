import { Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { AbstractController } from '../../routes-base';
import { OrderProvider } from './order.provider';

export class OrderController<T extends OrderProvider> extends AbstractController<T> {
  getOrderById(res: Response, id: number) {
    if (!id) {
      res.status(StatusCodes.BAD_REQUEST)
        .send(getReasonPhrase(StatusCodes.BAD_REQUEST));
    }
  }
}
