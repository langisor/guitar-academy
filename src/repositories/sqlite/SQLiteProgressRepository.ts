import { db } from "@/db/database";
import { IProgressRepository } from "../interfaces/IProgressRepository";
import { UserProgress } from "../interfaces/types";

export class SQLiteProgressRepository implements IProgressRepository {
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    const result = await db.execute({
      sql: "SELECT * FROM progress WHERE user_id = ?",
      args: [userId]
    });
    return result.rows as unknown as UserProgress[];
  }

  async getLevelProgress(userId: number, levelId: number): Promise<UserProgress | undefined> {
    const result = await db.execute({
      sql: "SELECT * FROM progress WHERE user_id = ? AND level_id = ?",
      args: [userId, levelId]
    });
    return result.rows[0] as unknown as UserProgress | undefined;
  }

  async upsertProgress(progress: Omit<UserProgress, "id">): Promise<void> {
    await db.execute({
      sql: `
        INSERT INTO progress (user_id, level_id, completed, stars, xp_earned, attempts, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, level_id) DO UPDATE SET
          completed = excluded.completed,
          stars = excluded.stars,
          xp_earned = excluded.xp_earned,
          attempts = excluded.attempts,
          completed_at = excluded.completed_at
      `,
      args: [
        progress.user_id,
        progress.level_id,
        progress.completed,
        progress.stars,
        progress.xp_earned,
        progress.attempts,
        progress.completed_at
      ]
    });
  }

  async getTotalXP(userId: number): Promise<number> {
    const result = await db.execute({
      sql: "SELECT COALESCE(SUM(xp_earned), 0) as total FROM progress WHERE user_id = ?",
      args: [userId]
    });
    return (result.rows[0].total as number) || 0;
  }

  async getCompletedLevelsCount(userId: number): Promise<number> {
    const result = await db.execute({
      sql: "SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND completed = 1",
      args: [userId]
    });
    return (result.rows[0].count as number) || 0;
  }
}
