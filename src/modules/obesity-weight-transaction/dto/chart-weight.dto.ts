import { ApiProperty } from '@nestjs/swagger';

export class ChartWeightDto {
  @ApiProperty({
    example: 109,
  })
  min!: number;

  @ApiProperty({
    example: 117,
  })
  max!: number;

  @ApiProperty({
    example: 1,
  })
  tickInterval!: number;
}
