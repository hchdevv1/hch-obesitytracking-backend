import { ApiProperty } from '@nestjs/swagger';

export class AdminPatientGoalDto {
  @ApiProperty({
    example: 5,
    description: 'เปอร์เซ็นต์เป้าหมายการลดน้ำหนัก',
  })
  targetPercent!: number;

  @ApiProperty({
    example: 110.0,
    description: 'น้ำหนักเป้าหมาย (kg)',
  })
  targetWeight!: number;
}
