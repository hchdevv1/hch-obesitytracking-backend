import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  In,
  Repository,
} from 'typeorm';

import { ObesityRegister } from '../obesity-register/entities/obesity-register.entity';
import { ObesityWeightTransaction } from '../obesity-weight-transaction/entities/obesity-weight-transaction.entity';

import { PatientListRequestDto } from './dto/patient-list-request.dto';
import { PatientListResponseDto } from './dto/patient-list-response.dto';
import { PatientListItemDto } from './dto/patient-list-item.dto';

import { MissingWeightRequestDto } from './dto/missing-weight-request.dto';
import { MissingWeightResponseDto } from './dto/missing-weight-response.dto';
import { MissingWeightItemDto } from './dto/missing-weight-item.dto';

import { SuccessPatientRequestDto } from './dto/success-patient-request.dto';
import { SuccessPatientResponseDto } from './dto/success-patient-response.dto';
import { SuccessPatientItemDto } from './dto/success-patient-item.dto';

import { AdminPatientStatusDto } from './dto/admin-patient-status.dto';

import { WeightLossNearTargetRequestDto } from './dto/weight-loss-near-target-request.dto';
import { WeightLossNearTargetResponseDto } from './dto/weight-loss-near-target-response.dto';
import { WeightLossNearTargetItemDto } from './dto/weight-loss-near-target-item.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ObesityRegister)
    private readonly obesityRegisterRepository: Repository<ObesityRegister>,

    @InjectRepository(ObesityWeightTransaction)
    private readonly obesityWeightTransactionRepository: Repository<ObesityWeightTransaction>,
  ) {}

  async getPatientList(
    request: PatientListRequestDto,
  ): Promise<PatientListResponseDto> {
    console.log(
      '========== Admin Patient List ==========',
    );

    console.log('Request:', request);

    // Step 1 : Pagination
    const page = request.page ?? 1;
    const pageSize = request.pageSize ?? 20;

    // Step 2 : Get Patient Registers
    const {
      registers,
      total,
    } = await this.getPatientRegisters(
      request,
      page,
      pageSize,
    );

    console.log(
      'Register Count:',
      registers.length,
    );

    console.log(
      'Total Patient:',
      total,
    );

    // Step 3 : Get Register IDs
    const registerIds =
      registers.map(
        (register) =>
          register.registerId,
      );

    // Step 4 : Get Latest Weight
    const latestWeights =
      await this.getLatestWeights(
        registerIds,
      );

    console.log(
      'Latest Weight Count:',
      latestWeights.length,
    );

    // Step 5 : Build Response
    const patients =
      this.buildPatientListResponse(
        registers,
        latestWeights,
      );

    // Step 6 : Return
    return {
      total,
      page,
      pageSize,
      patients,
    };
  }

private async getPatientRegisters(
    request: PatientListRequestDto,
    page: number,
    pageSize: number,
  ): Promise<{
    registers: ObesityRegister[];
    total: number;
  }> {
    const skip =
      (page - 1) * pageSize;

    const keyword =
      request.keyword?.trim() ?? '';

    const query =
      this.obesityRegisterRepository
        .createQueryBuilder('register');

    // Keyword Search
    if (keyword) {
      const searchKeyword =
        `%${keyword}%`;

      query.andWhere(
        new Brackets((qb) => {
          qb.where(
            'register.hn ILIKE :keyword',
            {
              keyword: searchKeyword,
            },
          )
            .orWhere(
              'register.fullname ILIKE :keyword',
              {
                keyword: searchKeyword,
              },
            )
            .orWhere(
              'register.obesity_number ILIKE :keyword',
              {
                keyword: searchKeyword,
              },
            );
        }),
      );
    }

    // Order by Register Date
    query.orderBy(
      'register.created_at',
      'DESC',
    );

    // Pagination
    query.skip(skip).take(pageSize);

    const [
      registers,
      total,
    ] = await query.getManyAndCount();

    return {
      registers,
      total,
    };
  }

private async getLatestWeights(
    registerIds: string[],
  ): Promise<
    ObesityWeightTransaction[]
  > {
    if (registerIds.length === 0) {
      return [];
    }

    /*
     * Get all transactions belonging
     * to the current page patients.
     */
    const transactions =
      await this.obesityWeightTransactionRepository.find({
        where: {
          registerId: In(registerIds),
        },
        order: {
          weightAt: 'DESC',
        },
      });

    /*
     * Keep only the latest transaction
     * for each registerId.
     */
    const latestWeightMap =
      new Map<
        string,
        ObesityWeightTransaction
      >();

    for (const transaction of transactions) {
      if (
        !latestWeightMap.has(
          transaction.registerId,
        )
      ) {
        latestWeightMap.set(
          transaction.registerId,
          transaction,
        );
      }
    }

    return Array.from(
      latestWeightMap.values(),
    );
  }
/*-----*/
async getSuccessPatients(
  request: SuccessPatientRequestDto,
): Promise<SuccessPatientResponseDto> {
  const page = request.page ?? 1;
  const pageSize = request.pageSize ?? 20;

  const {
    rows,
    total,
  } = await this.getSuccessPatientRows(
    request,
    page,
    pageSize,
  );

  const patients =
    this.buildSuccessPatientResponse(rows);

  return {
    total,
    page,
    pageSize,
    patients,
  };
}
private async getSuccessPatientRows(
  request: SuccessPatientRequestDto,
  page: number,
  pageSize: number,
): Promise<{
  rows: any[];
  total: number;
}> {
  const keyword =
    request.keyword?.trim() ?? '';

  const skip =
    (page - 1) * pageSize;

  /*
   * ============================================================
   * Latest Weight SubQuery
   * ============================================================
   *
   * เอา Weight Transaction ล่าสุด
   * ของแต่ละ register_id
   *
   * ใช้ weight_at เป็นตัวกำหนดว่า
   * transaction ไหนคือรายการล่าสุด
   */
  const latestWeightSubQuery =
    this.obesityWeightTransactionRepository
      .createQueryBuilder('weight')
      .select([
        'weight.register_id AS register_id',

        'weight.weight_at AS weight_at',

        'weight.weight AS weight',

        'weight.bmi AS bmi',

        'weight.is_weight_at_hospital AS is_weight_at_hospital',
      ])
      .distinctOn([
        'weight.register_id',
      ])
      .orderBy(
        'weight.register_id',
        'ASC',
      )
      .addOrderBy(
        'weight.weight_at',
        'DESC',
      );

  /*
   * ============================================================
   * Main Query
   * ============================================================
   */
  const query =
    this.obesityRegisterRepository
      .createQueryBuilder('register')
      .leftJoin(
        `(${latestWeightSubQuery.getQuery()})`,
        'latest_weight',
        'latest_weight.register_id = register.register_id',
      )
      .setParameters(
        latestWeightSubQuery.getParameters(),
      );

  /*
   * ============================================================
   * Select
   * ============================================================
   */
  query.select([
    /*
     * ----------------------------------------------------------
     * Basic
     * ----------------------------------------------------------
     */
    'register.register_id AS register_id',

    'register.user_id AS user_id',

    'register.hn AS hn',

    'register.fullname AS fullname',

    'register.obesity_number AS obesity_number',

    /*
     * ----------------------------------------------------------
     * Register Date
     * ----------------------------------------------------------
     */
    'register.created_at AS register_date',

    /*
     * ----------------------------------------------------------
     * Baseline
     * ----------------------------------------------------------
     *
     * baseline_date
     *   → วันที่ของ ObservationInfo[0]
     *
     * baseline_weight
     *   → น้ำหนักจาก ObservationInfo[0]
     *
     * baseline_height
     *   → Height ที่ใช้ตอนสร้าง baseline
     *
     * baseline_bmi
     *   → BMI ของ baseline
     */
    'register.baseline_date AS baseline_date',

    'register.baseline_height AS baseline_height',

    'register.baseline_weight AS baseline_weight',

    'register.baseline_bmi AS baseline_bmi',

    /*
     * ----------------------------------------------------------
     * Status
     * ----------------------------------------------------------
     */
    'register.is_cancelled AS is_cancelled',

    'register.is_baseline_accepted AS is_baseline_accepted',

    'register.is_request_preauthorized AS is_request_preauthorized',

    'register.is_preauthorized AS is_preauthorized',

    'register.is_operation_scheduled AS is_operation_scheduled',

    'register.is_success AS is_success',

    'register.success_date AS success_date',

    /*
     * ----------------------------------------------------------
     * Surgery
     * ----------------------------------------------------------
     */
    'register.surgery_status AS surgery_status',

    /*
     * ----------------------------------------------------------
     * Latest Weight
     * ----------------------------------------------------------
     *
     * ถ้ามี transaction
     *   → ใช้น้ำหนักล่าสุด
     *
     * ถ้าไม่มี transaction
     *   → build response จะ fallback
     *      เป็น baseline weight
     */
    'latest_weight.weight_at AS last_weight_at',

    'latest_weight.weight AS last_weight',

    'latest_weight.bmi AS last_bmi',

    'latest_weight.is_weight_at_hospital AS is_weight_at_hospital',
  ]);

  /*
   * ============================================================
   * Business Rule 1
   * ============================================================
   *
   * Surgery Status = PENDING
   */
  query.where(
    'register.surgery_status = :surgeryStatus',
    {
      surgeryStatus: 'PENDING',
    },
  );

  /*
   * ============================================================
   * Business Rule 2
   * ============================================================
   *
   * ต้องไม่ถูกยกเลิก
   */
  query.andWhere(
    'register.is_cancelled = :isCancelled',
    {
      isCancelled: false,
    },
  );

  /*
   * ============================================================
   * Business Rule 3
   * ============================================================
   *
   * ต้องเป็น Success
   */
  query.andWhere(
    'register.is_success = :isSuccess',
    {
      isSuccess: true,
    },
  );

  /*
   * ============================================================
   * Keyword Search
   * ============================================================
   */
  if (keyword) {
    const searchKeyword =
      `%${keyword}%`;

    query.andWhere(
      new Brackets((qb) => {
        qb.where(
          'register.hn ILIKE :keyword',
          {
            keyword: searchKeyword,
          },
        )
          .orWhere(
            'register.fullname ILIKE :keyword',
            {
              keyword: searchKeyword,
            },
          )
          .orWhere(
            'register.obesity_number ILIKE :keyword',
            {
              keyword: searchKeyword,
            },
          );
      }),
    );
  }

  /*
   * ============================================================
   * Sort
   * ============================================================
   *
   * Success ที่เกิดก่อน แสดงก่อน
   */
  query.orderBy(
    'register.success_date',
    'ASC',
  );

  query.addOrderBy(
    'register.created_at',
    'ASC',
  );

  /*
   * ============================================================
   * Pagination
   * ============================================================
   */
  query
    .offset(skip)
    .limit(pageSize);

  /*
   * ============================================================
   * Execute Data Query
   * ============================================================
   */
  const rows =
    await query.getRawMany();

  /*
   * ============================================================
   * Count Query
   * ============================================================
   */
  const countQuery =
    this.obesityRegisterRepository
      .createQueryBuilder('register');

  countQuery.select(
    'COUNT(register.register_id)',
    'total',
  );

  /*
   * Surgery Status
   */
  countQuery.where(
    'register.surgery_status = :surgeryStatus',
    {
      surgeryStatus: 'PENDING',
    },
  );

  /*
   * Not Cancelled
   */
  countQuery.andWhere(
    'register.is_cancelled = :isCancelled',
    {
      isCancelled: false,
    },
  );

  /*
   * Success
   */
  countQuery.andWhere(
    'register.is_success = :isSuccess',
    {
      isSuccess: true,
    },
  );

  /*
   * Keyword Search
   */
  if (keyword) {
    const searchKeyword =
      `%${keyword}%`;

    countQuery.andWhere(
      new Brackets((qb) => {
        qb.where(
          'register.hn ILIKE :keyword',
          {
            keyword: searchKeyword,
          },
        )
          .orWhere(
            'register.fullname ILIKE :keyword',
            {
              keyword: searchKeyword,
            },
          )
          .orWhere(
            'register.obesity_number ILIKE :keyword',
            {
              keyword: searchKeyword,
            },
          );
      }),
    );
  }

  /*
   * ============================================================
   * Execute Count Query
   * ============================================================
   */
  const countResult =
    await countQuery.getRawOne<{
      total: string;
    }>();

  const total =
    Number(
      countResult?.total ?? 0,
    );

  /*
   * ============================================================
   * Return
   * ============================================================
   */
  return {
    rows,
    total,
  };
}
private buildSuccessPatientResponse(
  rows: any[],
): SuccessPatientItemDto[] {
  return rows.map((row) => {
    /*
     * ============================================================
     * Baseline
     * ============================================================
     */
    const baselineWeight =
      Number(
        row.baseline_weight ?? 0,
      );

    const baselineHeight =
      Number(
        row.baseline_height ?? 0,
      );

    const baselineBmi =
      Number(
        row.baseline_bmi ?? 0,
      );

    /*
     * ============================================================
     * Baseline Date
     * ============================================================
     *
     * ใช้ obesity_register.baseline_date
     *
     * ไม่ใช้ register_date
     */
    const baselineDate =
      row.baseline_date
        ? this.formatDate(
            row.baseline_date,
          )
        : '';

    /*
     * ============================================================
     * Latest Weight
     * ============================================================
     *
     * ถ้ามี Weight Transaction
     *   → ใช้ Weight Transaction ล่าสุด
     *
     * ถ้าไม่มี
     *   → ใช้ Baseline Weight
     */
    const hasTransaction =
      row.last_weight_at !== null &&
      row.last_weight_at !== undefined;

    /*
     * ------------------------------------------------------------
     * Last Weight Date
     * ------------------------------------------------------------
     *
     * สำคัญ:
     *
     * ต้องใช้ weight_at ของ Transaction ล่าสุด
     *
     * ไม่ใช้ register_date
     * ไม่ใช้ baseline_date
     */
    const lastWeightDate =
      hasTransaction
        ? row.last_weight_at
        : row.baseline_date;

    /*
     * ------------------------------------------------------------
     * Last Weight
     * ------------------------------------------------------------
     */
    const lastWeight =
      hasTransaction
        ? Number(
            row.last_weight ?? 0,
          )
        : baselineWeight;

    /*
     * ============================================================
     * Goal
     * ============================================================
     *
     * เป้าหมายลดน้ำหนัก 5%
     */
    const targetPercent = 5;

    const targetWeight =
      Number(
        (
          baselineWeight *
          (
            1 -
            targetPercent / 100
          )
        ).toFixed(1),
      );

    /*
     * ============================================================
     * Weight Lost
     * ============================================================
     *
     * baseline - current
     *
     * ถ้าน้ำหนักลดลง
     *   → เป็นค่าบวก
     *
     * ถ้าน้ำหนักเพิ่มขึ้น
     *   → เป็นค่าลบ
     */
    const weightLost =
      Number(
        (
          baselineWeight -
          lastWeight
        ).toFixed(1),
      );

    /*
     * ============================================================
     * Weight Loss Percent
     * ============================================================
     */
    const weightLossPercent =
      baselineWeight > 0
        ? Number(
            (
              (
                weightLost /
                baselineWeight
              ) *
              100
            ).toFixed(2),
          )
        : 0;

    /*
     * ============================================================
     * Remaining Weight
     * ============================================================
     *
     * น้ำหนักที่เหลือเพื่อให้ถึงเป้าหมาย
     *
     * ถ้าถึงเป้าหมายแล้ว
     *   → 0
     */
    const remainingWeight =
      Math.max(
        0,
        Number(
          (
            lastWeight -
            targetWeight
          ).toFixed(1),
        ),
      );

    /*
     * ============================================================
     * Status
     * ============================================================
     */
    const status: AdminPatientStatusDto = {
      cancelled:
        Boolean(
          row.is_cancelled,
        ),

      baselineAccepted:
        Boolean(
          row.is_baseline_accepted,
        ),

      requestPreauthorized:
        Boolean(
          row.is_request_preauthorized,
        ),

      preauthorized:
        Boolean(
          row.is_preauthorized,
        ),

      operationScheduled:
        Boolean(
          row.is_operation_scheduled,
        ),

      success:
        Boolean(
          row.is_success,
        ),

      successDate:
        row.success_date
          ? this.formatDate(
              row.success_date,
            )
          : null,
    };

    /*
     * ============================================================
     * Response
     * ============================================================
     */
    return {
      /*
       * ----------------------------------------------------------
       * Basic
       * ----------------------------------------------------------
       */
      registerId:
        String(
          row.register_id,
        ),

      userId:
        row.user_id ?? '',

      hn:
        row.hn ?? '',

      fullname:
        row.fullname ?? '',

      /*
       * ----------------------------------------------------------
       * Register Date
       * ----------------------------------------------------------
       */
      registerDate:
        this.formatDate(
          row.register_date,
        ),

      /*
       * ----------------------------------------------------------
       * Baseline
       * ----------------------------------------------------------
       *
       * date:
       *   obesity_register.baseline_date
       *
       * weight:
       *   obesity_register.baseline_weight
       *
       * height:
       *   obesity_register.baseline_height
       *
       * bmi:
       *   obesity_register.baseline_bmi
       */
      baseline: {
        date:
          baselineDate,

        weight:
          baselineWeight,

        height:
          baselineHeight,

        bmi:
          baselineBmi,
      },

      /*
       * ----------------------------------------------------------
       * Goal
       * ----------------------------------------------------------
       */
      goal: {
        targetPercent,

        targetWeight,
      },

      /*
       * ----------------------------------------------------------
       * Last Weight
       * ----------------------------------------------------------
       *
       * date:
       *   latest weight transaction.weight_at
       *
       * ถ้าไม่มี transaction:
       *   baseline_date
       */
      lastWeight: {
        date:
          this.formatDate(
            lastWeightDate,
          ),

        weight:
          lastWeight,
      },

      /*
       * ----------------------------------------------------------
       * Weight Loss
       * ----------------------------------------------------------
       */
      weightLost,

      weightLossPercent,

      /*
       * ----------------------------------------------------------
       * Remaining Weight
       * ----------------------------------------------------------
       */
      remainingWeight,

      /*
       * ----------------------------------------------------------
       * Status
       * ----------------------------------------------------------
       */
      status,
    };
  });
}
/*-----*/
private buildPatientListResponse(
  registers: ObesityRegister[],
  latestWeights: ObesityWeightTransaction[],
): PatientListItemDto[] {
  const latestWeightMap =
    new Map<
      string,
      ObesityWeightTransaction
    >();

  for (const transaction of latestWeights) {
    latestWeightMap.set(
      transaction.registerId,
      transaction,
    );
  }

  return registers.map(
    (register) => {
      const latestWeight =
        latestWeightMap.get(
          register.registerId,
        );

      const baselineWeight =
        Number(
          register.baselineWeight ?? 0,
        );

      const targetWeight =
        Number(
          (
            baselineWeight * 0.95
          ).toFixed(1),
        );

      /*
       * ========================================================
       * No Weight Transaction
       * ========================================================
       *
       * Current = Baseline
       */
      if (!latestWeight) {
        return {
          registerId:
            register.registerId,

          userId:
            register.userId ?? '',

          hn:
            register.hn ?? '',

          fullname:
            register.fullname ?? '',

          /*
           * ====================================================
           * Baseline
           * ====================================================
           */
          baseline: {
            date:
              this.formatDate(
                register.createdAt,
              ),

            weight:
              baselineWeight,

            height:
              Number(
                register.baselineHeight ?? 0,
              ),

            bmi:
              Number(
                register.baselineBmi ?? 0,
              ),
          },

          /*
           * ====================================================
           * Goal
           * ====================================================
           */
          goal: {
            targetPercent: 5,

            targetWeight,
          },

          /*
           * ====================================================
           * Current
           * ====================================================
           */
          current: {
            date:
              this.formatDate(
                register.createdAt,
              ),

            weight:
              baselineWeight,

            bmi:
              Number(
                register.baselineBmi ?? 0,
              ),

            source:
              'BASELINE',
          },

          /*
           * ====================================================
           * Weight Change
           * ====================================================
           */
          weightChange: 0,

          /*
           * ====================================================
           * Surgery
           * ====================================================
           *
           * คงโครงสร้างเดิมไว้
           */
          surgery: {
            status:
              register.surgeryStatus ??
              'PENDING',

            approvedAt:
              register.surgeryApprovedAt
                ? register.surgeryApprovedAt.toISOString()
                : null,
          },

          /*
           * ====================================================
           * Status
           * ====================================================
           */
          status: {
            cancelled:
              register.isCancelled ?? false,

            baselineAccepted:
              register.isBaselineAccepted ??
              false,

            requestPreauthorized:
              register.isRequestPreauthorized ??
              false,

            preauthorized:
              register.isPreauthorized ??
              false,

            operationScheduled:
              register.isOperationScheduled ??
              false,

            success:
              register.isSuccess ??
              false,

            successDate:
              register.successDate
                ? this.formatDate(
                    register.successDate,
                  )
                : null,
          },
        };
      }

      /*
       * ========================================================
       * Has Weight Transaction
       * ========================================================
       */
      const currentWeight =
        Number(
          latestWeight.weight,
        );

      const weightChange =
        Number(
          (
            currentWeight -
            baselineWeight
          ).toFixed(1),
        );

      return {
        registerId:
          register.registerId,

        userId:
          register.userId ?? '',

        hn:
          register.hn ?? '',

        fullname:
          register.fullname ?? '',

        /*
         * ======================================================
         * Baseline
         * ======================================================
         */
        baseline: {
          date:
            this.formatDate(
              register.createdAt,
            ),

          weight:
            baselineWeight,

          height:
            Number(
              register.baselineHeight ?? 0,
            ),

          bmi:
            Number(
              register.baselineBmi ?? 0,
            ),
        },

        /*
         * ======================================================
         * Goal
         * ======================================================
         */
        goal: {
          targetPercent: 5,

          targetWeight,
        },

        /*
         * ======================================================
         * Current
         * ======================================================
         */
        current: {
          date:
            this.formatDate(
              latestWeight.weightAt,
            ),

          weight:
            currentWeight,

          bmi:
            Number(
              latestWeight.bmi,
            ),

          source:
            latestWeight.isWeightAtHospital
              ? 'HOSPITAL'
              : 'PATIENT',
        },

        /*
         * ======================================================
         * Weight Change
         * ======================================================
         */
        weightChange,

        /*
         * ======================================================
         * Surgery
         * ======================================================
         *
         * คงโครงสร้างเดิมไว้
         */
        surgery: {
          status:
            register.surgeryStatus ??
            'PENDING',

          approvedAt:
            register.surgeryApprovedAt
              ? register.surgeryApprovedAt.toISOString()
              : null,
        },

        /*
         * ======================================================
         * Status
         * ======================================================
         */
        status: {
          cancelled:
            register.isCancelled ?? false,

          baselineAccepted:
            register.isBaselineAccepted ??
            false,

          requestPreauthorized:
            register.isRequestPreauthorized ??
            false,

          preauthorized:
            register.isPreauthorized ??
            false,

          operationScheduled:
            register.isOperationScheduled ??
            false,

          success:
            register.isSuccess ??
            false,

          successDate:
            register.successDate
              ? this.formatDate(
                  register.successDate,
                )
              : null,
        },
      };
    },
  );
}
private formatDate(
  date?: Date | string | null,
): string {
  if (!date) {
    return '';
  }

  return new Date(date)
    .toISOString()
    .split('T')[0];
}
async getMissingWeight(
  request: MissingWeightRequestDto,
): Promise<MissingWeightResponseDto> {
  console.log(
    '========== Admin Missing Weight =========='
  );

  console.log('Request:', request);

  const page = request.page ?? 1;
  const pageSize = request.pageSize ?? 20;

  const {
    rows,
    total,
  } = await this.getMissingWeightPatients(
    request,
    page,
    pageSize,
  );

  const patients =
    this.buildMissingWeightResponse(
      rows,
    );

  return {
    total,
    page,
    pageSize,
    patients,
  };
}
/* async getMissingWeight(
  request: MissingWeightRequestDto,
): Promise<MissingWeightResponseDto> {
  console.log(
    '========== Admin Missing Weight =========='
  );

  console.log('Request:', request);

  const page = request.page ?? 1;
  const pageSize = request.pageSize ?? 20;

  const {
    rows,
    total,
  } = await this.getMissingWeightPatients(
    request,
    page,
    pageSize,
  );

  const patients =
    this.buildMissingWeightResponse(
      rows,
    );

  return {
    total,
    page,
    pageSize,
    patients,
  };
}*/
/*----*/
private async getMissingWeightPatients(
  request: MissingWeightRequestDto,
  page: number,
  pageSize: number,
): Promise<{
  rows: any[];
  total: number;
}> {
  const keyword =
    request.keyword?.trim() ?? '';

  const skip =
    (page - 1) * pageSize;

  /*
   * ============================================================
   * Latest Weight SubQuery
   * ============================================================
   *
   * เอา Transaction ล่าสุดของแต่ละ register_id
   *
   * IMPORTANT:
   * weight_at ที่ส่งออกมาเป็น string YYYY-MM-DD
   * ด้วย TO_CHAR()
   */
  const latestWeightSubQuery =
    this.obesityWeightTransactionRepository
      .createQueryBuilder('weight')
      .select([
        'weight.register_id AS register_id',

        /*
         * --------------------------------------------------------
         * Last Weight Date
         * --------------------------------------------------------
         *
         * Database:
         * 2026-04-30 00:00:00+07
         *
         * Response จาก Query:
         * 2026-04-30
         */
        `
        TO_CHAR(
          weight.weight_at,
          'YYYY-MM-DD'
        ) AS weight_at
        `,

        'weight.weight AS weight',

        'weight.bmi AS bmi',

        'weight.is_weight_at_hospital AS is_weight_at_hospital',
      ])
      .distinctOn([
        'weight.register_id',
      ])
      .orderBy(
        'weight.register_id',
        'ASC',
      )
      .addOrderBy(
        'weight.weight_at',
        'DESC',
      );

  /*
   * ============================================================
   * Main Query
   * ============================================================
   */
  const query =
    this.obesityRegisterRepository
      .createQueryBuilder('register')
      .leftJoin(
        `(${latestWeightSubQuery.getQuery()})`,
        'latest_weight',
        'latest_weight.register_id = register.register_id',
      )
      .setParameters(
        latestWeightSubQuery.getParameters(),
      );

  /*
   * ============================================================
   * Select
   * ============================================================
   */
  query.select([
    /*
     * ----------------------------------------------------------
     * Basic
     * ----------------------------------------------------------
     */
    'register.register_id AS register_id',

    'register.user_id AS user_id',

    'register.hn AS hn',

    'register.fullname AS fullname',

    'register.obesity_number AS obesity_number',

    /*
     * ----------------------------------------------------------
     * Register Date
     * ----------------------------------------------------------
     */
    'register.created_at AS register_date',

    /*
     * ----------------------------------------------------------
     * Baseline Date
     * ----------------------------------------------------------
     *
     * ใช้ obesity_register.baseline_date
     *
     * แปลงเป็น YYYY-MM-DD ตั้งแต่ SQL
     */
    `
    TO_CHAR(
      register.baseline_date,
      'YYYY-MM-DD'
    ) AS baseline_date
    `,

    /*
     * ----------------------------------------------------------
     * Baseline
     * ----------------------------------------------------------
     */
    'register.baseline_height AS baseline_height',

    'register.baseline_weight AS baseline_weight',

    'register.baseline_bmi AS baseline_bmi',

    /*
     * ----------------------------------------------------------
     * Surgery
     * ----------------------------------------------------------
     */
    'register.surgery_status AS surgery_status',

    'register.surgery_approved_at AS surgery_approved_at',

    /*
     * ----------------------------------------------------------
     * Status
     * ----------------------------------------------------------
     */
    'register.is_cancelled AS is_cancelled',

    'register.is_baseline_accepted AS is_baseline_accepted',

    'register.is_request_preauthorized AS is_request_preauthorized',

    'register.is_preauthorized AS is_preauthorized',

    'register.is_operation_scheduled AS is_operation_scheduled',

    'register.is_success AS is_success',

    'register.success_date AS success_date',

    /*
     * ----------------------------------------------------------
     * Latest Weight
     * ----------------------------------------------------------
     *
     * latest_weight.weight_at
     * เป็น string YYYY-MM-DD แล้ว
     */
    'latest_weight.weight_at AS last_weight_at',

    'latest_weight.weight AS last_weight',

    'latest_weight.bmi AS last_bmi',

    'latest_weight.is_weight_at_hospital AS is_weight_at_hospital',

    /*
     * ----------------------------------------------------------
     * Reference Date
     * ----------------------------------------------------------
     *
     * ถ้ามี Weight Transaction
     *   → ใช้วันที่ Weight ล่าสุด
     *
     * ถ้าไม่มี
     *   → ใช้วันที่ Register
     */
    `
    COALESCE(
      latest_weight.weight_at,
      TO_CHAR(
        register.created_at,
        'YYYY-MM-DD'
      )
    ) AS reference_date
    `,

    /*
     * ----------------------------------------------------------
     * Days Since Last Weight
     * ----------------------------------------------------------
     *
     * เพราะ latest_weight.weight_at
     * เป็น string YYYY-MM-DD
     *
     * จึงแปลงกลับเป็น DATE เพื่อคำนวณ
     */
    `
    CURRENT_DATE -
    COALESCE(
      TO_DATE(
        latest_weight.weight_at,
        'YYYY-MM-DD'
      ),
      register.created_at::date
    ) AS days_since_last_weight
    `,
  ]);

  /*
   * ============================================================
   * Business Rule 1
   * ============================================================
   *
   * เฉพาะผู้ป่วยที่ Surgery Status = PENDING
   */
  query.where(
    'register.surgery_status = :surgeryStatus',
    {
      surgeryStatus: 'PENDING',
    },
  );

  /*
   * ============================================================
   * Business Rule 2
   * ============================================================
   *
   * ขาดการบันทึกน้ำหนักเกิน 14 วัน
   */
  query.andWhere(`
    CURRENT_DATE -
    COALESCE(
      TO_DATE(
        latest_weight.weight_at,
        'YYYY-MM-DD'
      ),
      register.created_at::date
    ) > 14
  `);

  /*
   * ============================================================
   * Keyword Search
   * ============================================================
   */
  if (keyword) {
    const searchKeyword =
      `%${keyword}%`;

    query.andWhere(
      new Brackets((qb) => {
        qb.where(
          'register.hn ILIKE :keyword',
          {
            keyword: searchKeyword,
          },
        )
          .orWhere(
            'register.fullname ILIKE :keyword',
            {
              keyword: searchKeyword,
            },
          )
          .orWhere(
            'register.obesity_number ILIKE :keyword',
            {
              keyword: searchKeyword,
            },
          );
      }),
    );
  }

  /*
   * ============================================================
   * Sort
   * ============================================================
   *
   * คนที่ขาดน้ำหนักนานที่สุดขึ้นก่อน
   */
  query.orderBy(
    'days_since_last_weight',
    'DESC',
  );

  query.addOrderBy(
    'register.created_at',
    'DESC',
  );

  /*
   * ============================================================
   * Pagination
   * ============================================================
   */
  query
    .offset(skip)
    .limit(pageSize);

  /*
   * ============================================================
   * Execute Data Query
   * ============================================================
   */
  const rows =
    await query.getRawMany();

  /*
   * ============================================================
   * Count Query
   * ============================================================
   */
  const countQuery =
    this.obesityRegisterRepository
      .createQueryBuilder('register')
      .leftJoin(
        `(${latestWeightSubQuery.getQuery()})`,
        'latest_weight',
        'latest_weight.register_id = register.register_id',
      )
      .setParameters(
        latestWeightSubQuery.getParameters(),
      );

  countQuery.select(
    'COUNT(DISTINCT register.register_id)',
    'total',
  );

  /*
   * ----------------------------------------------------------
   * Surgery Status
   * ----------------------------------------------------------
   */
  countQuery.where(
    'register.surgery_status = :surgeryStatus',
    {
      surgeryStatus: 'PENDING',
    },
  );

  /*
   * ----------------------------------------------------------
   * Missing Weight > 14 days
   * ----------------------------------------------------------
   */
  countQuery.andWhere(`
    CURRENT_DATE -
    COALESCE(
      TO_DATE(
        latest_weight.weight_at,
        'YYYY-MM-DD'
      ),
      register.created_at::date
    ) > 14
  `);

  /*
   * ----------------------------------------------------------
   * Keyword Search
   * ----------------------------------------------------------
   */
  if (keyword) {
    const searchKeyword =
      `%${keyword}%`;

    countQuery.andWhere(
      new Brackets((qb) => {
        qb.where(
          'register.hn ILIKE :keyword',
          {
            keyword: searchKeyword,
          },
        )
          .orWhere(
            'register.fullname ILIKE :keyword',
            {
              keyword: searchKeyword,
            },
          )
          .orWhere(
            'register.obesity_number ILIKE :keyword',
            {
              keyword: searchKeyword,
            },
          );
      }),
    );
  }

  const countResult =
    await countQuery.getRawOne<{
      total: string;
    }>();

  const total =
    Number(
      countResult?.total ?? 0,
    );

  return {
    rows,
    total,
  };
}
private buildMissingWeightResponse(
  rows: any[],
): MissingWeightItemDto[] {
  return rows.map((row) => {
    /*
     * ============================================================
     * Baseline
     * ============================================================
     */
    const baselineWeight =
      Number(
        row.baseline_weight ?? 0,
      );

    const baselineHeight =
      Number(
        row.baseline_height ?? 0,
      );

    const baselineBmi =
      Number(
        row.baseline_bmi ?? 0,
      );

    /*
     * ============================================================
     * Baseline Date
     * ============================================================
     *
     * มาจาก:
     *
     * obesity_register.baseline_date
     *
     * SQL ใช้ TO_CHAR()
     *
     * ดังนั้นค่าจะเป็น:
     *
     * 2026-01-08
     */
    const baselineDate =
      row.baseline_date ?? '';

    /*
     * ============================================================
     * Latest Weight
     * ============================================================
     *
     * ถ้ามี Weight Transaction
     *   → ใช้น้ำหนักล่าสุด
     *
     * ถ้าไม่มี
     *   → ใช้ Baseline Weight
     */
    const hasTransaction =
      row.last_weight_at !== null &&
      row.last_weight_at !== undefined;

    /*
     * ------------------------------------------------------------
     * Last Weight Date
     * ------------------------------------------------------------
     *
     * กรณีมี Transaction:
     *
     *   row.last_weight_at
     *
     * จะเป็น string:
     *
     *   2026-04-30
     *
     * ไม่ผ่าน formatDate()
     */
    const lastWeightDate =
      hasTransaction
        ? row.last_weight_at
        : this.formatDate(
            row.register_date,
          );

    /*
     * ------------------------------------------------------------
     * Last Weight
     * ------------------------------------------------------------
     */
    const lastWeight =
      hasTransaction
        ? Number(
            row.last_weight ?? 0,
          )
        : baselineWeight;

    /*
     * ============================================================
     * Goal
     * ============================================================
     *
     * เป้าหมายลดน้ำหนัก 5%
     */
    const targetPercent = 5;

    const targetWeight =
      Number(
        (
          baselineWeight *
          (1 -
            targetPercent / 100)
        ).toFixed(1),
      );

    /*
     * ============================================================
     * Weight Lost
     * ============================================================
     */
    const weightLost =
      Number(
        (
          baselineWeight -
          lastWeight
        ).toFixed(1),
      );

    /*
     * ============================================================
     * Weight Loss Percent
     * ============================================================
     */
    const weightLossPercent =
      baselineWeight > 0
        ? Number(
            (
              (weightLost /
                baselineWeight) *
              100
            ).toFixed(2),
          )
        : 0;

    /*
     * ============================================================
     * Remaining Weight
     * ============================================================
     *
     * น้ำหนักที่เหลือเพื่อให้ถึงเป้าหมาย
     *
     * ถ้าถึงเป้าหมายแล้ว = 0
     */
    const remainingWeight =
      Math.max(
        0,
        Number(
          (
            lastWeight -
            targetWeight
          ).toFixed(1),
        ),
      );

    /*
     * ============================================================
     * Status
     * ============================================================
     */
    const status: AdminPatientStatusDto = {
      cancelled:
        Boolean(
          row.is_cancelled,
        ),

      baselineAccepted:
        Boolean(
          row.is_baseline_accepted,
        ),

      requestPreauthorized:
        Boolean(
          row.is_request_preauthorized,
        ),

      preauthorized:
        Boolean(
          row.is_preauthorized,
        ),

      operationScheduled:
        Boolean(
          row.is_operation_scheduled,
        ),

      success:
        Boolean(
          row.is_success,
        ),

      successDate:
        row.success_date
          ? this.formatDate(
              row.success_date,
            )
          : null,
    };

    /*
     * ============================================================
     * Response
     * ============================================================
     */
    return {
      registerId:
        String(
          row.register_id,
        ),

      userId:
        row.user_id ?? '',

      hn:
        row.hn ?? '',

      fullname:
        row.fullname ?? '',

      /*
       * ----------------------------------------------------------
       * Register Date
       * ----------------------------------------------------------
       *
       * ยังใช้ formatDate() เหมือนเดิม
       */
      registerDate:
        this.formatDate(
          row.register_date,
        ),

      /*
       * ----------------------------------------------------------
       * Baseline
       * ----------------------------------------------------------
       *
       * date:
       *   obesity_register.baseline_date
       *
       * weight:
       *   obesity_register.baseline_weight
       *
       * height:
       *   obesity_register.baseline_height
       *
       * bmi:
       *   obesity_register.baseline_bmi
       */
      baseline: {
        date:
          baselineDate,

        weight:
          baselineWeight,

        height:
          baselineHeight,

        bmi:
          baselineBmi,
      },

      /*
       * ----------------------------------------------------------
       * Goal
       * ----------------------------------------------------------
       */
      goal: {
        targetPercent,

        targetWeight,
      },

      /*
       * ----------------------------------------------------------
       * Last Weight
       * ----------------------------------------------------------
       */
      lastWeight: {
        date:
          lastWeightDate,

        weight:
          lastWeight,
      },

      /*
       * ----------------------------------------------------------
       * Days Since Last Weight
       * ----------------------------------------------------------
       */
      daysSinceLastWeight:
        Number(
          row.days_since_last_weight ??
            0,
        ),

      /*
       * ----------------------------------------------------------
       * Weight Loss
       * ----------------------------------------------------------
       */
      weightLost,

      weightLossPercent,

      remainingWeight,

      /*
       * ----------------------------------------------------------
       * Status
       * ----------------------------------------------------------
       */
      status,
    };
  });
}
/*-----*/

async getWeightLossNearTarget(
  request: WeightLossNearTargetRequestDto,
): Promise<WeightLossNearTargetResponseDto> {
  const page = request.page ?? 1;
  const pageSize = request.pageSize ?? 20;

  const {
    rows,
    total,
  } = await this.getWeightLossNearTargetRows(
    request,
    page,
    pageSize,
  );

  const patients =
    this.buildWeightLossNearTargetResponse(rows);

  return {
    total,
    page,
    pageSize,
    patients,
  };
}
private async getWeightLossNearTargetRows(
  request: WeightLossNearTargetRequestDto,
  page: number,
  pageSize: number,
): Promise<{
  rows: any[];
  total: number;
}> {
  const keyword =
    request.keyword?.trim() ?? '';

  const skip =
    (page - 1) * pageSize;

  /*
   * ============================================================
   * Latest Weight SubQuery
   * ============================================================
   *
   * เอา Transaction ล่าสุดของแต่ละ register_id
   */
  const latestWeightSubQuery =
    this.obesityWeightTransactionRepository
      .createQueryBuilder('weight')
      .select([
        'weight.register_id AS register_id',
        'weight.weight_at AS weight_at',
        'weight.weight AS weight',
        'weight.bmi AS bmi',
        'weight.is_weight_at_hospital AS is_weight_at_hospital',
      ])
      .distinctOn([
        'weight.register_id',
      ])
      .orderBy(
        'weight.register_id',
        'ASC',
      )
      .addOrderBy(
        'weight.weight_at',
        'DESC',
      );

  /*
   * ============================================================
   * Main Query
   * ============================================================
   */
  const query =
    this.obesityRegisterRepository
      .createQueryBuilder('register')
      .leftJoin(
        `(${latestWeightSubQuery.getQuery()})`,
        'latest_weight',
        'latest_weight.register_id = register.register_id',
      )
      .setParameters(
        latestWeightSubQuery.getParameters(),
      );

  /*
   * ============================================================
   * Select
   * ============================================================
   */
  query.select([
    /*
     * Basic
     */
    'register.register_id AS register_id',

    'register.user_id AS user_id',

    'register.hn AS hn',

    'register.fullname AS fullname',

    'register.obesity_number AS obesity_number',

    /*
     * Register Date
     */
    'register.created_at AS register_date',

    /*
     * Baseline
     */
    'register.baseline_date AS baseline_date',

    'register.baseline_height AS baseline_height',

    'register.baseline_weight AS baseline_weight',

    'register.baseline_bmi AS baseline_bmi',

    /*
     * Status
     */
    'register.is_cancelled AS is_cancelled',

    'register.is_baseline_accepted AS is_baseline_accepted',

    'register.is_request_preauthorized AS is_request_preauthorized',

    'register.is_preauthorized AS is_preauthorized',

    'register.is_operation_scheduled AS is_operation_scheduled',

    'register.is_success AS is_success',

    'register.success_date AS success_date',

    /*
     * Surgery
     */
    'register.surgery_status AS surgery_status',

    /*
     * Latest Weight
     */
    'latest_weight.weight AS current_weight',

    'latest_weight.weight_at AS current_weight_at',

    'latest_weight.bmi AS current_bmi',

    'latest_weight.is_weight_at_hospital AS is_weight_at_hospital',
  ]);

  /*
   * ============================================================
   * Business Rule
   * ============================================================
   *
   * 1. Surgery status = PENDING
   * 2. Not cancelled
   * 3. มี latest weight
   * 4. Weight loss >= 4%
   * 5. Weight loss < 5%
   */
  query.where(
    'register.surgery_status = :surgeryStatus',
    {
      surgeryStatus: 'PENDING',
    },
  );

  query.andWhere(
    'register.is_cancelled = :isCancelled',
    {
      isCancelled: false,
    },
  );

  /*
   * ต้องมี latest weight
   */
  query.andWhere(
    'latest_weight.weight IS NOT NULL',
  );

  /*
   * ============================================================
   * Weight Loss >= 4%
   * ============================================================
   */
  query.andWhere(`
    (
      (
        (
          register.baseline_weight::numeric
          - latest_weight.weight::numeric
        )
        / NULLIF(
            register.baseline_weight::numeric,
            0
          )
      ) * 100
    ) >= 4
  `);

  /*
   * ============================================================
   * Weight Loss < 5%
   * ============================================================
   */
  query.andWhere(`
    (
      (
        (
          register.baseline_weight::numeric
          - latest_weight.weight::numeric
        )
        / NULLIF(
            register.baseline_weight::numeric,
            0
          )
      ) * 100
    ) < 5
  `);

  /*
   * ============================================================
   * Keyword Search
   * ============================================================
   */
  if (keyword) {
    const searchKeyword =
      `%${keyword}%`;

    query.andWhere(
      new Brackets((qb) => {
        qb.where(
          'register.hn ILIKE :keyword',
          {
            keyword: searchKeyword,
          },
        )
          .orWhere(
            'register.fullname ILIKE :keyword',
            {
              keyword: searchKeyword,
            },
          )
          .orWhere(
            'register.obesity_number ILIKE :keyword',
            {
              keyword: searchKeyword,
            },
          );
      }),
    );
  }

  /*
   * ============================================================
   * Sort
   * ============================================================
   *
   * คนที่ใกล้ 5% มากที่สุดขึ้นก่อน
   */
  query.orderBy(
    `
    (
      (
        (
          register.baseline_weight::numeric
          - latest_weight.weight::numeric
        )
        / NULLIF(
            register.baseline_weight::numeric,
            0
          )
      ) * 100
    )
    `,
    'DESC',
  );

  query.addOrderBy(
    'latest_weight.weight_at',
    'DESC',
  );

  /*
   * ============================================================
   * Pagination
   * ============================================================
   */
  query
    .offset(skip)
    .limit(pageSize);

  /*
   * ============================================================
   * Execute
   * ============================================================
   */
  const rows =
    await query.getRawMany();

  /*
   * ============================================================
   * Count Query
   * ============================================================
   */
  const countQuery =
    this.obesityRegisterRepository
      .createQueryBuilder('register')
      .leftJoin(
        `(${latestWeightSubQuery.getQuery()})`,
        'latest_weight',
        'latest_weight.register_id = register.register_id',
      )
      .setParameters(
        latestWeightSubQuery.getParameters(),
      );

  countQuery.select(
    'COUNT(register.register_id)',
    'total',
  );

  /*
   * Surgery Status
   */
  countQuery.where(
    'register.surgery_status = :surgeryStatus',
    {
      surgeryStatus: 'PENDING',
    },
  );

  /*
   * Not Cancelled
   */
  countQuery.andWhere(
    'register.is_cancelled = :isCancelled',
    {
      isCancelled: false,
    },
  );

  /*
   * ต้องมี latest weight
   */
  countQuery.andWhere(
    'latest_weight.weight IS NOT NULL',
  );

  /*
   * Weight Loss >= 4%
   */
  countQuery.andWhere(`
    (
      (
        (
          register.baseline_weight::numeric
          - latest_weight.weight::numeric
        )
        / NULLIF(
            register.baseline_weight::numeric,
            0
          )
      ) * 100
    ) >= 4
  `);

  /*
   * Weight Loss < 5%
   */
  countQuery.andWhere(`
    (
      (
        (
          register.baseline_weight::numeric
          - latest_weight.weight::numeric
        )
        / NULLIF(
            register.baseline_weight::numeric,
            0
          )
      ) * 100
    ) < 5
  `);

  /*
   * Keyword Search
   */
  if (keyword) {
    const searchKeyword =
      `%${keyword}%`;

    countQuery.andWhere(
      new Brackets((qb) => {
        qb.where(
          'register.hn ILIKE :keyword',
          {
            keyword: searchKeyword,
          },
        )
          .orWhere(
            'register.fullname ILIKE :keyword',
            {
              keyword: searchKeyword,
            },
          )
          .orWhere(
            'register.obesity_number ILIKE :keyword',
            {
              keyword: searchKeyword,
            },
          );
      }),
    );
  }

  const countResult =
    await countQuery.getRawOne<{
      total: string;
    }>();

  const total =
    Number(
      countResult?.total ?? 0,
    );

  return {
    rows,
    total,
  };
}
private buildWeightLossNearTargetResponse(
  rows: any[],
): WeightLossNearTargetItemDto[] {
  return rows.map((row) => {
    /*
     * ============================================================
     * Baseline
     * ============================================================
     */
    const baselineWeight =
      Number(
        row.baseline_weight ?? 0,
      );

    const baselineHeight =
      Number(
        row.baseline_height ?? 0,
      );

    const baselineBmi =
      Number(
        row.baseline_bmi ?? 0,
      );

    /*
     * ============================================================
     * Baseline Date
     * ============================================================
     *
     * ใช้ obesity_register.baseline_date
     */
    const baselineDate =
      row.baseline_date
        ? this.formatDate(
            row.baseline_date,
          )
        : '';

    /*
     * ============================================================
     * Latest Weight
     * ============================================================
     */
    const hasTransaction =
      row.current_weight_at !== null &&
      row.current_weight_at !== undefined;

    const lastWeightDate =
      hasTransaction
        ? row.current_weight_at
        : row.register_date;

    const lastWeight =
      hasTransaction
        ? Number(
            row.current_weight ?? 0,
          )
        : baselineWeight;

    /*
     * ============================================================
     * Goal
     * ============================================================
     */
    const targetPercent = 5;

    const targetWeight =
      Number(
        (
          baselineWeight *
          (1 -
            targetPercent / 100)
        ).toFixed(1),
      );

    /*
     * ============================================================
     * Weight Lost
     * ============================================================
     */
    const weightLost =
      Number(
        (
          baselineWeight -
          lastWeight
        ).toFixed(1),
      );

    /*
     * ============================================================
     * Weight Loss Percent
     * ============================================================
     */
    const weightLossPercent =
      baselineWeight > 0
        ? Number(
            (
              (weightLost /
                baselineWeight) *
              100
            ).toFixed(2),
          )
        : 0;

    /*
     * ============================================================
     * Remaining Weight
     * ============================================================
     *
     * น้ำหนักที่เหลือเพื่อให้ถึงเป้าหมาย 5%
     *
     * ถ้าถึงเป้าหมายแล้ว = 0
     */
    const remainingWeight =
      Math.max(
        0,
        Number(
          (
            lastWeight -
            targetWeight
          ).toFixed(1),
        ),
      );

    /*
     * ============================================================
     * Status
     * ============================================================
     */
    const status: AdminPatientStatusDto = {
      cancelled:
        Boolean(
          row.is_cancelled,
        ),

      baselineAccepted:
        Boolean(
          row.is_baseline_accepted,
        ),

      requestPreauthorized:
        Boolean(
          row.is_request_preauthorized,
        ),

      preauthorized:
        Boolean(
          row.is_preauthorized,
        ),

      operationScheduled:
        Boolean(
          row.is_operation_scheduled,
        ),

      success:
        Boolean(
          row.is_success,
        ),

      successDate:
        row.success_date
          ? this.formatDate(
              row.success_date,
            )
          : null,
    };

    /*
     * ============================================================
     * Response
     * ============================================================
     */
    return {
      registerId:
        String(
          row.register_id,
        ),

      userId:
        row.user_id ?? '',

      hn:
        row.hn ?? '',

      fullname:
        row.fullname ?? '',

      /*
       * Register Date
       */
      registerDate:
        this.formatDate(
          row.register_date,
        ),

      /*
       * ----------------------------------------------------------
       * Baseline
       * ----------------------------------------------------------
       */
      baseline: {
        date:
          baselineDate,

        weight:
          baselineWeight,

        height:
          baselineHeight,

        bmi:
          baselineBmi,
      },

      /*
       * ----------------------------------------------------------
       * Goal
       * ----------------------------------------------------------
       */
      goal: {
        targetPercent,

        targetWeight,
      },

      /*
       * ----------------------------------------------------------
       * Last Weight
       * ----------------------------------------------------------
       */
      lastWeight: {
        date:
          this.formatDate(
            lastWeightDate,
          ),

        weight:
          lastWeight,
      },

      /*
       * ----------------------------------------------------------
       * Weight Loss
       * ----------------------------------------------------------
       */
      weightLost,

      weightLossPercent,

      remainingWeight,

      /*
       * ----------------------------------------------------------
       * Status
       * ----------------------------------------------------------
       */
      status,
    };
  });
}
/*-----*/
}
