import { ApiProperty } from '@nestjs/swagger';

import { WeightLossNearTargetItemDto } from './weight-loss-near-target-item.dto';

export class WeightLossNearTargetResponseDto {
  @ApiProperty({
    example: 5,
    description:
      'Total number of patients near weight loss target',
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
    type: [WeightLossNearTargetItemDto],
    description:
      'Patients with weight loss between 4% and less than 5%',
  })
  patients!: WeightLossNearTargetItemDto[];
}
