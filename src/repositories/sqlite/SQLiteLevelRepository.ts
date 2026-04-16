import { db } from "@/db/database";
import { ILevelRepository } from "../interfaces/ILevelRepository";
import { Level } from "../interfaces/types";

export class SQLiteLevelRepository implements ILevelRepository {
  async getAll(): Promise<Level[]> {
    const result = await db.execute("SELECT * FROM levels ORDER BY world_id, order_index");
    return result.rows as unknown as Level[];
  }

  async getById(id: number): Promise<Level | undefined> {
    const result = await db.execute({
      sql: "SELECT * FROM levels WHERE id = ?",
      args: [id]
    });
    return result.rows[0] as unknown as Level | undefined;
  }

  async getByWorld(worldId: number): Promise<Level[]> {
    const result = await db.execute({
      sql: "SELECT * FROM levels WHERE world_id = ? ORDER BY order_index",
      args: [worldId]
    });
    return result.rows as unknown as Level[];
  }

  async getNextLevel(currentLevelId: number): Promise<Level | undefined> {
    const current = await this.getById(currentLevelId);
    if (!current) return undefined;
    
    const nextResult = await db.execute({
      sql: "SELECT * FROM levels WHERE world_id = ? AND order_index > ? ORDER BY order_index LIMIT 1",
      args: [current.world_id, current.order_index]
    });
    
    if (nextResult.rows[0]) return nextResult.rows[0] as unknown as Level;
    
    const firstInNextWorld = await db.execute({
      sql: "SELECT * FROM levels WHERE world_id > ? ORDER BY world_id, order_index LIMIT 1",
      args: [current.world_id]
    });
    
    return firstInNextWorld.rows[0] as unknown as Level | undefined;
  }

  async unlockLevel(id: number): Promise<void> {
    await db.execute({
      sql: "UPDATE levels SET is_locked = 0 WHERE id = ?",
      args: [id]
    });
  }

  async lockLevel(id: number): Promise<void> {
    await db.execute({
      sql: "UPDATE levels SET is_locked = 1 WHERE id = ?",
      args: [id]
    });
  }

  async create(level: Omit<Level, "id">): Promise<Level> {
    const result = await db.execute({
      sql: `
        INSERT INTO levels (world_id, title, description, content_path, difficulty, xp_reward, order_index, is_locked)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        level.world_id,
        level.title,
        level.description,
        level.content_path,
        level.difficulty,
        level.xp_reward,
        level.order_index,
        level.is_locked
      ]
    });
    return result.rows[0] as unknown as Level;
  }

  async update(id: number, level: Partial<Level>): Promise<void> {
    const fields = Object.keys(level)
      .filter(k => k !== "id")
      .map(k => `${k} = ?`)
      .join(", ");
    const values = Object.keys(level)
      .filter(k => k !== "id")
      .map(k => (level as any)[k]);
    
    await db.execute({
      sql: `UPDATE levels SET ${fields} WHERE id = ?`,
      args: [...values, id]
    });
  }

  async delete(id: number): Promise<void> {
    await db.execute({
      sql: "DELETE FROM levels WHERE id = ?",
      args: [id]
    });
  }
}
