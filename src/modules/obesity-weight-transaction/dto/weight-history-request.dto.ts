import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { WeightHistorySort } from '../enums/weight-history-sort.enum';

export class WeightHistoryRequestDto {
  @ApiProperty({
    example: 'U1f67efea7e5e56c95061db412e4d5da6',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    example: '62-014391',
  })
  @IsString()
  @IsNotEmpty()
  hn!: string;

  @ApiPropertyOptional({
    enum: WeightHistorySort,
    default: WeightHistorySort.DESC,
  })
  @IsOptional()
  @IsEnum(WeightHistorySort)
  sort: WeightHistorySort = WeightHistorySort.DESC;
}
