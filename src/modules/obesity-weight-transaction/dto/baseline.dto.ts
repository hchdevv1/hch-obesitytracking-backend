import { ApiProperty } from '@nestjs/swagger';

export class BaselineDto {
  @ApiProperty({
    example: '2026-07-15',
  })
  date!: string;

  @ApiProperty({
    example: 115.8,
  })
  weight!: number;
}
