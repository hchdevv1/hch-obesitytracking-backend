import { ApiProperty } from '@nestjs/swagger';

import { AdminPatientBaselineDto } from './admin-patient-baseline.dto';
import { AdminPatientGoalDto } from './admin-patient-goal.dto';
import { AdminPatientCurrentDto } from './admin-patient-current.dto';
import { AdminPatientSurgeryDto } from './admin-patient-surgery.dto';
import { AdminPatientStatusDto } from './admin-patient-status.dto';

export class PatientListItemDto {
  @ApiProperty({
    example: '123',
  })
  registerId!: string;

  @ApiProperty({
    example: '62-014391',
  })
  hn!: string;

  @ApiProperty({
    example: 'นายทดสอบ ระบบ',
  })
  fullname!: string;

  @ApiProperty({
    example:
      'U1f67efea7e5e56c95061db412e4d5da6',
  })
  userId!: string;

  @ApiProperty({
    type: AdminPatientBaselineDto,
  })
  baseline!: AdminPatientBaselineDto;

  @ApiProperty({
    type: AdminPatientGoalDto,
  })
  goal!: AdminPatientGoalDto;

  @ApiProperty({
    type: AdminPatientCurrentDto,
  })
  current!: AdminPatientCurrentDto;

  @ApiProperty({
    example: -5.3,
    description:
      'การเปลี่ยนแปลงของน้ำหนักเมื่อเทียบกับ Baseline (kg)',
  })
  weightChange!: number;

  @ApiProperty({
    type: AdminPatientSurgeryDto,
  })
  surgery!: AdminPatientSurgeryDto;

  @ApiProperty({
    type: AdminPatientStatusDto,
  })
  status!: AdminPatientStatusDto;
}
