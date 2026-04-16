import { IBaseRepository } from "./IBaseRepository";
import { Exercise } from "./types";

export interface IExerciseRepository extends IBaseRepository<Exercise> {
  getByLevel(levelId: number): Exercise[] | Promise<Exercise[]>;
  getByType(type: string): Exercise[] | Promise<Exercise[]>;
}
