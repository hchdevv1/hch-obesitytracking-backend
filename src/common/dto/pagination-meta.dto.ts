import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({
    example: 1,
    description: 'Current page',
  })
  page!: number;

  @ApiProperty({
    example: 10,
    description: 'Items per page',
  })
  limit!: number;

  @ApiProperty({
    example: 100,
    description: 'Total items',
  })
  total!: number;

  @ApiProperty({
    example: 10,
    description: 'Total pages',
  })
  totalPages!: number;

  @ApiProperty({
    example: true,
    description: 'Has next page',
  })
  hasNext!: boolean;

  @ApiProperty({
    example: false,
    description: 'Has previous page',
  })
  hasPrevious!: boolean;
}
