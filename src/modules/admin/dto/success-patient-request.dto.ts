import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Min } from 'class-validator';

export class SuccessPatientRequestDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'หน้าปัจจุบัน',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'จำนวนรายการต่อหน้า',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  pageSize?: number;

  @ApiPropertyOptional({
    example: '61-018376',
    description:
      'ค้นหาด้วย HN, ชื่อผู้ป่วย หรือ Obesity Number',
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}
