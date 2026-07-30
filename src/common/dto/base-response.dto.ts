import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T = unknown> {
  @ApiProperty({
    example: true,
    description: 'Request status',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Request success',
    description: 'Response message',
  })
  message!: string;

  data!: T;
}
