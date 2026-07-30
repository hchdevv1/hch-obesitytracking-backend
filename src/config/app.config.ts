import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'hch-obesity-tracking-backend',

  env: process.env.APP_ENV || 'development',

  host: process.env.APP_HOST || '0.0.0.0',

  port: Number(process.env.APP_PORT || 3000),
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',

    path: process.env.SWAGGER_PATH ?? 'api/docs',
  },

  api: {
    prefix: 'api',
  },
}));
