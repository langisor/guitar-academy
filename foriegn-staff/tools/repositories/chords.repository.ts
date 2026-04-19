import { promises as fs } from "fs";
import path from "path";
import { Chord, ChordKey, GuitarData } from "../types/chords.types";

/**
 * Internal memory cache + index
 */
type ChordIndex = Map<string, Chord[]>;

export class ChordsRepository {
  private static instance: ChordsRepository;

  private cache: GuitarData | null = null;
  private index: ChordIndex = new Map();
  private loadingPromise: Promise<GuitarData> | null = null;

  private constructor() {}

  public static getInstance(): ChordsRepository {
    if (!ChordsRepository.instance) {
      ChordsRepository.instance = new ChordsRepository();
    }
    return ChordsRepository.instance;
  }

  /**
   * Load JSON once and cache it in memory
   */
  private async load(): Promise<GuitarData> {
    if (this.cache) return this.cache;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      const filePath = path.resolve(
        process.cwd(),
        "src/chords/data/chords.json"
      );

      const raw = await fs.readFile(filePath, "utf-8");
      const parsed: GuitarData = JSON.parse(raw);

      this.cache = parsed;

      await this.buildIndex(parsed);

      return parsed;
    })();

    return this.loadingPromise;
  }

  /**
   * Build fast lookup index
   */
  private async buildIndex(data: GuitarData): Promise<void> {
    const keys = Object.keys(data.chords);

    const tasks = keys.map(async (key) => {
      const variants = data.chords[key as ChordKey] ?? [];

      this.index.set(key.toLowerCase(), variants);

      variants.forEach((v) => {
        const compound = `${v.key.toLowerCase()}-${v.suffix.toLowerCase()}`;
        this.index.set(compound, [v]);
      });
    });

    await Promise.all(tasks);
  }

  private async ensureLoaded(): Promise<GuitarData> {
    return this.load();
  }

  /**
   * Get all musical keys
   */
  async getKeys(): Promise<ChordKey[]> {
    const data = await this.ensureLoaded();
    return data.keys;
  }

  /**
   * Get suffixes
   */
  async getSuffixes(): Promise<string[]> {
    const data = await this.ensureLoaded();
    return data.suffixes;
  }

  /**
   * Get all chords for a key
   */
  async getChordsByKey(key: ChordKey): Promise<Chord[]> {
    await this.ensureLoaded();
    return this.index.get(key.toLowerCase()) ?? [];
  }

  /**
   * Get single chord
   */
  async getChord(key: ChordKey, suffix: string): Promise<Chord | null> {
    await this.ensureLoaded();

    const result = this.index.get(
      `${key.toLowerCase()}-${suffix.toLowerCase()}`
    );

    return result?.[0] ?? null;
  }

  /**
   * Full dataset (rare use)
   */
  async getAll(): Promise<GuitarData> {
    return this.ensureLoaded();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = null;
    this.index.clear();
    this.loadingPromise = null;
  }
}