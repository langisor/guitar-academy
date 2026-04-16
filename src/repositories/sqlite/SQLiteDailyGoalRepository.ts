import { db } from "@/db/database";
import { IDailyGoalRepository } from "../interfaces/IDailyGoalRepository";
import { DailyGoal } from "../interfaces/types";

export class SQLiteDailyGoalRepository implements IDailyGoalRepository {
  async getDailyGoal(userId: number, date: string): Promise<DailyGoal | undefined> {
    const result = await db.execute({
      sql: "SELECT * FROM daily_goals WHERE user_id = ? AND date = ?",
      args: [userId, date]
    });
    return result.rows[0] as unknown as DailyGoal | undefined;
  }

  async upsertDailyGoal(userId: number, goal: Partial<DailyGoal>): Promise<void> {
    const date = goal.date || new Date().toISOString().split('T')[0];
    
    // We can use INSERT ... ON CONFLICT here as well for a single trip
    const minutesPracticed = goal.minutes_practiced ?? 0;
    const goalMinutes = goal.goal_minutes ?? 15;
    const completed = minutesPracticed >= goalMinutes ? 1 : 0;

    await db.execute({
      sql: `
        INSERT INTO daily_goals (user_id, date, minutes_practiced, goal_minutes, completed)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, date) DO UPDATE SET
          minutes_practiced = COALESCE(excluded.minutes_practiced, daily_goals.minutes_practiced),
          goal_minutes = COALESCE(excluded.goal_minutes, daily_goals.goal_minutes),
          completed = CASE 
            WHEN COALESCE(excluded.minutes_practiced, daily_goals.minutes_practiced) >= COALESCE(excluded.goal_minutes, daily_goals.goal_minutes) 
            THEN 1 ELSE 0 
          END
      `,
      args: [
        userId,
        date,
        goal.minutes_practiced ?? null,
        goal.goal_minutes ?? null,
        completed
      ]
    });
  }
}
