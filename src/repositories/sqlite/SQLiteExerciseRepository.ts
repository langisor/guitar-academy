import { db } from "@/db/database";
import { IExerciseRepository } from "../interfaces/IExerciseRepository";
import { Exercise } from "../interfaces/types";

export class SQLiteExerciseRepository implements IExerciseRepository {
  async getAll(): Promise<Exercise[]> {
    const result = await db.execute("SELECT * FROM exercises ORDER BY level_id, order_index");
    return result.rows as unknown as Exercise[];
  }

  async getById(id: number): Promise<Exercise | undefined> {
    const result = await db.execute({
      sql: "SELECT * FROM exercises WHERE id = ?",
      args: [id]
    });
    return result.rows[0] as unknown as Exercise | undefined;
  }

  async getByLevel(levelId: number): Promise<Exercise[]> {
    const result = await db.execute({
      sql: "SELECT * FROM exercises WHERE level_id = ? ORDER BY order_index",
      args: [levelId]
    });
    return result.rows as unknown as Exercise[];
  }

  async getByType(type: string): Promise<Exercise[]> {
    const result = await db.execute({
      sql: "SELECT * FROM exercises WHERE type = ? ORDER BY RANDOM() LIMIT 10",
      args: [type]
    });
    return result.rows as unknown as Exercise[];
  }

  async create(exercise: Omit<Exercise, "id">): Promise<Exercise> {
    const result = await db.execute({
      sql: `
        INSERT INTO exercises (level_id, type, question, options, correct_answer, data, xp_reward, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        exercise.level_id,
        exercise.type,
        exercise.question,
        exercise.options,
        exercise.correct_answer,
        exercise.data,
        exercise.xp_reward,
        exercise.order_index
      ]
    });
    
    return result.rows[0] as unknown as Exercise;
  }

  async update(id: number, exercise: Partial<Exercise>): Promise<void> {
    const fields = Object.keys(exercise)
      .filter(k => k !== "id")
      .map(k => `${k} = ?`)
      .join(", ");
    
    const values = Object.keys(exercise)
      .filter(k => k !== "id")
      .map(k => (exercise as any)[k]);
    
    await db.execute({
      sql: `UPDATE exercises SET ${fields} WHERE id = ?`,
      args: [...values, id]
    });
  }

  async delete(id: number): Promise<void> {
    await db.execute({
      sql: "DELETE FROM exercises WHERE id = ?",
      args: [id]
    });
  }
}
