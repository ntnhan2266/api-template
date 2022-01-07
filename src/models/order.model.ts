import { Schema, model } from 'mongoose';
import { OrderStatus } from '../enums';

// Interface representing a document in MongoDB.
interface IOrder {
  /**
   * Order ID store in db of bff-service
   */
  orderId: number;

  /**
   * Transaction ID in SC
   */
  transactionId: string;

  /**
   * Status of order
   */
  status: OrderStatus
}

// Schema corresponding to the document interface.
const schema = new Schema<IOrder>({
  orderId: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: OrderStatus,
    default: OrderStatus.New,
  }
}, {
  // Auto generate createdAt, updatedAt, deletedAt
  timestamps: true
});

// Order model.
const OrderModel = model<IOrder>('Order', schema);

export default OrderModel;


