/* eslint-disable prettier/prettier */
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory,Reflector } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);
  const appConfig = configService.get<{
    api: { prefix: string };
  }>('app');

  app.setGlobalPrefix(appConfig?.api.prefix ?? 'api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors( new ResponseInterceptor(reflector),);
  app.useGlobalFilters(new GlobalExceptionFilter());
  setupSwagger(app, configService);

  const port = configService.get<number>('app.port', 3000);
  app.enableCors({
  origin: '*',
});
  await app.listen(port);
}

void bootstrap();
