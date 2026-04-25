import { db } from "@/db/database";
import { IQuizRepository } from "../interfaces/IQuizRepository";
import { Quiz } from "../interfaces/types";

export class SQLiteQuizRepository implements IQuizRepository {
  async getAll(): Promise<Quiz[]> {
    const result = await db.execute("SELECT * FROM quizzes");
    return result.rows as unknown as Quiz[];
  }

  async getById(id: number): Promise<Quiz | undefined> {
    const result = await db.execute({
      sql: "SELECT * FROM quizzes WHERE id = ?",
      args: [id]
    });
    return result.rows[0] as unknown as Quiz | undefined;
  }

  async getByLevel(levelId: number): Promise<Quiz | undefined> {
    const result = await db.execute({
      sql: "SELECT * FROM quizzes WHERE level_id = ?",
      args: [levelId]
    });
    return result.rows[0] as unknown as Quiz | undefined;
  }

  async create(quiz: Omit<Quiz, "id">): Promise<Quiz> {
    const result = await db.execute({
      sql: `
        INSERT INTO quizzes (level_id, question, options, correct_answer, xp_reward)
        VALUES (?, ?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        quiz.level_id,
        quiz.question,
        quiz.options,
        quiz.correct_answer,
        quiz.xp_reward
      ]
    });
    
    return result.rows[0] as unknown as Quiz;
  }

  async update(id: number, quiz: Partial<Quiz>): Promise<void> {
    const fields = Object.keys(quiz)
      .filter(k => k !== "id")
      .map(k => `${k} = ?`)
      .join(", ");
    
    const values = Object.keys(quiz)
      .filter(k => k !== "id")
      .map(k => (quiz as any)[k]);
    
    await db.execute({
      sql: `UPDATE quizzes SET ${fields} WHERE id = ?`,
      args: [...values, id]
    });
  }

  async delete(id: number): Promise<void> {
    await db.execute({
      sql: "DELETE FROM quizzes WHERE id = ?",
      args: [id]
    });
  }
}
