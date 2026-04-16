import { IBaseRepository } from "./IBaseRepository";
import { Level } from "./types";

export interface ILevelRepository extends IBaseRepository<Level> {
  getByWorld(worldId: number): Level[] | Promise<Level[]>;
  getNextLevel(currentLevelId: number): Level | undefined | Promise<Level | undefined>;
  unlockLevel(id: number): void | Promise<void>;
  lockLevel(id: number): void | Promise<void>;
}
