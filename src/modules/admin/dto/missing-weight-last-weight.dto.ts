import { ApiProperty } from '@nestjs/swagger';

export class MissingWeightLastWeightDto {
  @ApiProperty({
    example: '2026-07-20',
    description:
      'วันที่บันทึกน้ำหนักล่าสุด หรือวันที่ Register กรณียังไม่มี Weight Transaction',
  })
  date!: string;

  @ApiProperty({
    example: 110.5,
    description:
      'น้ำหนักล่าสุด หรือ Baseline Weight กรณียังไม่มี Weight Transaction',
  })
  weight!: number;
}
