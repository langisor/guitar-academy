import { SQLiteLevelRepository } from "./sqlite/SQLiteLevelRepository";
import { SQLiteExerciseRepository } from "./sqlite/SQLiteExerciseRepository";
import { SQLiteSongRepository } from "./sqlite/SQLiteSongRepository";
import { SQLiteProgressRepository } from "./sqlite/SQLiteProgressRepository";
import { SQLiteDailyGoalRepository } from "./sqlite/SQLiteDailyGoalRepository";
import { SQLitePracticeSessionRepository } from "./sqlite/SQLitePracticeSessionRepository";
import { SQLiteQuizRepository } from "./sqlite/SQLiteQuizRepository";

import { JsonSongRepository } from "./json/JsonSongRepository";

import { ILevelRepository } from "./interfaces/ILevelRepository";
import { IExerciseRepository } from "./interfaces/IExerciseRepository";
import { ISongRepository } from "./interfaces/ISongRepository";
import { IProgressRepository } from "./interfaces/IProgressRepository";
import { IDailyGoalRepository } from "./interfaces/IDailyGoalRepository";
import { IPracticeSessionRepository } from "./interfaces/IPracticeSessionRepository";
import { IQuizRepository } from "./interfaces/IQuizRepository";

const useSQLite = process.env.DATA_SOURCE === "sqlite" || true;

export const levelRepository: ILevelRepository = new SQLiteLevelRepository();
export const exerciseRepository: IExerciseRepository = new SQLiteExerciseRepository();
export const songRepository: ISongRepository = useSQLite 
  ? new SQLiteSongRepository() 
  : new JsonSongRepository();
export const progressRepository: IProgressRepository = new SQLiteProgressRepository();
export const dailyGoalRepository: IDailyGoalRepository = new SQLiteDailyGoalRepository();
export const practiceSessionRepository: IPracticeSessionRepository = new SQLitePracticeSessionRepository();
export const quizRepository: IQuizRepository = new SQLiteQuizRepository();

export * from "./interfaces/types";
