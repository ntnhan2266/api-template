import { resolve } from 'path';
import { config } from 'dotenv';
import mongoose, { ConnectOptions } from 'mongoose';
import { Logger } from './logger';
import { LogLevel } from '../enums';

const LOG_PREFIX: string = 'DbProvider';

/**
 * The class responsible for communication with database.
 * The code below currently aims to connect to a mongodb.
 */
export class DbProvider {
  private MONGODB_URI: string;
  private readonly MONGOOSE_OPTIONS: ConnectOptions;

  constructor(private logger: Logger) {
    // load the environment specific variables
    config({ path: resolve(__dirname, '../.env') });

    if (!process.env.MONGO_DB_user
      || !process.env.MONGO_DB_password
      || !process.env.MONGO_DB_host
      || !process.env.MONGO_DB_database
      || !process.env.MONGO_DB_port) {
      throw new Error('DB environment not configured');
    }
    else {
      const DB_USER: string = process.env.MONGO_DB_user as string;

      const DB_PWD: string = process.env.MONGO_DB_password as string;

      const DB_HOST: string = process.env.MONGO_DB_host as string;

      const DB_PORT: string = process.env.MONGO_DB_port as string;

      const DB_DATABASE: string = process.env.MONGO_DB_database as string;

      this.MONGODB_URI = `mongodb://${DB_USER}:${encodeURIComponent(DB_PWD)}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
    }

    this.MONGOOSE_OPTIONS = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      autoIndex: true,
      poolSize: 10,
      bufferMaxEntries: 0,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 45000,
      family: 4,
    }

    this.logger.log(this.MONGODB_URI, LogLevel.Debug, LOG_PREFIX);
  }

  public async connect(): Promise<void> {
    // Connect to MongoDB
    try {
      this.logger.log('Connecting to databse', LogLevel.Verbose, LOG_PREFIX);
      return mongoose
        .connect(this.MONGODB_URI, this.MONGOOSE_OPTIONS)
        .then(() => {
          this.logger.log('Mongoose connection done', LogLevel.Verbose, LOG_PREFIX);
        });
    }
    catch (error: unknown) {
      this.logger.log(`${error}`, LogLevel.Error, LOG_PREFIX);
    }

    // CONNECTION EVENTS
    // When successfully connected
    mongoose.connection.on('connected', () => {
      this.logger.log(`Mongoose default connection open to ${this.MONGODB_URI}`, LogLevel.Debug, LOG_PREFIX);
    });

    // If the connection throws an error
    mongoose.connection.on('error', (err: Error) => {
      this.logger.log(`Mongoose default connection error: ${err}`, LogLevel.Error, LOG_PREFIX);
    });

    // When the connection is disconnected
    mongoose.connection.on('disconnected', () => {
      this.logger.log('Mongoose default connection disconnected', LogLevel.Verbose, LOG_PREFIX);
    });

    // If the Node process ends, close the Mongoose connection (ctrl + c)
    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        this.logger.log('Mongoose default connection disconnected through app termination', LogLevel.Verbose, LOG_PREFIX);
        process.exit(0);
      });
    });

    process.on('uncaughtException', (err: Error) => {
      this.logger.log(`Uncaught Exception: ${err}`, LogLevel.Error, LOG_PREFIX);
    });
  }

  public async disconnect(): Promise<void> {
    try {
      return mongoose.disconnect()
        .then(() => {
          this.logger.log('Mongoose disconnected', LogLevel.Verbose, LOG_PREFIX);
        });
    }
    catch (error) {
      this.logger.log(`${error}`, LogLevel.Error, LOG_PREFIX);
    }
  }
}
