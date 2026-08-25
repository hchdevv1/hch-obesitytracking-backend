import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import configuration from './config/configuration';
import { LoggerModule } from './logger/logger.module';
import { HealthModule } from './modules/health/health.module';
import { ObesityRegisterModule } from './modules/obesity-register/obesity-register.module';
import { ObesityWeightTransactionModule } from './modules/obesity-weight-transaction/obesity-weight-transaction.module';
import { HisModule } from './modules/his/his.module';
import { AdminService } from './modules/admin/admin.service';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: configuration,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const database = configService.get<{
          type: 'postgres' | 'mysql';
          host: string;
          port: number;
          username: string;
          password: string;
          database: string;
          synchronize: boolean;
          logging: boolean;
          autoLoadEntities: boolean;
          retryAttempts: number;
          retryDelay: number;
        }>('database');

        return {
          type: database?.type ?? 'postgres',
          host: database?.host,
          port: database?.port,
          username: database?.username,
          password: database?.password,
          database: database?.database,

          synchronize: database?.synchronize ?? false,
          logging: database?.logging ?? false,
          autoLoadEntities: database?.autoLoadEntities ?? true,

          retryAttempts: database?.retryAttempts ?? 3,
          retryDelay: database?.retryDelay ?? 3000,
        };
      },
    }),

    LoggerModule,
    HealthModule,
    ObesityRegisterModule,
    ObesityWeightTransactionModule,
    HisModule,
    AdminModule,
  ],
  providers: [AdminService],
})
export class AppModule {}
