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
import { CancelRegisterRequestDto } from './dto/cancel-register-request.dto';
import { CancelRegisterResponseDto } from './dto/cancel-register-response.dto';

import { PreauthorizeRegisterRequestDto } from './dto/preauthorize-register-request.dto';
import { PreauthorizeRegisterResponseDto } from './dto/preauthorize-register-response.dto';
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
  // =========================================================
  // 1. Check duplicate registration
  // =========================================================
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

  // =========================================================
  // 2. Call HIS - Get patient information
  // =========================================================
  const hisResponse =
    await this.hisService.registerPatient(
      request.hn,
    );

  console.log(
    'HIS Register Patient Response:',
    hisResponse,
  );

  const patient =
    hisResponse.PatientInfo;

  // =========================================================
  // 3. Validate patient visit
  // =========================================================
  if (!patient.LocationCode?.trim()) {
    throw new BadRequestException(
      'Patient visit not found.',
    );
  }

  // =========================================================
  // 4. Validate weight
  // =========================================================
  if (!patient.Weight?.trim()) {
    throw new BadRequestException(
      'Patient weight information is invalid.',
    );
  }

  // =========================================================
  // 5. Convert DOB
  //
  // HIS may return Buddhist Era
  // Example:
  // 2535-08-12
  //
  // Convert:
  // 2535 - 543 = 1992
  // =========================================================
  let dob: Date;

  if (patient.DOB?.trim()) {
    const [
      year,
      month,
      day,
    ] = patient.DOB
      .split('-')
      .map(Number);

    const convertedYear =
      year > 2400
        ? year - 543
        : year;

    dob = new Date(
      convertedYear,
      month - 1,
      day,
    );
  } else {
    throw new BadRequestException(
      'Patient date of birth is invalid.',
    );
  }

  // =========================================================
  // 6. Prepare initial baseline values
  //
  // These values come from registerPatient()
  // and may be replaced by historical observations later.
  // =========================================================
  const baselineHeight =
    patient.Height?.trim()
      ? Number(patient.Height)
      : 0;

  const baselineWeight =
    patient.Weight?.trim()
      ? Number(patient.Weight)
      : 0;

  const baselineBmi =
    patient.BMI?.trim()
      ? Number(patient.BMI)
      : 0;

  // =========================================================
  // 7. Create obesity register FIRST
  //
  // Registration must exist before
  // historical observations are saved.
  // =========================================================
  const register =
    this.obesityRegisterRepository.create({
      patientId:
        patient.PatientID,

      userId:
        request.userId,

      hn:
        patient.HN,

      fullname:
        patient.Fullname,

      gender:
        patient.Gender,

      dob,

      baselineHeight,

      baselineWeight,

      baselineBmi,

      // New field
      // Will be updated from ObservationInfo[0]
      // after historical API call.
      baselineDate:
        undefined,

      obesityNumber:
        null,

      surgeryStatus:
        'PENDING',
    });

  const savedRegister =
    await this.obesityRegisterRepository.save(
      register,
    );

  console.log(
    `Obesity Register created. Register ID: ${savedRegister.registerId}`,
  );

  // =========================================================
  // 8. Get historical weight from HIS
  //
  // IMPORTANT:
  // Historical API failure must NOT cause
  // registration failure.
  // =========================================================
  try {
    const observationResponse =
      await this.hisService.getPatientsObservations(
        patient.HN,
      );

    const observations =
      observationResponse
        .ObservationInfo ?? [];

    console.log(
      `Historical weight found: ${observations.length} records`,
    );

    // =======================================================
    // 9. Determine BASELINE from ObservationInfo[0]
    //
    // IMPORTANT BUSINESS RULE
    //
    // baseline.date
    // baseline.weight
    //
    // MUST come from the SAME observation:
    //
    // observations[0]
    //
    // Example:
    //
    // ObservationInfo[0]
    // {
    //   VisitDate: 2026-01-08,
    //   Weight: 87
    // }
    //
    // => baselineDate   = 2026-01-08
    // => baselineWeight = 87
    //
    // Do NOT select weight and date
    // from different observations.
    // =======================================================

    const firstObservation =
      observations.length > 0
        ? observations[0]
        : undefined;

    // =======================================================
    // 10. Save historical observations
    // =======================================================
    for (
      const observation of observations
    ) {
      const height =
        observation.Height?.trim()
          ? Number(
              observation.Height,
            )
          : undefined;

      const weight =
        observation.Weight?.trim()
          ? Number(
              observation.Weight,
            )
          : undefined;

      // -----------------------------------------------------
      // Skip observation if weight is invalid
      // -----------------------------------------------------
      if (
        weight === undefined ||
        Number.isNaN(weight)
      ) {
        console.log(
          'Skip observation because weight is invalid:',
          observation,
        );

        continue;
      }

      // -----------------------------------------------------
      // Calculate BMI
      // -----------------------------------------------------
      let bmi:
        | number
        | undefined;

      if (
        height !== undefined &&
        !Number.isNaN(height) &&
        height > 0
      ) {
        const heightInMeter =
          height / 100;

        bmi = Number(
          (
            weight /
            (
              heightInMeter *
              heightInMeter
            )
          ).toFixed(2),
        );
      }

      // -----------------------------------------------------
      // Convert VisitDate
      //
      // Keep date only:
      // YYYY-MM-DD
      // -----------------------------------------------------
      const visitDate =
        observation.VisitDate
          ?.trim();

      const weightAt =
        visitDate
          ? new Date(
              `${visitDate}T00:00:00`,
            )
          : undefined;

      // -----------------------------------------------------
      // Create weight transaction
      // -----------------------------------------------------
      const transaction =
        this.obesityWeightTransactionRepository.create({
          registerId:
            savedRegister.registerId,

          patientId:
            observation.PatientID,

          hn:
            observation.HN,

          episodeId:
            observation.EpisodeID !==
            null
              ? String(
                  observation.EpisodeID,
                )
              : undefined,

          vn:
            observation.VN?.trim()
              ? observation.VN
              : undefined,

          height,

          weight,

          bmi,

          weightAt,

          isWeightAtHospital:
            true,
        });

      await this.obesityWeightTransactionRepository.save(
        transaction,
      );

      console.log(
        'Weight transaction created:',
        {
          transactionId:
            transaction.transactionId,

          weight:
            transaction.weight,

          height:
            transaction.height,

          bmi:
            transaction.bmi,

          weightAt:
            transaction.weightAt,
        },
      );
    }

    // =======================================================
    // 11. Update BASELINE
    //
    // Weight + Date MUST come from ObservationInfo[0]
    // =======================================================
    if (firstObservation) {
      const firstWeight =
        firstObservation.Weight?.trim()
          ? Number(
              firstObservation.Weight,
            )
          : undefined;

      const firstVisitDate =
        firstObservation.VisitDate?.trim();

      // -----------------------------------------------------
      // 11.1 Update baseline weight
      //
      // From observations[0]
      // -----------------------------------------------------
      if (
        firstWeight !== undefined &&
        !Number.isNaN(firstWeight)
      ) {
        savedRegister.baselineWeight =
          firstWeight;
      }

      // -----------------------------------------------------
      // 11.2 Update baseline date
      //
      // From observations[0]
      //
      // Store as PostgreSQL DATE
      // Example:
      // 2026-01-08
      // -----------------------------------------------------
      if (firstVisitDate) {
        savedRegister.baselineDate =
          new Date(
            `${firstVisitDate}T00:00:00`,
          );
      }

      // -----------------------------------------------------
      // 11.3 Update baseline height
      //
      // Business Rule:
      //
      // 1. If PatientInfo already has valid height,
      //    keep it.
      //
      // 2. If PatientInfo height is empty/zero,
      //    find the FIRST observation in order
      //    that has valid height.
      //
      // IMPORTANT:
      // This height does NOT change the baseline
      // date/weight source.
      //
      // baseline date/weight remain from observations[0].
      // -----------------------------------------------------
      if (
        !savedRegister.baselineHeight ||
        Number(
          savedRegister.baselineHeight,
        ) <= 0
      ) {
        const observationWithHeight =
          observations.find(
            (observation) => {
              const height =
                observation.Height?.trim()
                  ? Number(
                      observation.Height,
                    )
                  : undefined;

              return (
                height !== undefined &&
                !Number.isNaN(height) &&
                height > 0
              );
            },
          );

        if (
          observationWithHeight
        ) {
          savedRegister.baselineHeight =
            Number(
              observationWithHeight.Height,
            );

          console.log(
            'Baseline height found from observation:',
            {
              visitDate:
                observationWithHeight.VisitDate,

              height:
                observationWithHeight.Height,
            },
          );
        }
      }

      // -----------------------------------------------------
      // 11.4 Recalculate baseline BMI
      //
      // baseline BMI =
      //
      // weight /
      // (height in meter ^ 2)
      //
      // Weight comes from observations[0]
      // Height comes from:
      // PatientInfo OR first valid observation
      // -----------------------------------------------------
      if (
        Number(
          savedRegister.baselineWeight,
        ) > 0 &&
        Number(
          savedRegister.baselineHeight,
        ) > 0
      ) {
        const heightInMeter =
          Number(
            savedRegister.baselineHeight,
          ) / 100;

        savedRegister.baselineBmi =
          Number(
            (
              Number(
                savedRegister.baselineWeight,
              ) /
              (
                heightInMeter *
                heightInMeter
              )
            ).toFixed(2),
          );
      }

      // -----------------------------------------------------
      // 11.5 Save updated baseline
      // -----------------------------------------------------
      await this.obesityRegisterRepository.save(
        savedRegister,
      );

      console.log(
        'Obesity Register baseline updated:',
        {
          registerId:
            savedRegister.registerId,

          baselineDate:
            savedRegister.baselineDate
              ? savedRegister
                  .baselineDate
                  .toISOString()
                  .substring(0, 10)
              : null,

          baselineWeight:
            savedRegister.baselineWeight,

          baselineHeight:
            savedRegister.baselineHeight,

          baselineBmi:
            savedRegister.baselineBmi,
        },
      );
    } else {
      // =====================================================
      // 12. No historical transaction
      // =====================================================
      console.log(
        `No historical observation found for HN ${patient.HN}`,
      );
    }
  } catch (error) {
    // =======================================================
    // IMPORTANT:
    // Historical API failure must NOT rollback
    // registration.
    // =======================================================
    console.error(
      `Unable to retrieve historical weight for HN ${patient.HN}`,
      error,
    );
  }

  // =========================================================
  // 13. Return registration response
  // =========================================================
  return {
    registered:
      true,

    registerId:
      savedRegister.registerId,

    userId:
      savedRegister.userId ??
      null,

    patientId:
      savedRegister.patientId ??
      null,

    hn:
      savedRegister.hn ??
      null,

    fullname:
      savedRegister.fullname ??
      null,

    obesityNumber:
      savedRegister.obesityNumber ??
      null,
  };
}
/*async register(
  request: RegisterRequestDto,
): Promise<RegisterResponseDto> {
  // 1. Check duplicate registration
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

  // 2. Call HIS
  const hisResponse =
    await this.hisService.registerPatient(
      request.hn,
    );

  const patient = hisResponse.PatientInfo;

  // 3. Validate patient visit
  if (!patient.LocationCode?.trim()) {
    throw new BadRequestException(
      'Patient visit not found.',
    );
  }

  // 4. Validate weight
  if (!patient.Weight?.trim()) {
    throw new BadRequestException(
      'Patient weight information is invalid.',
    );
  }

  // 5. Create registration
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

      // Initial status flags
      isCancelled: false,
      isPreauthorized: false,
      isOperationScheduled: false,
      isBaselineAccepted: false,
    });

  // 6. Save to database
  const savedRegister =
    await this.obesityRegisterRepository.save(
      register,
    );

  // 7. Response
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
} */
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
async cancelRegister(
  request: CancelRegisterRequestDto,
): Promise<CancelRegisterResponseDto> {
  console.log('Cancel Register Request:', request.hn);
  const register =
    await this.obesityRegisterRepository.findOne({
      where: {
        hn: request.hn,
      },
    });

  if (!register) {
    throw new NotFoundException(
      `HN ${request.hn} not found.`,
    );
  }

  register.isCancelled = true;

  const savedRegister =
    await this.obesityRegisterRepository.save(
      register,
    );

  return {
    registerId: savedRegister.registerId,
    userId: savedRegister.userId!,
    patientId: savedRegister.patientId!,
    hn: savedRegister.hn!,
    fullname: savedRegister.fullname!,
    is_cancelled:
      savedRegister.isCancelled ?? false,
  };
}
async preAuthorizeRegister(
  request: PreauthorizeRegisterRequestDto,
): Promise<PreauthorizeRegisterResponseDto> {
  const register =
    await this.obesityRegisterRepository.findOne({
      where: {
        hn: request.hn,
      },
    });

  if (!register) {
    throw new NotFoundException(
      `HN ${request.hn} not found.`,
    );
  }

  register.isPreauthorized = true;

  const savedRegister =
    await this.obesityRegisterRepository.save(
      register,
    );

  return {
    registerId: savedRegister.registerId,
    userId: savedRegister.userId!,
    patientId: savedRegister.patientId!,
    hn: savedRegister.hn!,
    fullname: savedRegister.fullname!,
    is_preauthorized:
      savedRegister.isPreauthorized!,
  };
}
private calculateBmi(
  height: number,
  weight: number,
): number {
  const heightInMeter =
    height / 100;

  const bmi =
    weight /
    (heightInMeter * heightInMeter);

  return Number(
    bmi.toFixed(2),
  );
}
}
