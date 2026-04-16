import { exerciseRepository, Exercise } from "@/repositories";

export class ExerciseService {
  async getExercisesForLevel(levelId: number): Promise<Exercise[]> {
    return await exerciseRepository.getByLevel(levelId);
  }

  async getExercisesByType(type: string): Promise<Exercise[]> {
    return await exerciseRepository.getByType(type);
  }
}

export const exerciseService = new ExerciseService();
