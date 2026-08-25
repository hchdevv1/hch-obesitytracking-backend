import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class PreauthorizeRegisterRequestDto {
  @ApiProperty({
    example: '62-014391',
    description: 'Hospital Number',
  })
  @IsString()
  @IsNotEmpty()
  hn!: string;
}
