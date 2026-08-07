import { ApiProperty } from '@nestjs/swagger';
import { WeightTransactionAction } from '../enums/weight-transaction-action.enum';

export class WeightTransactionResponseDto {
  @ApiProperty({
    example: '125',
  })
  transactionId!: string;

  @ApiProperty({
    example: '15',
  })
  registerId!: string;


  @ApiProperty({
    example: '672516',
  })
  patientId!: string;

  @ApiProperty({
    example: '57-017784',
  })
  hn!: string;

  @ApiProperty({
    example: '110.5',
  })
  weight!: string;

  @ApiProperty({
    example: '2026-07-15',
  })
  weightAt!: string;

  @ApiProperty({
    enum: WeightTransactionAction,
    example: WeightTransactionAction.UPDATE,
  })
  action!: WeightTransactionAction;

  
}
