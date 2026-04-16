import { IBaseRepository } from "./IBaseRepository";
import { Song } from "./types";

export interface ISongRepository extends IBaseRepository<Song> {
  getByDifficulty(difficulty: string): Song[] | Promise<Song[]>;
  getByChord(chord: string): Song[] | Promise<Song[]>;
}
