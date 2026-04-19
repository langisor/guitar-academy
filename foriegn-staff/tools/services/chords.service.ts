import { ChordsRepository } from "../repositories/chords.repository";
import { Chord, ChordKey, ChordSuffix, GuitarData } from "../types/chords.types";

export class ChordsService {
  private static instance: ChordsService;
  private repo: ChordsRepository;

  private constructor() {
    this.repo = ChordsRepository.getInstance();
  }

  public static getInstance(): ChordsService {
    if (!ChordsService.instance) {
      ChordsService.instance = new ChordsService();
    }
    return ChordsService.instance;
  }

  // ----------------------------
  // BASIC DATA
  // ----------------------------

  async getAvailableKeys(): Promise<ChordKey[]> {
    return this.repo.getKeys();
  }

  async getAvailableSuffixes(): Promise<ChordSuffix[]> {
    return this.repo.getSuffixes() as Promise<ChordSuffix[]>;
  }

  async getMetadata(): Promise<GuitarData> {
    return this.repo.getAll();
  }

  // ----------------------------
  // CHORD DATA
  // ----------------------------

  async getChordsForKey(key: ChordKey): Promise<Chord[]> {
    return this.repo.getChordsByKey(key);
  }

  async getChordDetail(
    key: ChordKey,
    suffix: ChordSuffix
  ): Promise<Chord | null> {
    return this.repo.getChord(key, suffix);
  }

  // ----------------------------
  // UI HELPERS
  // ----------------------------

  async getDefaultChord(): Promise<Chord | null> {
    const keys = await this.repo.getKeys();
    if (!keys.length) return null;

    const chords = await this.repo.getChordsByKey(keys[0]);
    return chords?.[0] ?? null;
  }

  async getChordSelectorModel(): Promise<
    Array<{ key: ChordKey; suffixes: ChordSuffix[] }>
  > {
    const keys = await this.repo.getKeys();

    return Promise.all(
      keys.map(async (key) => {
        const chords = await this.repo.getChordsByKey(key);

        return {
          key,
          suffixes: chords.map((c) => c.suffix as ChordSuffix),
        };
      })
    );
  }

  async getRenderableChord(
    key: ChordKey,
    suffix: ChordSuffix
  ): Promise<{
    key: ChordKey;
    suffix: ChordSuffix;
    positions: Chord["positions"];
  } | null> {
    const chord = await this.repo.getChord(key, suffix);

    if (!chord) return null;

    return {
      key: chord.key,
      suffix: chord.suffix as ChordSuffix,
      positions: chord.positions,
    };
  }

  async getPrimaryChordShape(
    key: ChordKey,
    suffix: ChordSuffix
  ): Promise<Chord["positions"][number] | null> {
    const chord = await this.repo.getChord(key, suffix);

    if (!chord?.positions.length) return null;

    return [...chord.positions].sort(
      (a, b) => a.baseFret - b.baseFret
    )[0];
  }

  // ----------------------------
  // SEARCH
  // ----------------------------

  async searchChords(query: string): Promise<
    Array<{ key: ChordKey; suffix: ChordSuffix }>
  > {
    const data = await this.repo.getAll();
    const q = query.toLowerCase();

    const results: Array<{ key: ChordKey; suffix: ChordSuffix }> = [];

    Object.values(data.chords).forEach((group) => {
      group.forEach((chord) => {
        const full = `${chord.key} ${chord.suffix}`.toLowerCase();

        if (full.includes(q)) {
          results.push({
            key: chord.key,
            suffix: chord.suffix as ChordSuffix,
          });
        }
      });
    });

    return results;
  }
}