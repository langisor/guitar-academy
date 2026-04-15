import { getDatabase } from "@/db/database";

export interface Song {
  id: number;
  title: string;
  artist: string;
  chords: string;
  difficulty: string;
  tempo: number;
  capo: number;
  tuning: string;
}

export class SongRepository {
  private db = getDatabase();

  getAll(): Song[] {
    return this.db.prepare("SELECT * FROM songs ORDER BY title").all() as Song[];
  }

  getById(id: number): Song | undefined {
    return this.db.prepare("SELECT * FROM songs WHERE id = ?").get(id) as Song | undefined;
  }

  getByDifficulty(difficulty: string): Song[] {
    return this.db.prepare(
      "SELECT * FROM songs WHERE difficulty = ? ORDER BY title"
    ).all(difficulty) as Song[];
  }

  getByChord(chord: string): Song[] {
    return this.db.prepare(
      "SELECT * FROM songs WHERE chords LIKE ? ORDER BY title"
    ).all(`%${chord}%`) as Song[];
  }

  create(song: Omit<Song, "id">): Song {
    const result = this.db.prepare(`
      INSERT INTO songs (title, artist, chords, difficulty, tempo, capo, tuning)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      song.title,
      song.artist,
      song.chords,
      song.difficulty,
      song.tempo,
      song.capo,
      song.tuning
    );
    
    return this.getById(result.lastInsertRowid as number)!;
  }

  update(id: number, song: Partial<Song>): void {
    const fields = Object.keys(song)
      .filter(k => k !== "id")
      .map(k => `${k} = ?`)
      .join(", ");
    
    const values = Object.keys(song)
      .filter(k => k !== "id")
      .map(k => (song as Record<string, unknown>)[k]);
    
    this.db.prepare(`UPDATE songs SET ${fields} WHERE id = ?`).run(...values, id);
  }

  delete(id: number): void {
    this.db.prepare("DELETE FROM songs WHERE id = ?").run(id);
  }
}

export const songRepository = new SongRepository();
