import { db } from "@/db/database";
import { IPracticeSessionRepository } from "../interfaces/IPracticeSessionRepository";
import { PracticeSession } from "../interfaces/types";

export class SQLitePracticeSessionRepository implements IPracticeSessionRepository {
  async getSessions(userId: number, days: number): Promise<PracticeSession[]> {
    const result = await db.execute({
      sql: `
        SELECT * FROM practice_sessions
        WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
        ORDER BY date DESC
      `,
      args: [userId, days]
    });
    return result.rows as unknown as PracticeSession[];
  }

  async createSession(session: Omit<PracticeSession, "id">): Promise<void> {
    await db.execute({
      sql: `
        INSERT INTO practice_sessions (user_id, duration_minutes, exercises_completed, xp_earned, date)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [
        session.user_id,
        session.duration_minutes,
        session.exercises_completed,
        session.xp_earned,
        session.date || new Date().toISOString().split('T')[0]
      ]
    });
  }
}
