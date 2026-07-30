import { Controller } from '@nestjs/common';
import { ObesityRegisterService } from './obesity-register.service';

@Controller('obesity-register')
export class ObesityRegisterController {
  constructor(private readonly obesityRegisterService: ObesityRegisterService) {}
}
