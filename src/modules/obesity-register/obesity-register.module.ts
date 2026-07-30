import { Module } from '@nestjs/common';
import { ObesityRegisterService } from './obesity-register.service';
import { ObesityRegisterController } from './obesity-register.controller';

@Module({
  controllers: [ObesityRegisterController],
  providers: [ObesityRegisterService],
})
export class ObesityRegisterModule {}
