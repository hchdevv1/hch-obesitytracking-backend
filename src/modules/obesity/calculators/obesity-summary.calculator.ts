import {
  ObesitySummaryInput,
  ObesitySummaryResult,
} from './obesity-summary.interface';

export class ObesitySummaryCalculator {
  static calculate(
    input: ObesitySummaryInput,
  ): ObesitySummaryResult {
    const {
      baselineWeight,
      currentWeight,
      targetPercent,
    } = input;

    const weightToLose = this.calculateWeightToLose(
      baselineWeight,
      targetPercent,
    );

    const targetWeight = this.calculateTargetWeight(
      baselineWeight,
      weightToLose,
    );

    const weightLost = this.calculateWeightLost(
      baselineWeight,
      currentWeight,
    );

    const remainingWeight = this.calculateRemainingWeight(
      currentWeight,
      targetWeight,
    );

    const weightLossPercent = this.calculateWeightLossPercent(
      weightLost,
      baselineWeight,
    );

    const goalProgressPercent = this.calculateGoalProgressPercent(
      weightLost,
      weightToLose,
    );

    const goalAchieved = this.isGoalAchieved(
      currentWeight,
      targetWeight,
    );

    return {
      baselineWeight,
      currentWeight,

      targetPercent,

      weightToLose,
      targetWeight,

      weightLost,
      remainingWeight,

      weightLossPercent,
      goalProgressPercent,

      goalAchieved,
    };
  }

  private static calculateWeightToLose(
    baselineWeight: number,
    targetPercent: number,
  ): number {
    return baselineWeight * (targetPercent / 100);
  }

  private static calculateTargetWeight(
    baselineWeight: number,
    weightToLose: number,
  ): number {
    return baselineWeight - weightToLose;
  }

  private static calculateWeightLost(
    baselineWeight: number,
    currentWeight: number,
  ): number {
    return baselineWeight - currentWeight;
  }

  private static calculateRemainingWeight(
    currentWeight: number,
    targetWeight: number,
  ): number {
    return Math.max(currentWeight - targetWeight, 0);
  }

  private static calculateWeightLossPercent(
    weightLost: number,
    baselineWeight: number,
  ): number {
    if (baselineWeight <= 0) {
      return 0;
    }

    return (weightLost / baselineWeight) * 100;
  }

  private static calculateGoalProgressPercent(
    weightLost: number,
    weightToLose: number,
  ): number {
    if (weightToLose <= 0) {
      return 0;
    }

    return Math.min((weightLost / weightToLose) * 100, 100);
  }

  private static isGoalAchieved(
    currentWeight: number,
    targetWeight: number,
  ): boolean {
    return currentWeight <= targetWeight;
  }
}
