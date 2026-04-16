import { getDatabase } from "@/db/database";
import { IProgressRepository } from "../interfaces/IProgressRepository";
import { UserProgress } from "../interfaces/types";

export class SQLiteProgressRepository implements IProgressRepository {
  private db = getDatabase();

  getUserProgress(userId: number): UserProgress[] {
    return this.db.prepare(
      "SELECT * FROM progress WHERE user_id = ?"
    ).all(userId) as UserProgress[];
  }

  getLevelProgress(userId: number, levelId: number): UserProgress | undefined {
    return this.db.prepare(
      "SELECT * FROM progress WHERE user_id = ? AND level_id = ?"
    ).get(userId, levelId) as UserProgress | undefined;
  }

  upsertProgress(progress: Omit<UserProgress, "id">): void {
    const existing = this.getLevelProgress(progress.user_id, progress.level_id);
    
    if (existing) {
      this.db.prepare(`
        UPDATE progress 
        SET completed = ?, stars = ?, xp_earned = ?, attempts = ?, completed_at = ?
        WHERE user_id = ? AND level_id = ?
      `).run(
        progress.completed,
        progress.stars,
        progress.xp_earned,
        progress.attempts,
        progress.completed_at,
        progress.user_id,
        progress.level_id
      );
    } else {
      this.db.prepare(`
        INSERT INTO progress (user_id, level_id, completed, stars, xp_earned, attempts, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        progress.user_id,
        progress.level_id,
        progress.completed,
        progress.stars,
        progress.xp_earned,
        progress.attempts,
        progress.completed_at
      );
    }
  }

  getTotalXP(userId: number): number {
    const result = this.db.prepare(
      "SELECT COALESCE(SUM(xp_earned), 0) as total FROM progress WHERE user_id = ?"
    ).get(userId) as { total: number };
    return result.total;
  }

  getCompletedLevelsCount(userId: number): number {
    const result = this.db.prepare(
      "SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND completed = 1"
    ).get(userId) as { count: number };
    return result.count;
  }
}
