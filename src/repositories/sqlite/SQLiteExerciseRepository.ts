import { getDatabase } from "@/db/database";
import { IExerciseRepository } from "../interfaces/IExerciseRepository";
import { Exercise } from "../interfaces/types";

export class SQLiteExerciseRepository implements IExerciseRepository {
  private db = getDatabase();

  getAll(): Exercise[] {
    return this.db.prepare("SELECT * FROM exercises ORDER BY level_id, order_index").all() as Exercise[];
  }

  getById(id: number): Exercise | undefined {
    return this.db.prepare("SELECT * FROM exercises WHERE id = ?").get(id) as Exercise | undefined;
  }

  getByLevel(levelId: number): Exercise[] {
    return this.db.prepare(
      "SELECT * FROM exercises WHERE level_id = ? ORDER BY order_index"
    ).all(levelId) as Exercise[];
  }

  getByType(type: string): Exercise[] {
    return this.db.prepare(
      "SELECT * FROM exercises WHERE type = ? ORDER BY RANDOM() LIMIT 10"
    ).all(type) as Exercise[];
  }

  create(exercise: Omit<Exercise, "id">): Exercise {
    const result = this.db.prepare(`
      INSERT INTO exercises (level_id, type, question, options, correct_answer, data, xp_reward, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      exercise.level_id,
      exercise.type,
      exercise.question,
      exercise.options,
      exercise.correct_answer,
      exercise.data,
      exercise.xp_reward,
      exercise.order_index
    );
    
    return this.getById(result.lastInsertRowid as number)!;
  }

  update(id: number, exercise: Partial<Exercise>): void {
    const fields = Object.keys(exercise)
      .filter(k => k !== "id")
      .map(k => `${k} = ?`)
      .join(", ");
    
    const values = Object.keys(exercise)
      .filter(k => k !== "id")
      .map(k => (exercise as any)[k]);
    
    this.db.prepare(`UPDATE exercises SET ${fields} WHERE id = ?`).run(...values, id);
  }

  delete(id: number): void {
    this.db.prepare("DELETE FROM exercises WHERE id = ?").run(id);
  }
}
