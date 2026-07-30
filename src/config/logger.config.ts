import { registerAs } from '@nestjs/config';

export default registerAs('logger', () => ({
  appName: process.env.APP_NAME || 'hch-obesity-tracking-backend',

  level: process.env.LOG_LEVEL || 'info',

  directory: process.env.LOG_DIR || 'logs',

  maxSize: process.env.LOG_MAX_SIZE || '20m',

  retention: process.env.LOG_RETENTION || '14d',

  zippedArchive:
    (process.env.LOG_ZIPPED_ARCHIVE || 'true').toLowerCase() === 'true',
}));
