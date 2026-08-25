import { ApiProperty } from '@nestjs/swagger';

export class AdminPatientSurgeryDto {
  @ApiProperty({
    example: 'PENDING',
    description: 'สถานะการผ่าตัด',
  })
  status!: string;

  @ApiProperty({
    example: '2026-08-05T10:30:00.000Z',
    nullable: true,
    description: 'วันที่ได้รับการอนุมัติ',
  })
  approvedAt!: string | null;
}
