import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Param
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiOkResponse
} from '@nestjs/swagger';

import { ApiBaseResponse } from '../../common/decorators/api-response.decorator';
import { ObesityRegisterService } from './obesity-register.service';

import { RegisterPatientInfoRequestDto } from './dto/register-patient-info-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterStatusRequestDto } from './dto/register-status-request.dto';
import { RegisterStatusResponseDto } from './dto/register-status-response.dto';
import { SummaryRequestDto } from './dto/summary-request.dto';
import { SummaryResponseDto } from './dto/summary-response.dto';
import { NextAppointmentResponseDto } from './dto/next-appointment-response.dto';
import { CancelRegisterRequestDto } from './dto/cancel-register-request.dto';
import { CancelRegisterResponseDto } from './dto/cancel-register-response.dto';
import { PreauthorizeRegisterRequestDto } from './dto/preauthorize-register-request.dto';
import { PreauthorizeRegisterResponseDto } from './dto/preauthorize-register-response.dto';
@ApiTags('Obesity Register')
@Controller('register')
export class ObesityRegisterController {
  constructor(
    private readonly obesityRegisterService: ObesityRegisterService,
  ) {}

  @Post('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Check whether the patient has already registered in the Obesity Tracking system',
  })
  @ApiBody({
    type: RegisterStatusRequestDto,
  })
  @ApiBaseResponse(RegisterStatusResponseDto)
  async getRegisterStatus(
    @Body() request: RegisterStatusRequestDto,
  ): Promise<RegisterStatusResponseDto> {
    console.log('status Request:', request);
    return this.obesityRegisterService.getRegisterStatus(request);
  }

  @Post('patient-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get patient information from HIS',
  })
  @ApiBody({
    type: RegisterPatientInfoRequestDto,
  })
  async getPatientInfo(
    @Body() request: RegisterPatientInfoRequestDto,
  ) {
    return this.obesityRegisterService.getPatientInfo(request);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Register patient',
  })
  @ApiBody({
    type: RegisterRequestDto,
  })
  @ApiBaseResponse(RegisterResponseDto)
  async register(
    @Body() request: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {

    return this.obesityRegisterService.register(request);
  }
@Post('summary')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Get obesity summary',
})
@ApiBody({
  type: SummaryRequestDto,
})
@ApiBaseResponse(SummaryResponseDto)
async getSummary(
  @Body() request: SummaryRequestDto,
): Promise<SummaryResponseDto> {
  return this.obesityRegisterService.getSummary(request);
}
@Get(':hn/next-appointment')
@ApiOperation({
  summary: 'Get next appointment',
})
@ApiOkResponse({
  type: NextAppointmentResponseDto,
})
async getNextAppointment(
  @Param('hn') hn: string,
): Promise<NextAppointmentResponseDto> {
  return this.obesityRegisterService.getNextAppointment(hn);
}
@Post('cancel')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Cancel obesity registration',
  description:
    'Cancel an existing obesity registration by HN.',
})
@ApiBody({
  type: CancelRegisterRequestDto,
})
@ApiBaseResponse(CancelRegisterResponseDto)
async cancelRegister(
  @Body() request: CancelRegisterRequestDto,
): Promise<CancelRegisterResponseDto> {
  console.log('Cancel Register HN:', request);
  return this.obesityRegisterService.cancelRegister(
    request,
  );
}
@Post('preauthorize')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Pre-authorize obesity registration',
  description:
    'Pre-authorize an existing obesity registration by HN.',
})
@ApiBody({
  type: PreauthorizeRegisterRequestDto,
})
@ApiBaseResponse(PreauthorizeRegisterResponseDto)
async preauthorizeRegister(
  @Body() request: PreauthorizeRegisterRequestDto,
): Promise<PreauthorizeRegisterResponseDto> {
  console.log(
    'Pre-authorize Register HN:',
    request,
  );

  return this.obesityRegisterService.preAuthorizeRegister(
    request,
  );
}
}
