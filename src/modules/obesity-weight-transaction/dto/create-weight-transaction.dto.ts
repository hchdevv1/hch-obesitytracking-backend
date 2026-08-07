import {
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWeightTransactionDto {
  @ApiProperty({
    example: '15',
  })
  @IsString()
  @IsNotEmpty()
  registerId!: string;

  @ApiProperty({
    example: 'Ueedd897b2df4b19c5dbdf2616ea91bc4',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    example: '672516',
  })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({
    example: '57-017784',
  })
  @IsString()
  @IsNotEmpty()
  hn!: string;

  @ApiProperty({
    example: '110.5',
  })
  @IsString()
  @IsNotEmpty()
  weight!: string;

   @ApiProperty({
    example: '2026-07-15',
    description: 'Weight record date (YYYY-MM-DD)',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'weightAt must be in YYYY-MM-DD format.',
  })
  @IsNotEmpty()
  weightAt!: string;
}
