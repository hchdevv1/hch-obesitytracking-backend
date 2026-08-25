import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AdminService } from './admin.service';
import { PatientListRequestDto } from './dto/patient-list-request.dto';
import { PatientListResponseDto } from './dto/patient-list-response.dto';

import { MissingWeightRequestDto } from './dto/missing-weight-request.dto';
import { MissingWeightResponseDto } from './dto/missing-weight-response.dto';

import { SuccessPatientRequestDto } from './dto/success-patient-request.dto';
import { SuccessPatientResponseDto } from './dto/success-patient-response.dto';

import { WeightLossNearTargetRequestDto } from './dto/weight-loss-near-target-request.dto';
import { WeightLossNearTargetResponseDto } from './dto/weight-loss-near-target-response.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

 @Post('patient/list')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Get patient list',
  description:
    'Get obesity patient list for admin. Patients are ordered by register date descending.',
})
@ApiBody({
  type: PatientListRequestDto,
})
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Patient list retrieved successfully.',
  type: PatientListResponseDto,
})
async getPatientList(
  @Body() request: PatientListRequestDto,
): Promise<PatientListResponseDto> {
  return this.adminService.getPatientList(request);
}
@Post('patient/missing-weight')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Get patients with missing weight',
  description:
    'Get patients who have surgery status PENDING and have not recorded weight for more than 14 days.',
})
@ApiBody({
  type: MissingWeightRequestDto,
})
@ApiResponse({
  status: HttpStatus.OK,
  description:
    'Missing weight patient list retrieved successfully.',
  type: MissingWeightResponseDto,
})
async getMissingWeight(
  @Body() request: MissingWeightRequestDto,
): Promise<MissingWeightResponseDto> {
  return this.adminService.getMissingWeight(
    request,
  );
}
@Post('patient/success')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Get successful patients',
  description:
    'Get patients who achieved weight loss success of at least 5%.',
})
@ApiBody({
  type: SuccessPatientRequestDto,
})
@ApiResponse({
  status: HttpStatus.OK,
  description:
    'Success patient list retrieved successfully.',
  type: SuccessPatientResponseDto,
})
async getSuccessPatients(
  @Body() request: SuccessPatientRequestDto,
): Promise<SuccessPatientResponseDto> {
  return this.adminService.getSuccessPatients(
    request,
  );
}
@Post('patient/weight-loss-near-target')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Get patients near weight loss target',
  description:
    'Get patients with weight loss between 4% and less than 5%.',
})
@ApiBody({
  type: WeightLossNearTargetRequestDto,
})
@ApiResponse({
  status: HttpStatus.OK,
  description:
    'Patients near weight loss target retrieved successfully.',
  type: WeightLossNearTargetResponseDto,
})
async getWeightLossNearTarget(
  @Body()
  request: WeightLossNearTargetRequestDto,
): Promise<WeightLossNearTargetResponseDto> {
  return this.adminService.getWeightLossNearTarget(
    request,
  );
}
}
