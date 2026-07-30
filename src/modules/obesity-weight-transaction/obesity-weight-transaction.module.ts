import { Module } from '@nestjs/common';
import { ObesityWeightTransactionService } from './obesity-weight-transaction.service';
import { ObesityWeightTransactionController } from './obesity-weight-transaction.controller';

@Module({
  controllers: [ObesityWeightTransactionController],
  providers: [ObesityWeightTransactionService],
})
export class ObesityWeightTransactionModule {}
