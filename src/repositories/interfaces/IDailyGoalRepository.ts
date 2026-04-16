import { DailyGoal } from "./types";

export interface IDailyGoalRepository {
  getDailyGoal(userId: number, date: string): DailyGoal | undefined | Promise<DailyGoal | undefined>;
  upsertDailyGoal(userId: number, goal: Partial<DailyGoal>): void | Promise<void>;
}
