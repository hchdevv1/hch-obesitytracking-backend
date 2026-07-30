import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObesityRegisterService } from './obesity-register.service';
import { ObesityRegisterController } from './obesity-register.controller';
import { ObesityRegister } from './entities/obesity-register.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([
      ObesityRegister,
    ]),
  ],
  controllers: [ObesityRegisterController],
  providers: [ObesityRegisterService],
   exports: [
    TypeOrmModule,
  ],
})
export class ObesityRegisterModule {}
