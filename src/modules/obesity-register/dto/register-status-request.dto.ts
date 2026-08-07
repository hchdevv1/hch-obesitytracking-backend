import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterStatusRequestDto {
  @ApiProperty({
    example: 'U1f67efea7e5e56c95061db412e4d5da6',
    description: 'LINE User ID',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

}
