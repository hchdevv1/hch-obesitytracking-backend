import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,

} from '@nestjs/swagger';
import { ApiBaseResponse } from '../../common/decorators/api-response.decorator';
import { ObesityWeightTransactionService } from './obesity-weight-transaction.service';
import { CreateWeightTransactionDto } from './dto/create-weight-transaction.dto';
import { WeightTransactionResponseDto } from './dto/weight-transaction-response.dto';
import { WeightHistoryResponseDto } from './dto/weight-history-response.dto';
import { WeightHistoryRequestDto } from './dto/weight-history-request.dto';

@ApiTags('Obesity Weight Transaction')
@Controller('obesity-weight-transaction')
export class ObesityWeightTransactionController {
  constructor(
    private readonly obesityWeightTransactionService: ObesityWeightTransactionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Record patient weight',
    description:
      'Insert or update patient weight transaction by registerId and weightAt.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Weight recorded successfully.',
    type: WeightTransactionResponseDto,
  })
  async create(
    @Body() request: CreateWeightTransactionDto,
  ): Promise<WeightTransactionResponseDto> {
    return this.obesityWeightTransactionService.create(request);
  }
  @Post('history')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Get weight history',
})
@ApiBody({
  type: WeightHistoryRequestDto,
})
@ApiBaseResponse(WeightHistoryResponseDto)
async getHistory(
  @Body() request: WeightHistoryRequestDto,
): Promise<WeightHistoryResponseDto> {
  return this.obesityWeightTransactionService.getHistory(
    request,
  );
}
}
