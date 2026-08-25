/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  Repository,
} from 'typeorm';

import { ObesityRegister } from '../obesity-register/entities/obesity-register.entity';
import { CreateWeightTransactionDto } from './dto/create-weight-transaction.dto';
import { WeightTransactionResponseDto } from './dto/weight-transaction-response.dto';
import { ObesityWeightTransaction } from './entities/obesity-weight-transaction.entity';
import { WeightTransactionAction } from './enums/weight-transaction-action.enum';
import { WeightHistoryRequestDto } from './dto/weight-history-request.dto';
import { WeightHistoryResponseDto } from './dto/weight-history-response.dto';
import { WeightSource } from './enums/weight-source.enum';
import { BaselineDto } from './dto/baseline.dto';
import { CurrentDto } from './dto/current.dto';
import { GoalDto } from './dto/goal.dto';
import { WeightHistorySort } from './enums/weight-history-sort.enum';
import { WeightHistoryItemDto } from './dto/weight-history-item.dto';
import { ChartDto } from './dto/chart.dto';
import { HisPatientsObservationsResponse } from '../his/interfaces/his-patients-observations-response.interface';


@Injectable()
export class ObesityWeightTransactionService {
  constructor(
    @InjectRepository(ObesityWeightTransaction)
    private readonly obesityWeightTransactionRepository: Repository<ObesityWeightTransaction>,

    @InjectRepository(ObesityRegister)
    private readonly obesityRegisterRepository: Repository<ObesityRegister>,
  ) {}

  /*async create(
    request: CreateWeightTransactionDto,
  ): Promise<WeightTransactionResponseDto> {
    const register = await this.validateRegister(
      request.registerId,
      request.userId,
    );

    const height = Number(register.baselineHeight);
    const weight = Number(request.weight);

    const bmi = this.calculateBmi(
      height,
      weight,
    );

    const existingTransaction =
      await this.findExistingTransaction(
        request.registerId,
        request.weightAt,
      );

    let transaction: ObesityWeightTransaction;
    let action: WeightTransactionAction;

    if (existingTransaction) {
      transaction =
        await this.updateTransaction(
          existingTransaction,
          height,
          weight,
          bmi,
        );

      action = WeightTransactionAction.UPDATE;
    } else {
      transaction =
        await this.insertTransaction(
          request,
          height,
          weight,
          bmi,
        );

      action = WeightTransactionAction.INSERT;
    }

    return this.buildResponse(
      transaction,
      request,
      action,
    );
  } */
async create(
  request: CreateWeightTransactionDto,
): Promise<WeightTransactionResponseDto> {
  const register = await this.validateRegister(
    request.registerId,
    request.userId,
  );

  const height = Number(register.baselineHeight);
  const weight = Number(request.weight);

  const bmi = this.calculateBmi(
    height,
    weight,
  );

  const existingTransaction =
    await this.findExistingTransaction(
      request.registerId,
      request.weightAt,
    );

  let transaction: ObesityWeightTransaction;
  let action: WeightTransactionAction;

  if (existingTransaction) {
    transaction =
      await this.updateTransaction(
        existingTransaction,
        height,
        weight,
        bmi,
      );

    action = WeightTransactionAction.UPDATE;
  } else {
    transaction =
      await this.insertTransaction(
        request,
        height,
        weight,
        bmi,
      );

    action = WeightTransactionAction.INSERT;
  }

  // Check Success ≥ 5%
  await this.updateSuccessStatus(
    register,
    transaction,
  );

  return this.buildResponse(
    transaction,
    request,
    action,
  );
}
private async updateSuccessStatus(
  register: ObesityRegister,
  transaction: ObesityWeightTransaction,
): Promise<void> {
  // ถ้า Success ไปแล้ว ไม่ต้องเปลี่ยน successDate
  if (register.isSuccess) {
    return;
  }

  const baselineWeight = Number(
    register.baselineWeight,
  );

  const currentWeight = Number(
    transaction.weight,
  );

  // Validate weight
  if (
    !Number.isFinite(baselineWeight) ||
    baselineWeight <= 0 ||
    !Number.isFinite(currentWeight)
  ) {
    return;
  }

  // Calculate weight loss percentage
  const weightLossPercent =
    ((baselineWeight - currentWeight) /
      baselineWeight) *
    100;

  // ยังลดน้ำหนักไม่ถึง 5%
  if (weightLossPercent < 5) {
    return;
  }

  // ต้องมีวันที่ของ transaction
  if (!transaction.weightAt) {
    return;
  }

  // Success ครั้งแรก
  register.isSuccess = true;
  register.successDate = transaction.weightAt;

  await this.obesityRegisterRepository.save(
    register,
  );
}
    async getHistory(
  request: WeightHistoryRequestDto,
): Promise<WeightHistoryResponseDto> {
  // Step 1 : Validate Register
  const register = await this.findRegister(request);

  // Step 2 : Baseline
  const baseline = this.buildBaseline(register);

  // Step 3 : Current
  const latestTransaction =
    await this.getLatestTransaction(
      register.registerId,
    );

  const current = this.buildCurrent(
    register,
    latestTransaction,
  );

  // Step 4 : Goal
  const goal = this.buildGoal(baseline);

  // Step 5 : Weight History
  const transactions =
    await this.getWeightHistory(
      register.registerId,
      request.sort,
    );

  const weightChangeMap =
    this.calculateWeightChangeMap(
      baseline.weight,
      transactions,
    );

  const weightHistory =
    this.buildWeightHistory(
      register.createdAt!,
      transactions,
      weightChangeMap,
    );

  // Step 6 : Chart
  const chartRange =
    this.calculateChartRange(
      baseline.weight,
      transactions,
    );

  const chart =
    this.buildChart(chartRange);

  return {
    baseline,
    current,
    goal,
    chart,
    weightHistory,
  };
}
  private async validateRegister(
    registerId: string,
    userId: string,
  ): Promise<ObesityRegister> {
    const register =
      await this.obesityRegisterRepository.findOne({
        where: {
          registerId,
          userId,
        },
      });

    if (!register) {
      throw new NotFoundException(
        `Register ID ${registerId} not found.`,
      );
    }
    return register;
  }

  private async findExistingTransaction(
    registerId: string,
    weightAt: string,
  ): Promise<ObesityWeightTransaction | null> {
    const startDate = new Date(
      `${weightAt}T00:00:00`,
    );

    const endDate = new Date(
      `${weightAt}T23:59:59.999`,
    );

    return this.obesityWeightTransactionRepository.findOne({
      where: {
        registerId,
        weightAt: Between(
          startDate,
          endDate,
        ),
      },
    });
  }
    private async insertTransaction(
    request: CreateWeightTransactionDto,
    height: number,
    weight: number,
    bmi: number,
  ): Promise<ObesityWeightTransaction> {
    const transaction =
      this.obesityWeightTransactionRepository.create({
        registerId: request.registerId,
        patientId: request.patientId,
        hn: request.hn,
        height,
        weight,
        bmi,
        weightAt: new Date(
          `${request.weightAt}T00:00:00`,
        ),
        isWeightAtHospital: false,
      });

    const savedTransaction =
      await this.obesityWeightTransactionRepository.save(
        transaction,
      );

    // console.log(
    //   `Weight inserted. Transaction ID: ${savedTransaction.transactionId}`,
    // );

    return savedTransaction;
  }

  private async updateTransaction(
    transaction: ObesityWeightTransaction,
    height: number,
    weight: number,
    bmi: number,
  ): Promise<ObesityWeightTransaction> {
    transaction.height = height;
    transaction.weight = weight;
    transaction.bmi = bmi;

    const updatedTransaction =
      await this.obesityWeightTransactionRepository.save(
        transaction,
      );

    // console.log(
    //   `Weight updated. Transaction ID: ${updatedTransaction.transactionId}`,
    // );

    return updatedTransaction;
  }

  private buildResponse(
    transaction: ObesityWeightTransaction,
    request: CreateWeightTransactionDto,
    action: WeightTransactionAction,
  ): WeightTransactionResponseDto {
    return {
      transactionId: transaction.transactionId,
      registerId: request.registerId,
      patientId: request.patientId,
      hn: request.hn,
      weight: request.weight,
      weightAt: request.weightAt,
      action,
    };
  }

  private calculateBmi(
    height: number,
    weight: number,
  ): number {
    const heightInMeter = height / 100;

    const bmi =
      weight / (heightInMeter * heightInMeter);

    return Number(bmi.toFixed(2));
  }
private async findRegister(
  request: WeightHistoryRequestDto,
): Promise<ObesityRegister> {
  const register =
    await this.obesityRegisterRepository.findOne({
      where: {
        userId: request.userId,
        hn: request.hn,
      },
    });

  if (!register) {
    throw new NotFoundException(
      `HN ${request.hn} not found.`,
    );
  }

  return register;
}
private buildBaseline(
  register: ObesityRegister,
): BaselineDto {
  const baselineDate = register.createdAt!;

  return {
    date: baselineDate
      .toISOString()
      .split('T')[0],

    weight: Number(
      register.baselineWeight,
    ),
  };
}
private async getLatestTransaction(
  registerId: string,
): Promise<ObesityWeightTransaction | null> {
  return this.obesityWeightTransactionRepository.findOne({
    where: {
      registerId,
    },
    order: {
      weightAt: 'DESC',
    },
  });
}
private buildCurrent(
  register: ObesityRegister,
  latestTransaction: ObesityWeightTransaction | null,
): CurrentDto {
  const baselineDate = register.createdAt!;

  if (!latestTransaction) {
    return {
      date: baselineDate
        .toISOString()
        .split('T')[0],

      daysFromBaseline: 0,

      weight: Number(register.baselineWeight),

      bmi: Number(register.baselineBmi),

      source: WeightSource.BASELINE,
    };
  }

  return {
    date: latestTransaction.weightAt!
      .toISOString()
      .split('T')[0],

    daysFromBaseline:
      this.calculateDaysFromBaseline(
        baselineDate,
        latestTransaction.weightAt!,
      ),

    weight: Number(
      latestTransaction.weight,
    ),

    bmi: Number(
      latestTransaction.bmi,
    ),

    source:
      latestTransaction.isWeightAtHospital
        ? WeightSource.HOSPITAL
        : WeightSource.PATIENT,
  };
}
private calculateDaysFromBaseline(
  baselineDate: Date,
  weightAt: Date,
): number {
  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  return Math.floor(
    (weightAt.getTime() -
      baselineDate.getTime()) /
      millisecondsPerDay,
  );
}

private buildGoal(
  baseline: BaselineDto,
): GoalDto {
  const targetPercent = 5;

  const targetWeight = Number(
    (
      baseline.weight *
      (1 - targetPercent / 100)
    ).toFixed(1),
  );

  return {
    targetPercent,
    targetWeight,
  };
}
private async getWeightHistory(
  registerId: string,
  sort: WeightHistorySort,
): Promise<ObesityWeightTransaction[]> {
  const transactions =
    await this.obesityWeightTransactionRepository.find({
      where: {
        registerId,
      },
      order: {
        weightAt: sort,
      },
    });

  return transactions;
}
private calculateWeightChangeMap(
  baselineWeight: number,
  transactions: ObesityWeightTransaction[],
): Map<string, number> {
  const weightChangeMap = new Map<string, number>();

  if (transactions.length === 0) {
    return weightChangeMap;
  }

  const chronologicalTransactions = [
    ...transactions,
  ].sort(
    (first, second) =>
      first.weightAt!.getTime() -
      second.weightAt!.getTime(),
  );

  let previousWeight = baselineWeight;

  for (const transaction of chronologicalTransactions) {
    const currentWeight = Number(
      transaction.weight,
    );

    weightChangeMap.set(
      transaction.transactionId,
      Number(
        (
          currentWeight -
          previousWeight
        ).toFixed(1),
      ),
    );

    previousWeight = currentWeight;
  }

  return weightChangeMap;
}
private buildWeightHistory(
  baselineDate: Date,
  transactions: ObesityWeightTransaction[],
  weightChangeMap: Map<string, number>,
): WeightHistoryItemDto[] {
  return transactions.map((transaction) => ({
    transactionId: transaction.transactionId,

    weightAt:
      transaction.weightAt
        ?.toISOString()
        .split('T')[0] ?? '',

    daysFromBaseline:
      this.calculateDaysFromBaseline(
        baselineDate,
        transaction.weightAt!,
      ),

    weight: Number(transaction.weight),

    bmi: Number(transaction.bmi),

    weightChange:
      weightChangeMap.get(
        transaction.transactionId,
      ) ?? 0,

    source:
      transaction.isWeightAtHospital
        ? WeightSource.HOSPITAL
        : WeightSource.PATIENT,
  }));
}
private calculateChartRange(
  baselineWeight: number,
  transactions: ObesityWeightTransaction[],
): {
  min: number;
  max: number;
  tickInterval: number;
} {
  const weights = [
    baselineWeight,
    ...transactions.map((transaction) =>
      Number(transaction.weight),
    ),
  ];

  const highestWeight = Math.max(...weights);
  const lowestWeight = Math.min(...weights);

  const max = Math.ceil(highestWeight + 1);
  const min = Math.floor(lowestWeight - 1);

  const range = max - min;

  let tickInterval = 1;

  if (range <= 10) {
    tickInterval = 1;
  } else if (range <= 20) {
    tickInterval = 2;
  } else if (range <= 40) {
    tickInterval = 5;
  } else {
    tickInterval = 10;
  }

  return {
    min,
    max,
    tickInterval,
  };
}
private buildChart(range: {
  min: number;
  max: number;
  tickInterval: number;
}): ChartDto {
  return {
    weight: {
      min: range.min,
      max: range.max,
      tickInterval: range.tickInterval,
    },
  };
}
async importFromHis(
  register: ObesityRegister,
  observations:
    HisPatientsObservationsResponse['ObservationInfo'],
): Promise<void> {
  if (
    !observations ||
    observations.length === 0
  ) {
    return;
  }

  const transactions =
    observations.map((observation) => {
      return this.obesityWeightTransactionRepository.create({
        registerId: register.registerId,

        patientId: observation.PatientID,

        hn: observation.HN,

        episodeId:
          observation.EpisodeID ?? undefined,

        vn: observation.VN || undefined,

        height: Number(observation.Height),

        weight: Number(observation.Weight),

        bmi: Number(observation.BMI),

        weightAt: new Date(
          `${observation.VisitDate}T00:00:00`,
        ),

        isWeightAtHospital: true,
      });
    });

  await this.obesityWeightTransactionRepository.save(
    transactions,
  );
}
}
