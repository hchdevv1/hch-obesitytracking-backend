import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObesityRegisterService } from './obesity-register.service';
import { ObesityRegisterController } from './obesity-register.controller';
import { ObesityRegister } from './entities/obesity-register.entity';
import { HisModule } from '../his/his.module';
import { HttpModule } from '@nestjs/axios';
import { ObesityWeightTransaction } from '../obesity-weight-transaction/entities/obesity-weight-transaction.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([
      ObesityRegister,
      ObesityWeightTransaction
    ]),
    HisModule,
    HttpModule
  ],
  controllers: [ObesityRegisterController],
  providers: [ObesityRegisterService],
   exports: [
    TypeOrmModule,
  ],
})
export class ObesityRegisterModule {}
