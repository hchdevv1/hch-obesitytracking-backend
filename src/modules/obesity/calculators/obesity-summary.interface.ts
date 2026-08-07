export interface ObesitySummaryInput {
  baselineWeight: number;
  currentWeight: number;
  targetPercent: number;
}

export interface ObesitySummaryResult {
  baselineWeight: number;
  currentWeight: number;

  targetPercent: number;

  weightToLose: number;
  targetWeight: number;

  weightLost: number;
  remainingWeight: number;

  weightLossPercent: number;
  goalProgressPercent: number;

  goalAchieved: boolean;
}
