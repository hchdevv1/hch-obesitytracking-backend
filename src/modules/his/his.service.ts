/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { HisRegisterPatientRequest } from './interfaces/his-register-patient-request.interface';
import { HisRegisterPatientResponse } from './interfaces/his-register-patient-response.interface';
import { HisPatientsObservationsRequest } from './interfaces/his-patients-observations-request.interface';
import { HisPatientsObservationsResponse } from './interfaces/his-patients-observations-response.interface';

@Injectable()
export class HisService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get patient information from HIS
   */
  async registerPatient(
    hn: string,
  ): Promise<HisRegisterPatientResponse> {
    const baseUrl =
      this.configService.get<string>(
        'HIS_API_BASE_URL',
      );

    const payload: HisRegisterPatientRequest = {
      HN: hn,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<HisRegisterPatientResponse>(
          `${baseUrl}/registerPatient`,
          payload,
        ),
      );

      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to connect to HIS service.',
      );
    }
  }

  /**
   * Get patient's historical weight observations
   * from HIS.
   *
   * HIS API already filters the data to the
   * required historical period.
   */
  async getPatientsObservations(
    hn: string,
  ): Promise<HisPatientsObservationsResponse> {
    const baseUrl =
      this.configService.get<string>(
        'HIS_API_BASE_URL',
      );

    const payload: HisPatientsObservationsRequest = {
      Patients: [
        {
          HN: hn,
        },
      ],
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<HisPatientsObservationsResponse>(
          `${baseUrl}/patientsObservations`,
          payload,
        ),
      );

      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to retrieve patient observations from HIS.',
      );
    }
  }
}
