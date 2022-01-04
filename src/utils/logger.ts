/* eslint-disable no-console */
import dayjs from 'dayjs';
import { resolve } from 'path';
import { config } from 'dotenv';
import chalk from 'chalk';
import { LogLevel } from '../enums';


config({ path: resolve(__dirname, '../environments/.env') });

export class Logger {
  private colors: { [key: string]: chalk.Chalk } = {
    [LogLevel.Verbose]: chalk,
    [LogLevel.Debug]: chalk.magenta.italic,
    [LogLevel.Info]: chalk.blue.italic,
    [LogLevel.Warning]: chalk.yellow.bold,
    [LogLevel.Error]: chalk.red.bold.underline,
    [LogLevel.Test]: chalk.green
  };

  public log = (msg: string | Error, logLevel: LogLevel, prefix?: string): void => {

    const timestamp: string = dayjs()
      .format('YYYY-MM-DD, HH:mm:ss.SSS');

    prefix = prefix ? ` [${prefix}]:` : '';

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const message = `[${logLevel.toUpperCase()}] (${timestamp})${prefix} ${msg}`;

    if (logLevel === LogLevel.Error) {
      console.error(this.colors[logLevel](message));
      if ((msg as Error).stack) {
        console.error(this.colors[logLevel]((msg as Error).stack));
      }
      return;
    }
    console.log(this.colors[logLevel](message));
  }
}