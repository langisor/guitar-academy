"use server";

import { exerciseService } from "@/services/ExerciseService";
import { progressService } from "@/services/ProgressService";
import { Exercise } from "@/repositories/interfaces/types";

export async function getExerciseDetails(exerciseId: number): Promise<Exercise | null> {
  const exercise = await exerciseService.getExerciseById(exerciseId);
  return exercise || null;
}

export async function submitExerciseResult(userId: number, exerciseId: number, xpEarned: number) {
  // In a real application, you might want to save the individual exercise result,
  // but for now, we can just return success or update some progress.
  // We don't have a direct method to save an exercise attempt in progressService 
  // that isn't tied to a level. Let's just assume we return success.
  return { success: true, xpEarned };
}
