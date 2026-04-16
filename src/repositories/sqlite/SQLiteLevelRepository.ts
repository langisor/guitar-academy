import { getDatabase } from "@/db/database";
import { ILevelRepository } from "../interfaces/ILevelRepository";
import { Level } from "../interfaces/types";

export class SQLiteLevelRepository implements ILevelRepository {
  private db = getDatabase();

  getAll(): Level[] {
    return this.db.prepare("SELECT * FROM levels ORDER BY world_id, order_index").all() as Level[];
  }

  getById(id: number): Level | undefined {
    return this.db.prepare("SELECT * FROM levels WHERE id = ?").get(id) as Level | undefined;
  }

  getByWorld(worldId: number): Level[] {
    return this.db.prepare(
      "SELECT * FROM levels WHERE world_id = ? ORDER BY order_index"
    ).all(worldId) as Level[];
  }

  getNextLevel(currentLevelId: number): Level | undefined {
    const current = this.getById(currentLevelId);
    if (!current) return undefined;
    
    const next = this.db.prepare(
      "SELECT * FROM levels WHERE world_id = ? AND order_index > ? ORDER BY order_index LIMIT 1"
    ).get(current.world_id, current.order_index) as Level | undefined;
    
    if (next) return next;
    
    return this.db.prepare(
      "SELECT * FROM levels WHERE world_id > ? ORDER BY world_id, order_index LIMIT 1"
    ).get(current.world_id + 1) as Level | undefined;
  }

  unlockLevel(id: number): void {
    this.db.prepare("UPDATE levels SET is_locked = 0 WHERE id = ?").run(id);
  }

  lockLevel(id: number): void {
    this.db.prepare("UPDATE levels SET is_locked = 1 WHERE id = ?").run(id);
  }

  create(level: Omit<Level, "id">): Level {
    const result = this.db.prepare(`
      INSERT INTO levels (world_id, title, description, content_path, difficulty, xp_reward, order_index, is_locked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      level.world_id,
      level.title,
      level.description,
      level.content_path,
      level.difficulty,
      level.xp_reward,
      level.order_index,
      level.is_locked
    );
    return this.getById(result.lastInsertRowid as number)!;
  }

  update(id: number, level: Partial<Level>): void {
    const fields = Object.keys(level)
      .filter(k => k !== "id")
      .map(k => `${k} = ?`)
      .join(", ");
    const values = Object.keys(level)
      .filter(k => k !== "id")
      .map(k => (level as any)[k]);
    this.db.prepare(`UPDATE levels SET ${fields} WHERE id = ?`).run(...values, id);
  }

  delete(id: number): void {
    this.db.prepare("DELETE FROM levels WHERE id = ?").run(id);
  }
}
