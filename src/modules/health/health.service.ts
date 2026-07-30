/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      service:
        this.configService.get<string>('app.name') ??
        'hch-obesity-tracking-backend',
      version: process.env.npm_package_version ?? '0.0.1',
      timestamp: new Date().toISOString(),
      uptime: Number(process.uptime().toFixed(2)),
    };
  }
}
