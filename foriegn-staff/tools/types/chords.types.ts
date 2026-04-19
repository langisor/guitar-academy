export interface GuitarMain {
  strings: number;
  fretsOnChord: number;
  name: string;
}

export interface GuitarTunings {
  standard: string[];
  [key: string]: string[];
}

export type ChordKey =
  | "C" | "C#" | "D" | "Eb" | "E" | "F"
  | "F#" | "G" | "Ab" | "A" | "Bb" | "B";

export type ChordSuffix = "major" | "minor" | "dim" | (string & {});

export interface ChordPosition {
  frets: number[];       // -1 mute, 0 open, 1+ fret
  fingers: number[];     // 0–4 finger index
  baseFret: number;
  barres: number[];
  capo?: boolean;
  midi: number[];
}

export interface Chord {
  key: ChordKey;
  suffix: ChordSuffix;
  positions: ChordPosition[];
}

export interface GuitarData {
  main: GuitarMain;
  tunings: GuitarTunings;
  keys: ChordKey[];
  suffixes: ChordSuffix[];
  chords: Partial<Record<ChordKey, Chord[]>>;
}