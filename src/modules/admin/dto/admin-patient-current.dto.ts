import { ApiProperty } from '@nestjs/swagger';

export class AdminPatientCurrentDto {
  @ApiProperty({
    example: '2026-08-06',
    description: 'วันที่บันทึกน้ำหนักล่าสุด',
  })
  date!: string;

  @ApiProperty({
    example: 110.5,
    description: 'น้ำหนักล่าสุด (kg)',
  })
  weight!: number;

  @ApiProperty({
    example: 36.84,
    description: 'BMI ล่าสุด',
  })
  bmi!: number;

  @ApiProperty({
    example: 'PATIENT',
    description: 'แหล่งที่มาของน้ำหนัก',
    enum: ['PATIENT', 'HOSPITAL'],
  })
  source!: string;
}
