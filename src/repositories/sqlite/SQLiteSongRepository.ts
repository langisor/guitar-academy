import { db } from "@/db/database";
import { ISongRepository } from "../interfaces/ISongRepository";
import { Song } from "../interfaces/types";

export class SQLiteSongRepository implements ISongRepository {
  async getAll(): Promise<Song[]> {
    const result = await db.execute("SELECT * FROM songs ORDER BY title");
    return result.rows as unknown as Song[];
  }

  async getById(id: number): Promise<Song | undefined> {
    const result = await db.execute({
      sql: "SELECT * FROM songs WHERE id = ?",
      args: [id]
    });
    return result.rows[0] as unknown as Song | undefined;
  }

  async getByDifficulty(difficulty: string): Promise<Song[]> {
    const result = await db.execute({
      sql: "SELECT * FROM songs WHERE difficulty = ? ORDER BY title",
      args: [difficulty]
    });
    return result.rows as unknown as Song[];
  }

  async getByChord(chord: string): Promise<Song[]> {
    const result = await db.execute({
      sql: "SELECT * FROM songs WHERE chords LIKE ? ORDER BY title",
      args: [`%${chord}%`]
    });
    return result.rows as unknown as Song[];
  }

  async create(song: Omit<Song, "id">): Promise<Song> {
    const chordsString = Array.isArray(song.chords) ? song.chords.join(",") : song.chords;
    const result = await db.execute({
      sql: `
        INSERT INTO songs (title, artist, chords, difficulty, tempo, capo, tuning)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        song.title,
        song.artist,
        chordsString,
        song.difficulty,
        song.tempo,
        song.capo,
        song.tuning
      ]
    });
    
    return result.rows[0] as unknown as Song;
  }

  async update(id: number, song: Partial<Song>): Promise<void> {
    const songToUpdate = { ...song };
    if (songToUpdate.chords) {
      songToUpdate.chords = Array.isArray(songToUpdate.chords) 
        ? songToUpdate.chords.join(",") 
        : songToUpdate.chords;
    }

    const fields = Object.keys(songToUpdate)
      .filter(k => k !== "id")
      .map(k => `${k} = ?`)
      .join(", ");
    
    const values = Object.keys(songToUpdate)
      .filter(k => k !== "id")
      .map(k => (songToUpdate as any)[k]);
    
    await db.execute({
      sql: `UPDATE songs SET ${fields} WHERE id = ?`,
      args: [...values, id]
    });
  }

  async delete(id: number): Promise<void> {
    await db.execute({
      sql: "DELETE FROM songs WHERE id = ?",
      args: [id]
    });
  }
}
