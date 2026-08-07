
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SummaryRequestDto {

  @ApiProperty({
      example: '62-014391',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
  hn!: string;
}
