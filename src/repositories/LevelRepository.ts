import { getDatabase } from "@/db/database";

export interface Level {
  id: number;
  world_id: number;
  title: string;
  description: string | null;
  content_path: string | null;
  difficulty: string;
  xp_reward: number;
  order_index: number;
  is_locked: number;
}

export class LevelRepository {
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
}

export const levelRepository = new LevelRepository();
