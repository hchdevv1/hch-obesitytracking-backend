import { ApiProperty } from '@nestjs/swagger';

export class PreauthorizeRegisterResponseDto {
  @ApiProperty({
    example: 'XX',
    description: 'Register ID',
  })
  registerId!: string;

  @ApiProperty({
    example: 'XXXXXXXXX',
    description: 'LINE User ID',
  })
  userId!: string;

  @ApiProperty({
    example: 'XXXXXX',
    description: 'Patient ID',
  })
  patientId!: string;

  @ApiProperty({
    example: 'XX-XXXXXX',
    description: 'Hospital Number',
  })
  hn!: string;

  @ApiProperty({
    example: 'XXX XXX XXXXX',
    description: 'Patient Full Name',
  })
  fullname!: string;

  @ApiProperty({
    example: true,
    description: 'Pre-authorization status',
  })
  is_preauthorized!: boolean;
}
