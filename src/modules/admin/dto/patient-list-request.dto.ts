import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PatientListRequestDto {
  @ApiPropertyOptional({
    description:
      'คำค้นหา HN, ชื่อ-นามสกุล หรือ Obesity Number',
    example: '62-014391',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'หมายเลขหน้า',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'จำนวนรายการต่อหน้า',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
