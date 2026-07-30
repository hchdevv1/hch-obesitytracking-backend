/* eslint-disable prettier/prettier */
import * as path from 'node:path';

import { ConfigService } from '@nestjs/config';
import { LoggerOptions, format, transports } from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import DailyRotateFile from 'winston-daily-rotate-file';

interface LoggerConfig {
  appName: string;
  level: string;
  directory: string;
  maxSize: string;
  retention: string;
  zippedArchive: boolean;
}

export function createWinstonConfig(
  configService: ConfigService,
): LoggerOptions {
  const logger = configService.get<LoggerConfig>('logger');

  if (!logger) {
    throw new Error('Logger configuration not found');
  }

  const logDir = path.join(process.cwd(), logger.directory);

  return {
    level: logger.level,

    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),

      format.errors({
        stack: true,
      }),

      format.ms(),

      nestWinstonModuleUtilities.format.nestLike(logger.appName,{prettyPrint:true,},),
    ),

    transports: [
      new transports.Console(),

      new DailyRotateFile({
        dirname: logDir,

        filename: 'application-%DATE%.log',

        datePattern: 'YYYY-MM-DD',

        zippedArchive: logger.zippedArchive,

        maxSize: logger.maxSize,

        maxFiles: logger.retention,

        level: logger.level,
      }),

      new DailyRotateFile({
        dirname: logDir,

        filename: 'error-%DATE%.log',

        datePattern: 'YYYY-MM-DD',

        zippedArchive: logger.zippedArchive,

        maxSize: logger.maxSize,

        maxFiles: logger.retention,

        level: 'error',
      }),
    ],
  };
}
