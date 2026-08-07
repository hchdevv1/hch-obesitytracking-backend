import { ApiProperty } from '@nestjs/swagger';

export class GoalDto {
  @ApiProperty({
    example: 5,
  })
  targetPercent!: number;

  @ApiProperty({
    example: 110.0,
  })
  targetWeight!: number;
}
