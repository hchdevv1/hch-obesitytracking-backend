import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ObesityRegister } from '../obesity-register/entities/obesity-register.entity';
import { ObesityWeightTransaction } from '../obesity-weight-transaction/entities/obesity-weight-transaction.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([
      ObesityRegister,
      ObesityWeightTransaction,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
