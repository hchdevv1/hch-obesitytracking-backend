import { ApiProperty } from '@nestjs/swagger';

import { SuccessPatientItemDto } from './success-patient-item.dto';

export class SuccessPatientResponseDto {
  @ApiProperty({
    example: 2,
    description: 'Total number of success patients',
  })
  total!: number;

  @ApiProperty({
    example: 1,
    description: 'Current page',
  })
  page!: number;

  @ApiProperty({
    example: 20,
    description: 'Number of patients per page',
  })
  pageSize!: number;

  @ApiProperty({
    type: [SuccessPatientItemDto],
    description: 'Success patient list',
  })
  patients!: SuccessPatientItemDto[];
}
