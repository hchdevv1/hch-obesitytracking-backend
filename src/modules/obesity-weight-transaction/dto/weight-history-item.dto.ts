import { ApiProperty } from '@nestjs/swagger';

import { WeightSource } from '../enums/weight-source.enum';

export class WeightHistoryItemDto {
  @ApiProperty({
    example: '125',
  })
  transactionId!: string;

  @ApiProperty({
    example: '2026-08-06',
  })
  weightAt!: string;

  @ApiProperty({
    example: 22,
  })
  daysFromBaseline!: number;

  @ApiProperty({
    example: 110.5,
  })
  weight!: number;

  @ApiProperty({
    example: 36.84,
  })
  bmi!: number;

  @ApiProperty({
    example: -0.7,
  })
  weightChange!: number;

  @ApiProperty({
    enum: WeightSource,
    example: WeightSource.PATIENT,
  })
  source!: WeightSource;
}
