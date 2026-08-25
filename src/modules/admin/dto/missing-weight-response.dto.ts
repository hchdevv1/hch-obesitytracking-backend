import { ApiProperty } from '@nestjs/swagger';

import { MissingWeightItemDto } from './missing-weight-item.dto';

export class MissingWeightResponseDto {
  @ApiProperty({
    example: 12,
    description: 'จำนวนผู้ป่วยที่ขาดการบันทึกน้ำหนักทั้งหมด',
  })
  total!: number;

  @ApiProperty({
    example: 1,
    description: 'หน้าปัจจุบัน',
  })
  page!: number;

  @ApiProperty({
    example: 20,
    description: 'จำนวนรายการต่อหน้า',
  })
  pageSize!: number;

  @ApiProperty({
    type: [MissingWeightItemDto],
  })
  patients!: MissingWeightItemDto[];
}
