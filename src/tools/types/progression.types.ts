import { Chord, ChordKey, ChordSuffix } from "./chords.types";

export type RomanCase = "upper" | "lower";
export type RomanModifier = "" | "7" | "maj7" | "min7" | "dim" | "aug" | "+" | "°" | "sus4" | "sus2" | "add9" | "6" | "9";

export type RomanNumeral =
  | "I" | "II" | "III" | "IV" | "V" | "VI" | "VII"
  | "i" | "ii" | "iii" | "iv" | "v" | "vi" | "vii"
  | "I7" | "II7" | "III7" | "IV7" | "V7" | "VI7" | "VII7"
  | "i7" | "ii7" | "iii7" | "iv7" | "v7" | "vi7" | "vii7"
  | "Imaj7" | "IImaj7" | "IIImaj7" | "IVmaj7" | "Vmaj7" | "VImaj7" | "VIImaj7"
  | "imaj7" | "iimaj7" | "iiimaj7" | "ivmaj7" | "vmaj7" | "vimaj7" | "viimaj7"
  | "i°" | "ii°" | "iii°" | "iv°" | "v°" | "vi°" | "vii°"
  | "I+" | "II+" | "III+" | "IV+" | "V+" | "VI+" | "VII+"
  | "Vsus4" | "Isus4" | "IVsus4"
  | "V/V" | "V/ii" | "V/iii" | "V/iv" | "V/v" | "V/vi" | "V/vii"
  | "N" | "N6";

export type ScaleMode = "major" | "minor" | "harmonicMinor" | "melodicMinor" | "dorian" | "mixolydian";

export interface ScaleDegree {
  degree: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  quality: ChordSuffix;
  accidental?: "sharp" | "flat" | null;
}

export interface ParsedRoman {
  numeral: string;
  case: RomanCase;
  modifier: RomanModifier;
  degree: number;
  quality: ChordSuffix;
  isSecondaryDominant: boolean;
  targetDegree?: number;
  isBorrowed: boolean;
  borrowSource?: ScaleMode;
  display: RomanNumeral;
}

export interface ProgressionStep {
  id: string;
  roman: ParsedRoman;
  chord?: Chord;
  positionIndex: number;
  optional: boolean;
  duration?: number;
}

export interface ChordProgression {
  id: string;
  name: string;
  key: ChordKey;
  mode: ScaleMode;
  steps: ProgressionStep[];
  tags: string[];
  description?: string;
}

export interface SuggestionResult {
  step: ProgressionStep;
  score: number;
  reasons: string[];
  voiceLeadingDistance?: number;
  cadenceStrength?: number;
  functionalWeight?: number;
}

export interface HarmonyAnalysis {
  key: ChordKey;
  mode: ScaleMode;
  tonalCenter: ChordKey;
  modulations: Array<{ stepIndex: number; newKey: ChordKey }>;
  cadences: Array<{ type: "authentic" | "plagal" | "half" | "deceptive"; stepIndex: number }>;
  borrowedChords: Array<{ stepIndex: number; source: ScaleMode; description: string }>;
  secondaryDominants: Array<{ stepIndex: number; target: string; description: string }>;
}

export interface CommonProgression {
  name: string;
  numerals: string[];
  tags: string[];
  description: string;
  popularSongs?: string[];
}

export const COMMON_PROGRESSIONS: CommonProgression[] = [
  {
    name: "Pop Punk",
    numerals: ["I", "V", "vi", "IV"],
    tags: ["pop", "rock", "common"],
    description: "The classic pop progression used in countless songs",
    popularSongs: ["Let It Be", "Someone Like You", "I'm Yours"],
  },
  {
    name: "Axis",
    numerals: ["I", "V", "vi", "iii", "IV", "I", "IV", "V"],
    tags: ["classical", "pachelbel", "canon"],
    description: "Pachelbel's Canon progression",
  },
  {
    name: "Jazz Turnaround",
    numerals: ["ii7", "V7", "Imaj7", "Imaj7"],
    tags: ["jazz", "turnaround", "standards"],
    description: "Classic ii-V-I jazz progression",
  },
  {
    name: "Blues",
    numerals: ["I7", "IV7", "I7", "V7", "IV7", "I7", "V7"],
    tags: ["blues", "12-bar", "dominant"],
    description: "Standard 12-bar blues progression",
  },
  {
    name: "Andalusian Cadence",
    numerals: ["i", "VII", "VI", "V"],
    tags: ["flamenco", "spanish", "minor"],
    description: "Flamenco progression, descending tetrachord",
  },
  {
    name: "Circle of Fifths",
    numerals: ["vi", "ii", "V", "I"],
    tags: ["functional", "strong", "common"],
    description: "Strong functional progression following circle of fifths",
  },
  {
    name: "Modal Interchange",
    numerals: ["I", "bVII", "IV", "I"],
    tags: ["rock", "borrowed", "mixolydian"],
    description: "Borrowed bVII from parallel minor",
  },
  {
    name: "Lament",
    numerals: ["i", "VII", "VI", "v"],
    tags: ["minor", "descending", "emotional"],
    description: "Descending bass line in minor",
  },
  {
    name: "Take Five",
    numerals: ["i", "V7", "i", "II7", "v", "IV7", "i"],
    tags: ["jazz", "modal", "extended"],
    description: "Dave Brubeck style progression",
  },
  {
    name: "Rhythm Changes",
    numerals: ["I", "vi", "ii", "V", "I", "IV", "iii", "vi", "ii", "V"],
    tags: ["jazz", "swing", "standards"],
    description: "Gershwin I Got Rhythm changes",
  },
];
