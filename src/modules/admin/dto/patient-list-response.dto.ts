import { ApiProperty } from '@nestjs/swagger';

import { PatientListItemDto } from './patient-list-item.dto';

export class PatientListResponseDto {
  @ApiProperty({
    example: 125,
    description: 'จำนวนผู้ป่วยทั้งหมด',
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
    type: [PatientListItemDto],
  })
  patients!: PatientListItemDto[];
}
