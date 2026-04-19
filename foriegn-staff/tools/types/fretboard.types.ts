import { ChordPosition } from "./chords.types";

export interface FretboardNote {
  string: number;
  fret: number;
  note: string;
  midi: number;
  octave: number;
}

export interface FretboardPosition extends FretboardNote {
  finger?: number;
  isRoot?: boolean;
  isMuted?: boolean;
  isOpen?: boolean;
}

export interface StringTuning {
  note: string;
  octave: number;
  midi: number;
}

export interface FretboardConfig {
  strings: number;
  frets: number;
  tuning: StringTuning[];
}

export interface Fingering {
  positions: FretboardPosition[];
  barres: Array<{
    fret: number;
    startString: number;
    endString: number;
    finger: number;
  }>;
  stretchRating: number;
  difficulty: "easy" | "medium" | "hard";
  fretSpan: number;
  lowestFret: number;
  highestFret: number;
  openStrings: number;
  mutedStrings: number;
  voicingType: "root" | "firstInversion" | "secondInversion" | "thirdInversion" | "spread";
}

export interface VoicingAnalysis {
  fingering: Fingering;
  chordPosition: ChordPosition;
  notes: string[];
  intervals: string[];
  bassNote: string;
  rootPosition: boolean;
  completeness: number;
  doubles: number;
  omissions: string[];
  playable: boolean;
  score: number;
}

export interface VoiceLeadingTransition {
  from: VoicingAnalysis;
  to: VoicingAnalysis;
  distance: number;
  commonTones: number;
  smoothness: number;
  fingerMovement: number;
  recommended: boolean;
}

export interface FretboardRegion {
  startFret: number;
  endFret: number;
  startString: number;
  endString: number;
  name: string;
}

export interface TransformedPosition {
  original: ChordPosition;
  transposed: ChordPosition;
  shiftAmount: number;
  valid: boolean;
  reason?: string;
}

export const STANDARD_TUNING: StringTuning[] = [
  { note: "E", octave: 2, midi: 40 },
  { note: "A", octave: 2, midi: 45 },
  { note: "D", octave: 3, midi: 50 },
  { note: "G", octave: 3, midi: 55 },
  { note: "B", octave: 3, midi: 59 },
  { note: "E", octave: 4, midi: 64 },
];

export const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

export const FRETBOARD_REGIONS: FretboardRegion[] = [
  { startFret: 0, endFret: 4, startString: 0, endString: 5, name: "Open Position" },
  { startFret: 5, endFret: 8, startString: 0, endString: 5, name: "5th Position" },
  { startFret: 9, endFret: 12, startString: 0, endString: 5, name: "9th Position" },
  { startFret: 0, endFret: 12, startString: 0, endString: 3, name: "Low Strings" },
  { startFret: 0, endFret: 12, startString: 2, endString: 5, name: "High Strings" },
];

export interface FretboardVisualModel {
  config: FretboardConfig;
  notes: FretboardNote[];
  highlightedRegions?: FretboardRegion[];
  activePositions?: FretboardPosition[];
  showIntervals?: boolean;
  rootNote?: string;
}
