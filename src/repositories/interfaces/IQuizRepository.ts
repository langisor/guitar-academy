import { IBaseRepository } from "./IBaseRepository";
import { Quiz } from "./types";

export interface IQuizRepository extends IBaseRepository<Quiz> {
  getByLevel(levelId: number): Quiz | Promise<Quiz | undefined>;
}
