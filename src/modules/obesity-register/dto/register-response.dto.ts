import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    example: true,
    description: 'Registration status',
  })
  registered!: boolean;

  @ApiProperty({
    example: '5',
    description: 'Register ID',
  })
  registerId!: string;

  @ApiProperty({
    example: 'U1f67efea7e5e56c95061db412e4d5da6',
    nullable: true,
    description: 'LINE User ID',
  })
  userId!: string | null;

  @ApiProperty({
    example: '857799',
    nullable: true,
    description: 'Patient ID',
  })
  patientId!: string | null;

  @ApiProperty({
    example: '62-014391',
    nullable: true,
    description: 'Hospital Number',
  })
  hn!: string | null;

  @ApiProperty({
    example: 'John Doe',
    nullable: true,
    description: 'Patient Full Name',
  })
  fullname!: string | null;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Obesity Number',
  })
  obesityNumber!: string | null;
}
