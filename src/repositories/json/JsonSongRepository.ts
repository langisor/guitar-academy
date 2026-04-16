import { ISongRepository } from "../interfaces/ISongRepository";
import { Song } from "../interfaces/types";
import songsData from "@/data/songs.json";

export class JsonSongRepository implements ISongRepository {
  private songs: Song[];

  constructor() {
    this.songs = songsData.songs;
  }

  getAll(): Song[] {
    return this.songs;
  }

  getById(id: number): Song | undefined {
    return this.songs.find(s => s.id === id);
  }

  getByDifficulty(difficulty: string): Song[] {
    return this.songs.filter(s => s.difficulty === difficulty);
  }

  getByChord(chord: string): Song[] {
    return this.songs.filter(s => {
      if (Array.isArray(s.chords)) {
        return s.chords.includes(chord);
      }
      return s.chords.includes(chord);
    });
  }

  create(song: Omit<Song, "id">): Song {
    const newId = Math.max(...this.songs.map(s => s.id), 0) + 1;
    const newSong = { ...song, id: newId } as Song;
    this.songs.push(newSong);
    return newSong;
  }

  update(id: number, song: Partial<Song>): void {
    const index = this.songs.findIndex(s => s.id === id);
    if (index !== -1) {
      this.songs[index] = { ...this.songs[index], ...song };
    }
  }

  delete(id: number): void {
    this.songs = this.songs.filter(s => s.id !== id);
  }
}
