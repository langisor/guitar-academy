import { UserProgress } from "./types";

export interface IProgressRepository {
  getUserProgress(userId: number): UserProgress[] | Promise<UserProgress[]>;
  getLevelProgress(userId: number, levelId: number): UserProgress | undefined | Promise<UserProgress | undefined>;
  upsertProgress(progress: Omit<UserProgress, "id">): void | Promise<void>;
  getTotalXP(userId: number): number | Promise<number>;
  getCompletedLevelsCount(userId: number): number | Promise<number>;
}
