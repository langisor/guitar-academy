import { getDatabase } from "@/db/database";
import { IPracticeSessionRepository } from "../interfaces/IPracticeSessionRepository";
import { PracticeSession } from "../interfaces/types";

export class SQLitePracticeSessionRepository implements IPracticeSessionRepository {
  private db = getDatabase();

  getSessions(userId: number, days: number): PracticeSession[] {
    return this.db.prepare(`
      SELECT * FROM practice_sessions
      WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
      ORDER BY date DESC
    `).all(userId, days) as PracticeSession[];
  }

  createSession(session: Omit<PracticeSession, "id">): void {
    this.db.prepare(`
      INSERT INTO practice_sessions (user_id, duration_minutes, exercises_completed, xp_earned, date)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      session.user_id,
      session.duration_minutes,
      session.exercises_completed,
      session.xp_earned,
      session.date || new Date().toISOString().split('T')[0]
    );
  }
}
