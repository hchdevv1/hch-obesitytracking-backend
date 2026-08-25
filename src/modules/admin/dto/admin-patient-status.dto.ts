import { ApiProperty } from '@nestjs/swagger';

export class AdminPatientStatusDto {
  @ApiProperty({
    example: false,
    description: 'ยกเลิกการลงทะเบียน',
  })
  cancelled!: boolean;

  @ApiProperty({
    example: false,
    description: 'ยอมรับ Baseline แล้วหรือไม่',
  })
  baselineAccepted!: boolean;

  @ApiProperty({
    example: false,
    description: 'ส่งคำขอ Pre-Authorization แล้วหรือไม่',
  })
  requestPreauthorized!: boolean;

  @ApiProperty({
    example: false,
    description: 'ได้รับการอนุมัติ Pre-Authorization แล้วหรือไม่',
  })
  preauthorized!: boolean;

  @ApiProperty({
    example: false,
    description: 'มีการนัดหมายผ่าตัดแล้วหรือไม่',
  })
  operationScheduled!: boolean;

  @ApiProperty({
    example: false,
    description: 'ลดน้ำหนักสำเร็จตามเป้าหมาย ≥ 5% หรือไม่',
  })
  success!: boolean;

  @ApiProperty({
    example: '2026-08-24',
    nullable: true,
    description:
      'วันที่ลดน้ำหนักสำเร็จ ≥ 5% ครั้งแรก',
  })
  successDate!: string | null;
}
