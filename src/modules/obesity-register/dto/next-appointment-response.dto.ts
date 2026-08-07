import { ApiProperty } from '@nestjs/swagger';

export class AppointmentInfoDto {
  @ApiProperty({
    example: 'XX-XXXXXXX',
  })
  hn?: string;

  @ApiProperty({
    example: '857799',
  })
  patientId?: string;

  @ApiProperty({
    example: '2026-07-22',
    nullable: true,
  })
  appointmentDate?: string;

  @ApiProperty({
    example: '09:00',
    nullable: true,
  })
  appointmentTime?: string;

  @ApiProperty({
    example: '3525',
    nullable: true,
  })
  locationCode?: string;

  @ApiProperty(
    { example: 'คลินิกลดน้ำหนัก',
       nullable: true,
    }
  )
  location?: string;
}

export class NextAppointmentResponseDto {
  @ApiProperty({
    type: AppointmentInfoDto,
    nullable: true,
  })
  appointment?: AppointmentInfoDto | null;
}
