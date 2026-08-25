import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class WeightLossNearTargetRequestDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Page number',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    description: 'Number of patients per page',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;

  @ApiPropertyOptional({
    example: '61-018376',
    nullable: true,
    description:
      'Search by HN, patient name, or obesity number',
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}
