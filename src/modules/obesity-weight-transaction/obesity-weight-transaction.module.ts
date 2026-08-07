import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObesityWeightTransactionService } from './obesity-weight-transaction.service';
import { ObesityWeightTransactionController } from './obesity-weight-transaction.controller';
import { ObesityWeightTransaction } from './entities/obesity-weight-transaction.entity';
import { ObesityRegister } from '../obesity-register/entities/obesity-register.entity';
@Module({
  imports: [
  TypeOrmModule.forFeature([
    ObesityWeightTransaction,
     ObesityRegister,
  ]),
],
  controllers: [ObesityWeightTransactionController],
  providers: [ObesityWeightTransactionService],
})
export class ObesityWeightTransactionModule {}
