import { exerciseRepository, Exercise } from "@/repositories";

export class ExerciseService {
  async getExercisesForLevel(levelId: number): Promise<Exercise[]> {
    return await exerciseRepository.getByLevel(levelId);
  }

  async getExercisesByType(type: string): Promise<Exercise[]> {
    return await exerciseRepository.getByType(type);
  }

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    return await exerciseRepository.getById(id);
  }
}

export const exerciseService = new ExerciseService();
