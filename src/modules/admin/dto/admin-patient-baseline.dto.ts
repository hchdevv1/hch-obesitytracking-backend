import { ApiProperty } from '@nestjs/swagger';

export class AdminPatientBaselineDto {
  @ApiProperty({
    example: '2026-08-06',
    description: 'วันที่เริ่มต้นติดตาม',
  })
  date!: string;

  @ApiProperty({
    example: 115.8,
    description: 'น้ำหนักเริ่มต้น (kg)',
  })
  weight!: number;

  @ApiProperty({
    example: 170,
    description: 'ส่วนสูงเริ่มต้น (cm)',
  })
  height!: number;

  @ApiProperty({
    example: 40.0,
    description: 'BMI เริ่มต้น',
  })
  bmi!: number;
}
