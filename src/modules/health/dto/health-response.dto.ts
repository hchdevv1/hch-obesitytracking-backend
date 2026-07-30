import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    example: 'ok',
  })
  status?: string;

  @ApiProperty({
    example: 'hch-obesity-tracking-backend',
  })
  service?: string;

  @ApiProperty({
    example: '0.0.1',
  })
  version?: string;

  @ApiProperty({
    example: '2026-07-14T10:00:00.000Z',
  })
  timestamp?: string;

  @ApiProperty({
    example: 123.456,
  })
  uptime?: number;
}
