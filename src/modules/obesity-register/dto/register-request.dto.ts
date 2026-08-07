import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({
    example: 'U1f67efea7e5e56c95061db412e4d5da6',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    example: '62-014391',
  })
  @IsString()
  @IsNotEmpty()
  hn!: string;
}
