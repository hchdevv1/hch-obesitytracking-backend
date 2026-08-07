import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { HisService } from './his.service';

@Module({
  imports: [HttpModule],
  providers: [HisService],
  exports: [HisService],
})
export class HisModule {}
