import { ApiProperty } from '@nestjs/swagger';

import { AdminPatientBaselineDto } from './admin-patient-baseline.dto';
import { AdminPatientGoalDto } from './admin-patient-goal.dto';
import { AdminPatientStatusDto } from './admin-patient-status.dto';

import { MissingWeightLastWeightDto } from './missing-weight-last-weight.dto';

export class MissingWeightItemDto {

  @ApiProperty({
    example: '123',
  })
  registerId!: string;

  @ApiProperty({
    example:
      'U1f67efea7e5e56c95061db412e4d5da6',
  })
  userId!: string;

  @ApiProperty({
    example: '62-014391',
  })
  hn!: string;

  @ApiProperty({
    example: 'นายทดสอบ ระบบ',
  })
  fullname!: string;

  @ApiProperty({
    example: '2026-07-01',
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
    example: 21,
    description:
      'จำนวนวันที่ไม่ได้บันทึกน้ำหนัก นับจากวันที่อ้างอิงล่าสุดถึงวันที่ปัจจุบัน',
  })
  daysSinceLastWeight!: number;

  @ApiProperty({
    example: 4.6,
    description:
      'น้ำหนักที่ลดลงจาก Baseline (kg)',
  })
  weightLost!: number;

  @ApiProperty({
    example: 4.91,
    description:
      'เปอร์เซ็นต์น้ำหนักที่ลดลงจาก Baseline (%)',
  })
  weightLossPercent!: number;

  @ApiProperty({
    example: 0.1,
    description:
      'น้ำหนักที่เหลือเพื่อให้ถึงเป้าหมาย (kg)',
  })
  remainingWeight!: number;

  @ApiProperty({
    type: AdminPatientStatusDto,
  })
  status!: AdminPatientStatusDto;
}
