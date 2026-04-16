import { getDatabase } from "@/db/database";
import { IDailyGoalRepository } from "../interfaces/IDailyGoalRepository";
import { DailyGoal } from "../interfaces/types";

export class SQLiteDailyGoalRepository implements IDailyGoalRepository {
  private db = getDatabase();

  getDailyGoal(userId: number, date: string): DailyGoal | undefined {
    return this.db.prepare(
      "SELECT * FROM daily_goals WHERE user_id = ? AND date = ?"
    ).get(userId, date) as DailyGoal | undefined;
  }

  upsertDailyGoal(userId: number, goal: Partial<DailyGoal>): void {
    const date = goal.date || new Date().toISOString().split('T')[0];
    const existing = this.getDailyGoal(userId, date);

    if (existing) {
      const minutes = goal.minutes_practiced ?? existing.minutes_practiced;
      const target = goal.goal_minutes ?? existing.goal_minutes;
      const completed = minutes >= target ? 1 : 0;
      
      this.db.prepare(`
        UPDATE daily_goals 
        SET minutes_practiced = ?, goal_minutes = ?, completed = ?
        WHERE user_id = ? AND date = ?
      `).run(minutes, target, completed, userId, date);
    } else {
      this.db.prepare(`
        INSERT INTO daily_goals (user_id, date, minutes_practiced, goal_minutes, completed)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        userId,
        date,
        goal.minutes_practiced ?? 0,
        goal.goal_minutes ?? 15,
        (goal.minutes_practiced ?? 0) >= (goal.goal_minutes ?? 15) ? 1 : 0
      );
    }
  }
}
