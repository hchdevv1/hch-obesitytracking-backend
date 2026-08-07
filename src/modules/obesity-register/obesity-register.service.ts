/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HisService } from '../his/his.service';
import {
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { RegisterPatientInfoRequestDto } from './dto/register-patient-info-request.dto';
import { RegisterPatientInfoResponseDto } from './dto/register-patient-info-response.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterStatusRequestDto } from './dto/register-status-request.dto';
import { RegisterStatusResponseDto } from './dto/register-status-response.dto';
import { ObesityRegister } from './entities/obesity-register.entity';
import { ObesitySummaryCalculator } from '../obesity/calculators';
import { SummaryRequestDto } from './dto/summary-request.dto';
import { SummaryResponseDto } from './dto/summary-response.dto';
import { DEFAULT_TARGET_PERCENT } from '../obesity/constants/obesity.constants';
import { HisNextAppointmentResponse } from './interfaces/his-next-appointment-response.interface';
import { NextAppointmentResponseDto } from './dto/next-appointment-response.dto';
import { ObesityWeightTransaction } from '../obesity-weight-transaction/entities/obesity-weight-transaction.entity';
@Injectable()
export class ObesityRegisterService {
  constructor(
    @InjectRepository(ObesityRegister)
    private readonly obesityRegisterRepository: Repository<ObesityRegister>,
    @InjectRepository(ObesityWeightTransaction)
  private readonly obesityWeightTransactionRepository: Repository<ObesityWeightTransaction>,

    private readonly hisService: HisService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getRegisterStatus(
    request: RegisterStatusRequestDto,
  ): Promise<RegisterStatusResponseDto> {

    const register = await this.obesityRegisterRepository.findOne({
      where: {
        userId: request.userId,
      },
      select: {
        registerId: true,
        userId: true,
        patientId: true,
        hn: true,
        fullname: true,
        obesityNumber: true,
      },
    });

    if (!register) {
      return {
        registered: false,
        registerId: null,
        userId: null,
        patientId: null,
        hn: null,
        fullname: null,
        obesityNumber: null,
      };
    }

    return {
      registered: true,
      registerId: register.registerId,
      userId: register.userId ?? null,
      patientId: register.patientId ?? null,
      hn: register.hn ?? null,
      fullname: register.fullname ?? null,
      obesityNumber: register.obesityNumber ?? null,
    };
  }

  async getPatientInfo(
    request: RegisterPatientInfoRequestDto,
  ): Promise<RegisterPatientInfoResponseDto> {
    const hisResponse = await this.hisService.registerPatient(
      request.hn,
    );

    const patient = hisResponse.PatientInfo;

    return {
      patientInfo: {
        hn: patient.HN,
        patientId: patient.PatientID,
        fullname: patient.Fullname,
        gender: patient.Gender,
        dob: patient.DOB,
        vn: patient.VN || null,
        episodeId: patient.EpisodeID,
        visitDate: patient.VisitDate || null,
        locationCode: patient.LocationCode || null,
        location: patient.Location || null,
        careproviderCode:
          patient.CareproviderCode || null,
        careprovider: patient.Careprovider || null,
        height: patient.Height || null,
        weight: patient.Weight || null,
        bmi: patient.BMI || null,
      },
    };
  }

  async register(
    request: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    // Check duplicate registration
    const existing =
      await this.obesityRegisterRepository.findOne({
        where: {
          userId: request.userId,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Patient already registered.',
      );
    }

    // Call HIS
    const hisResponse =
      await this.hisService.registerPatient(
        request.hn,
      );
      console.log('HIS Response:', hisResponse);
    const patient = hisResponse.PatientInfo;

    // Validate patient visit
    if (!patient.LocationCode?.trim()) {
      throw new BadRequestException(
        'Patient visit not found.',
      );
    }

    // Validate weight
    if (!patient.Weight?.trim()) {
      throw new BadRequestException(
        'Patient weight information is invalid.',
      );
    }

    // Create entity
    const register =
      this.obesityRegisterRepository.create({
        patientId: patient.PatientID,
        userId: request.userId,
        hn: patient.HN,
        fullname: patient.Fullname,
        gender: patient.Gender,
        dob: new Date(patient.DOB),
        baselineHeight: Number(patient.Height),
        baselineWeight: Number(patient.Weight),
        baselineBmi: Number(patient.BMI),
        obesityNumber: null,
        surgeryStatus: 'PENDING',
      });

    // Save database
    const savedRegister =
      await this.obesityRegisterRepository.save(
        register,
      );

    // Response
    return {
      registered: true,
      registerId: savedRegister.registerId,
      userId: savedRegister.userId ?? null,
      patientId: savedRegister.patientId ?? null,
      hn: savedRegister.hn ?? null,
      fullname: savedRegister.fullname ?? null,
      obesityNumber:
        savedRegister.obesityNumber ?? null,
    };
  }
 async getSummary(
  request: SummaryRequestDto,
): Promise<SummaryResponseDto> {
  const register = await this.obesityRegisterRepository.findOne({
    where: {
      hn: request.hn,
    },
  });

  console.log('Register:', register);

  if (!register) {
    throw new NotFoundException(
      `HN ${request.hn} not found.`,
    );
  }

  const latestWeightTransaction =
    await this.obesityWeightTransactionRepository.findOne({
      where: {
        registerId: register.registerId,
      },
      order: {
        weightAt: 'DESC',
      },
    });

  console.log(
    'Latest Weight Transaction:',
    latestWeightTransaction,
  );

  const baselineWeight = Number(register.baselineWeight);

  const currentWeight = latestWeightTransaction
    ? Number(latestWeightTransaction.weight)
    : baselineWeight;

  const summary = ObesitySummaryCalculator.calculate({
    baselineWeight,
    currentWeight,
    targetPercent: DEFAULT_TARGET_PERCENT,
  });

  return {
    hn: register.hn,
    fullname: register.fullname ?? null,
    registerId: register.registerId ?? null,
    baselineWeight: Number(
      summary.baselineWeight.toFixed(1),
    ),

    currentWeight: Number(
      summary.currentWeight.toFixed(1),
    ),

    targetPercent: summary.targetPercent,

    targetWeight: Number(
      summary.targetWeight.toFixed(1),
    ),

    weightLost: Number(
      summary.weightLost.toFixed(1),
    ),

    remainingWeight: Number(
      summary.remainingWeight.toFixed(1),
    ),

    weightLossPercent: Number(
      summary.weightLossPercent.toFixed(2),
    ),

    goalProgressPercent: Number(
      summary.goalProgressPercent.toFixed(2),
    ),

    goalAchieved: summary.goalAchieved,
  };
}

async getNextAppointment(
  hn: string,
): Promise<NextAppointmentResponseDto> {
  const baseUrl = this.configService.get<string>('HIS_API_BASE_URL');

  if (!baseUrl) {
    throw new InternalServerErrorException(
      'HIS_API_BASE_URL is not configured.',
    );
  }

  const url = `${baseUrl}/nextAppointment/${hn}`;

  try {
    const { data } = await firstValueFrom(
      this.httpService.get<HisNextAppointmentResponse>(url),
    );

    const appointment = data.AppointmentInfo;

    if (!appointment) {
      return {
        appointment: null,
      };
    }
console.log('Next Appointment:', appointment);
    return {
      appointment: {
        hn: appointment.HN,
        patientId: appointment.PatientID,
        appointmentDate: appointment.ApptDate,
        appointmentTime: appointment.ApptTime,
        locationCode: appointment.LocationCode,
        location: appointment.Location,
      },
    };
  } catch (error) {
    const axiosError = error as AxiosError;

    throw new BadGatewayException({
      message: 'Unable to retrieve next appointment from HIS.',
      error: axiosError.message,
    });
  }
}
}
