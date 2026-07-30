/* eslint-disable prettier/prettier */
import 'dotenv/config';
import * as path from 'node:path';

import { DataSource, DataSourceOptions } from 'typeorm';

const databaseType = (process.env.DB_TYPE ?? 'postgres') as
  | 'postgres'
  | 'mysql';

const dataSourceOptions: DataSourceOptions = {
  type: databaseType,

  host: process.env.DB_HOST ?? 'localhost',

  port: Number(
    process.env.DB_PORT ??
      (databaseType === 'postgres' ? 5432 : 3306),
  ),

  username: process.env.DB_USERNAME ?? '',

  password: process.env.DB_PASSWORD ?? '',

  database: process.env.DB_NAME ?? '',

  synchronize: false,

  logging: process.env.DB_LOGGING === 'true',

  entities: [
    path.join(
      __dirname,
      '../modules/**/*.entity.{ts,js}',
    ),
  ],

  migrations: [
    path.join(
      __dirname,
      './migrations/*.{ts,js}',
    ),
  ],

  subscribers: [],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
