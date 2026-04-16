import { PracticeSession } from "./types";

export interface IPracticeSessionRepository {
  getSessions(userId: number, days: number): PracticeSession[] | Promise<PracticeSession[]>;
  createSession(session: Omit<PracticeSession, "id">): void | Promise<void>;
}
