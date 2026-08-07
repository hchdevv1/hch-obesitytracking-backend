import { ApiProperty } from '@nestjs/swagger';

import { WeightSource } from '../enums/weight-source.enum';

export class CurrentDto {
  @ApiProperty({
    example: '2026-08-06',
  })
  date!: string;

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
    enum: WeightSource,
    example: WeightSource.PATIENT,
  })
  source!: WeightSource;
}
