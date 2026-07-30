import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObesityWeightTransactionService } from './obesity-weight-transaction.service';
import { ObesityWeightTransactionController } from './obesity-weight-transaction.controller';
import { ObesityWeightTransaction } from './entities/obesity-weight-transaction.entity';

@Module({
  imports: [
  TypeOrmModule.forFeature([
    ObesityWeightTransaction,
  ]),
],
  controllers: [ObesityWeightTransactionController],
  providers: [ObesityWeightTransactionService],
})
export class ObesityWeightTransactionModule {}
