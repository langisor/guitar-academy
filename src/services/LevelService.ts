import { levelRepository, Level } from "@/repositories";

export class LevelService {
  async getLevelById(id: number): Promise<Level | null> {
    const level = await levelRepository.getById(id);
    return level || null;
  }

  async getLevelsForWorld(worldId: number): Promise<Level[]> {
    return await levelRepository.getByWorld(worldId);
  }

  async getAllLevels(): Promise<Level[]> {
    return await levelRepository.getAll();
  }

  async getNextLevel(currentLevelId: number): Promise<Level | null> {
    const next = await levelRepository.getNextLevel(currentLevelId);
    return next || null;
  }

  async unlockNextLevel(currentLevelId: number): Promise<void> {
    const nextLevel = await levelRepository.getNextLevel(currentLevelId);
    if (nextLevel && 'id' in nextLevel) {
      await levelRepository.unlockLevel(nextLevel.id);
    }
  }
}

export const levelService = new LevelService();
