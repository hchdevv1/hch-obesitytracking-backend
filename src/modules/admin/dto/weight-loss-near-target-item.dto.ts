import { ApiProperty } from '@nestjs/swagger';

import { AdminPatientBaselineDto } from './admin-patient-baseline.dto';
import { AdminPatientGoalDto } from './admin-patient-goal.dto';
import { AdminPatientStatusDto } from './admin-patient-status.dto';
import { MissingWeightLastWeightDto } from './missing-weight-last-weight.dto';

export class WeightLossNearTargetItemDto {
  @ApiProperty({
    example: '66',
    description: 'Register ID',
  })
  registerId!: string;

  @ApiProperty({
    example:
      'U1f67efea7e5e56c95061db412e4d5da6',
    description: 'LINE User ID',
  })
  userId!: string;

  @ApiProperty({
    example: '61-018376',
    description: 'Hospital Number',
  })
  hn!: string;

  @ApiProperty({
    example: 'นาย สิงหา กิตติเรืองระยับ',
    description: 'Patient full name',
  })
  fullname!: string;

  @ApiProperty({
    example: '2026-08-25',
    description: 'วันที่ Register',
  })
  registerDate!: string;

  @ApiProperty({
    type: AdminPatientBaselineDto,
  })
  baseline!: AdminPatientBaselineDto;

  @ApiProperty({
    type: AdminPatientGoalDto,
  })
  goal!: AdminPatientGoalDto;

  @ApiProperty({
    type: MissingWeightLastWeightDto,
  })
  lastWeight!: MissingWeightLastWeightDto;

  @ApiProperty({
    example: 4,
    description:
      'น้ำหนักที่ลดลงจาก Baseline (kg)',
  })
  weightLost!: number;

  @ApiProperty({
    example: 4.6,
    description:
      'เปอร์เซ็นต์น้ำหนักที่ลดลงจาก Baseline (%)',
  })
  weightLossPercent!: number;

  @ApiProperty({
    example: 0.4,
    description:
      'น้ำหนักที่เหลือเพื่อให้ถึงเป้าหมาย (kg)',
  })
  remainingWeight!: number;

  @ApiProperty({
    type: AdminPatientStatusDto,
  })
  status!: AdminPatientStatusDto;
}
