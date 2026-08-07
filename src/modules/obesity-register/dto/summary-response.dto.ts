import { ApiProperty } from '@nestjs/swagger';

export class SummaryResponseDto {
  @ApiProperty({
    example: 'XX-XXXXXX',
    description: 'Hospital Number',
  })
  hn?: string;
  @ApiProperty({
    example: 'John Doe',
    nullable: true,
    description: 'Patient Full Name',
  })
  fullname!: string | null;
   @ApiProperty({
    example: '5',
    nullable: true,
    description: 'Register ID',
  })
  registerId!: string | null;
  @ApiProperty({
    example: 102.5,
    description: 'Baseline weight (kg)',
  })
  baselineWeight?: number;

  @ApiProperty({
    example: 99.7,
    description: 'Current weight (kg)',
  })
  currentWeight?: number;

  @ApiProperty({
    example: 5,
    description: 'Target weight loss percentage',
  })
  targetPercent?: number;

  @ApiProperty({
    example: 97.4,
    description: 'Target weight (kg)',
  })
  targetWeight?: number;

  @ApiProperty({
    example: 2.8,
    description: 'Weight lost from baseline (kg)',
  })
  weightLost?: number;

  @ApiProperty({
    example: 2.3,
    description: 'Remaining weight to reach target (kg)',
  })
  remainingWeight?: number;

  @ApiProperty({
    example: 2.73,
    description: 'Weight loss percentage from baseline',
  })
  weightLossPercent?: number;

  @ApiProperty({
    example: 54.63,
    description: 'Goal progress percentage',
  })
  goalProgressPercent?: number;

  @ApiProperty({
    example: false,
    description: 'Goal achieved status',
  })
  goalAchieved!: boolean;
}
