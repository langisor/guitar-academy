import { getDatabase } from "@/db/database";

export interface Progress {
  user_id: number;
  level_id: number;
  completed: number;
  stars: number;
  xp_earned: number;
  attempts: number;
  completed_at: string | null;
}

export interface DailyGoal {
  date: string;
  minutes_practiced: number;
  goal_minutes: number;
  completed: number;
}

export class ProgressService {
  private db = getDatabase();

  getUserProgress(userId: number): Progress[] {
    return this.db.prepare(
      "SELECT * FROM progress WHERE user_id = ?"
    ).all(userId) as Progress[];
  }

  getLevelProgress(userId: number, levelId: number): Progress | undefined {
    return this.db.prepare(
      "SELECT * FROM progress WHERE user_id = ? AND level_id = ?"
    ).get(userId, levelId) as Progress | undefined;
  }

  completeLevel(userId: number, levelId: number, stars: number = 3, xpEarned: number = 50): void {
    const existing = this.getLevelProgress(userId, levelId);
    
    if (existing) {
      this.db.prepare(`
        UPDATE progress 
        SET completed = 1, stars = ?, xp_earned = xp_earned + ?, attempts = attempts + 1, completed_at = datetime('now')
        WHERE user_id = ? AND level_id = ?
      `).run(stars, xpEarned, userId, levelId);
    } else {
      this.db.prepare(`
        INSERT INTO progress (user_id, level_id, completed, stars, xp_earned, attempts, completed_at)
        VALUES (?, ?, 1, ?, ?, 1, datetime('now'))
      `).run(userId, levelId, stars, xpEarned);
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

  getDailyGoal(userId: number, date: string): DailyGoal | undefined {
    return this.db.prepare(
      "SELECT * FROM daily_goals WHERE user_id = ? AND date = ?"
    ).get(userId, date) as DailyGoal | undefined;
  }

  updateDailyGoal(userId: number, minutes: number): void {
    const today = new Date().toISOString().split('T')[0];
    const existing = this.getDailyGoal(userId, today);
    
    if (existing) {
      const completed = existing.minutes_practiced + minutes >= existing.goal_minutes ? 1 : 0;
      this.db.prepare(`
        UPDATE daily_goals 
        SET minutes_practiced = minutes_practiced + ?, completed = ?
        WHERE user_id = ? AND date = ?
      `).run(minutes, completed, userId, today);
    } else {
      this.db.prepare(`
        INSERT INTO daily_goals (user_id, date, minutes_practiced, goal_minutes, completed)
        VALUES (?, ?, ?, 15, 0)
      `).run(userId, today, minutes);
    }
  }

  getPracticeStats(userId: number, days: number = 7) {
    return this.db.prepare(`
      SELECT date, SUM(duration_minutes) as minutes, SUM(exercises_completed) as exercises
      FROM practice_sessions
      WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
      GROUP BY date
      ORDER BY date DESC
    `).all(userId, days) as { date: string; minutes: number; exercises: number }[];
  }
}

export const progressService = new ProgressService();
