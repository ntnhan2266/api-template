import { Schema, model } from 'mongoose';

// Interface representing a document in MongoDB.
interface IConfig {
  /**
   * User ID store in db of bff-service
   */
  userId: number;

  /**
   * Phantom wallet address of user
   */
  phantomWalletAddress: string;
}

// Schema corresponding to the document interface.
const schema = new Schema<IConfig>({
  userId: {
    type: Number,
    required: true
  },
  phantomWalletAddress: {
    type: String,
    required: true
  },
});

// Order model.
const ConfigModel = model<IConfig>('Config', schema);

export default ConfigModel;


