/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: process.env.DB_TYPE ?? 'postgres',

  host: process.env.DB_HOST ?? 'localhost',

  port: Number(process.env.DB_PORT ?? 5432),

  username: process.env.DB_USERNAME ?? '',

  password: process.env.DB_PASSWORD ?? '',

  database: process.env.DB_NAME ?? '',

  synchronize: process.env.DB_SYNCHRONIZE === 'true',

  logging: process.env.DB_LOGGING === 'true',

  ssl: process.env.DB_SSL === 'true',

  autoLoadEntities:
    process.env.DB_AUTO_LOAD_ENTITIES !== 'false',

  retryAttempts: Number(
    process.env.DB_RETRY_ATTEMPTS ?? 3,
  ),

  retryDelay: Number(
    process.env.DB_RETRY_DELAY ?? 3000,
  ),
}));
