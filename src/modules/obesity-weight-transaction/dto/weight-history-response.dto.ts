import { ApiProperty } from '@nestjs/swagger';

import { BaselineDto } from './baseline.dto';
import { CurrentDto } from './current.dto';
import { GoalDto } from './goal.dto';
import { ChartDto } from './chart.dto';
import { WeightHistoryItemDto } from './weight-history-item.dto';

export class WeightHistoryResponseDto {
  @ApiProperty({
    type: BaselineDto,
  })
  baseline!: BaselineDto;

  @ApiProperty({
    type: CurrentDto,
  })
  current!: CurrentDto;

  @ApiProperty({
    type: GoalDto,
  })
  goal!: GoalDto;

  @ApiProperty({
    type: ChartDto,
  })
  chart!: ChartDto;

  @ApiProperty({
    type: [WeightHistoryItemDto],
  })
  weightHistory!: WeightHistoryItemDto[];
}
