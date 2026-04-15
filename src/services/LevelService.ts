import { levelRepository, Level } from "@/repositories/LevelRepository";

export class LevelService {
  async getLevelById(id: number): Promise<Level | null> {
    const level = levelRepository.getById(id);
    return level || null;
  }

  async getLevelsForWorld(worldId: number): Promise<Level[]> {
    return levelRepository.getByWorld(worldId);
  }

  async getAllLevels(): Promise<Level[]> {
    return levelRepository.getAll();
  }

  async getNextLevel(currentLevelId: number): Promise<Level | null> {
    return levelRepository.getNextLevel(currentLevelId) || null;
  }

  async unlockNextLevel(currentLevelId: number): Promise<void> {
    const nextLevel = levelRepository.getNextLevel(currentLevelId);
    if (nextLevel) {
      levelRepository.unlockLevel(nextLevel.id);
    }
  }
}

export const levelService = new LevelService();
