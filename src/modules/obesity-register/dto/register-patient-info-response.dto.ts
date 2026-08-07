import { ApiProperty } from '@nestjs/swagger';

class PatientInfoDto {
  @ApiProperty({
    example: '62-014391',
  })
  hn!: string;

  @ApiProperty({
    example: '857799',
  })
  patientId!: string;

  @ApiProperty({
    example: 'John Doe',
  })
  fullname!: string;

  @ApiProperty({
    example: 'M',
  })
  gender!: string;

  @ApiProperty({
    example: '1985-07-15',
  })
  dob!: string;

  @ApiProperty({
    example: 'O464932-69',
    nullable: true,
  })
  vn!: string | null;

  @ApiProperty({
    example: 14339742,
    nullable: true,
  })
  episodeId!: number | null;

  @ApiProperty({
    example: '2026-07-22',
    nullable: true,
  })
  visitDate!: string | null;

  @ApiProperty({
    example: '3525',
    nullable: true,
  })
  locationCode!: string | null;

  @ApiProperty({
    example: 'คลินิกลดน้ำหนัก',
    nullable: true,
  })
  location!: string | null;

  @ApiProperty({
    example: 'DMA03',
    nullable: true,
  })
  careproviderCode!: string | null;

  @ApiProperty({
    example: 'บูรณาการงานลดน้ำหนัก',
    nullable: true,
  })
  careprovider!: string | null;

  @ApiProperty({
    example: '150',
    nullable: true,
  })
  height!: string | null;

  @ApiProperty({
    example: '101.3',
    nullable: true,
  })
  weight!: string | null;

  @ApiProperty({
    example: '45.02',
    nullable: true,
  })
  bmi!: string | null;
}

export class RegisterPatientInfoResponseDto {
  @ApiProperty({
    type: PatientInfoDto,
  })
  patientInfo!: PatientInfoDto;
}
