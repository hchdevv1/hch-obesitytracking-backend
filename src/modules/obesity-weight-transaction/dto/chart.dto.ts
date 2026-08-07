import { ApiProperty } from '@nestjs/swagger';

import { ChartWeightDto } from './chart-weight.dto';

export class ChartDto {
  @ApiProperty({
    type: ChartWeightDto,
  })
  weight!: ChartWeightDto;
}
