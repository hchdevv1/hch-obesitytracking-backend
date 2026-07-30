/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ApiBaseResponse } from '../../common/decorators/api-response.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Health Check',
    description: 'Check application status',
  })
  @ResponseMessage('Health check success')
  @ApiBaseResponse(HealthResponseDto)
  getHealth(): HealthResponseDto {
    return this.healthService.getHealth();
  }
}
