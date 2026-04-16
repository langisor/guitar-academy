import { songRepository, Song } from "@/repositories";

export class SongService {
  async getAllSongs(): Promise<Song[]> {
    return await songRepository.getAll();
  }

  async getSongById(id: number): Promise<Song | null> {
    const song = await songRepository.getById(id);
    return song || null;
  }

  async getSongsByDifficulty(difficulty: string): Promise<Song[]> {
    return await songRepository.getByDifficulty(difficulty);
  }

  async getSongsByChord(chord: string): Promise<Song[]> {
    return await songRepository.getByChord(chord);
  }
}

export const songService = new SongService();
