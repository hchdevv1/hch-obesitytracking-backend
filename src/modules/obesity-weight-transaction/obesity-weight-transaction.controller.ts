import { Controller } from '@nestjs/common';
import { ObesityWeightTransactionService } from './obesity-weight-transaction.service';

@Controller('obesity-weight-transaction')
export class ObesityWeightTransactionController {
  constructor(private readonly obesityWeightTransactionService: ObesityWeightTransactionService) {}
}
