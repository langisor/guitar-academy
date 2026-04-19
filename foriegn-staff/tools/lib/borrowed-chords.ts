import { ChordKey, ChordSuffix } from "../types/chords.types";
import {
  ScaleMode,
  ParsedRoman,
} from "../types/progression.types";
import { parseRomanNumeral, getDefaultQualityForDegree, resolveRomanToChordKey } from "./roman-numerals";
import { getScaleIntervals } from "./harmony";

const CHROMATIC = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

export interface BorrowedChord {
  sourceMode: ScaleMode;
  degree: number;
  roman: string;
  chordKey: ChordKey;
  suffix: ChordSuffix;
  description: string;
  function: string;
}

export function getBorrowedChordsForMajorKey(
  key: ChordKey
): BorrowedChord[] {
  const borrowed: BorrowedChord[] = [];
  const majorIntervals = getScaleIntervals("major");
  const minorIntervals = getScaleIntervals("minor");
  const rootIndex = CHROMATIC.indexOf(key);

  const bVIIIndex = (rootIndex + majorIntervals[0] - 2 + 12) % 12;
  borrowed.push({
    sourceMode: "minor",
    degree: 7,
    roman: "bVII",
    chordKey: CHROMATIC[bVIIIndex] as ChordKey,
    suffix: "major",
    description: "Flat VII from parallel minor",
    function: "Subdominant function, can lead to I",
  });

  const ivIndex = (rootIndex + majorIntervals[3] - 1 + 12) % 12;
  borrowed.push({
    sourceMode: "minor",
    degree: 4,
    roman: "iv",
    chordKey: CHROMATIC[ivIndex] as ChordKey,
    suffix: "minor",
    description: "Minor iv from parallel minor",
    function: "Subdominant with darker color",
  });

  const VIIndex = (rootIndex + majorIntervals[5] - 1 + 12) % 12;
  borrowed.push({
    sourceMode: "minor",
    degree: 6,
    roman: "VI",
    chordKey: CHROMATIC[VIIndex] as ChordKey,
    suffix: "major",
    description: "Major VI from parallel minor",
    function: "Can replace I or vi",
  });

  const iiIndex = (rootIndex + majorIntervals[1]) % 12;
  const iiDimIndex = (iiIndex + 12 - 1) % 12;
  borrowed.push({
    sourceMode: "harmonicMinor",
    degree: 2,
    roman: "ii°",
    chordKey: CHROMATIC[iiDimIndex] as ChordKey,
    suffix: "dim",
    description: "Diminished ii from harmonic minor",
    function: "Predominant, strong pull to V",
  });

  return borrowed;
}

export function getBorrowedChordsForMinorKey(
  key: ChordKey
): BorrowedChord[] {
  const borrowed: BorrowedChord[] = [];
  const majorIntervals = getScaleIntervals("major");
  const rootIndex = CHROMATIC.indexOf(key);

  const IIIIndex = (rootIndex + majorIntervals[2] + 1) % 12;
  borrowed.push({
    sourceMode: "major",
    degree: 3,
    roman: "III",
    chordKey: CHROMATIC[IIIIndex] as ChordKey,
    suffix: "major",
    description: "Major III from parallel major",
    function: "Mediant, can lead to iv",
  });

  const IVIndex = (rootIndex + majorIntervals[3] + 1) % 12;
  borrowed.push({
    sourceMode: "major",
    degree: 4,
    roman: "IV",
    chordKey: CHROMATIC[IVIndex] as ChordKey,
    suffix: "major",
    description: "Major IV from parallel major",
    function: "Subdominant, brighter than iv",
  });

  const VIndex = (rootIndex + majorIntervals[4] + 1) % 12;
  borrowed.push({
    sourceMode: "major",
    degree: 5,
    roman: "V",
    chordKey: CHROMATIC[VIndex] as ChordKey,
    suffix: "major",
    description: "Major V from parallel major (more common in minor)",
    function: "Dominant with leading tone",
  });

  const VIIndex = (rootIndex + majorIntervals[5] + 1) % 12;
  borrowed.push({
    sourceMode: "major",
    degree: 6,
    roman: "VI",
    chordKey: CHROMATIC[VIIndex] as ChordKey,
    suffix: "major",
    description: "Major VI from parallel major",
    function: "Submediant, deceptive cadence target",
  });

  return borrowed;
}

export function getNeapolitanChord(
  key: ChordKey,
  mode: ScaleMode = "minor"
): { roman: string; key: ChordKey; suffix: ChordSuffix; description: string } {
  const majorIntervals = getScaleIntervals("major");
  const rootIndex = CHROMATIC.indexOf(key);

  const secondDegreeInterval = majorIntervals[1];
  const neapolitanIndex = (rootIndex + secondDegreeInterval - 1 + 12) % 12;

  return {
    roman: "N",
    key: CHROMATIC[neapolitanIndex] as ChordKey,
    suffix: "major",
    description: "Neapolitan chord - major triad on flattened II, typically in first inversion (N6)",
  };
}

export function getModalInterchangeChords(
  key: ChordKey,
  currentMode: ScaleMode
): BorrowedChord[] {
  if (currentMode === "major") {
    return getBorrowedChordsForMajorKey(key);
  } else if (currentMode === "minor") {
    return getBorrowedChordsForMinorKey(key);
  }

  return [...getBorrowedChordsForMajorKey(key), ...getBorrowedChordsForMinorKey(key)];
}

export function analyzeBorrowedChordsInProgression(
  progression: ParsedRoman[],
  key: ChordKey,
  mode: ScaleMode = "major"
): Array<{
  index: number;
  roman: ParsedRoman;
  isBorrowed: boolean;
  borrowSource?: ScaleMode;
  expectedSuffix: ChordSuffix;
  actualSuffix: ChordSuffix;
  description: string;
}> {
  return progression.map((roman, index) => {
    const resolved = resolveRomanToChordKey(key, roman, mode);
    if (!resolved) {
      return {
        index,
        roman,
        isBorrowed: false,
        expectedSuffix: "major",
        actualSuffix: "major",
        description: "Could not resolve",
      };
    }

    const expectedSuffix = getDefaultQualityForDegree(roman.degree, mode);
    const isBorrowed = roman.isBorrowed || resolved.suffix !== expectedSuffix;

    let borrowSource: ScaleMode | undefined;
    let description = "Diatonic chord";

    if (isBorrowed) {
      if (mode === "major") {
        borrowSource = "minor";
        description = `Borrowed from parallel minor`;
      } else if (mode === "minor") {
        borrowSource = "major";
        description = `Borrowed from parallel major`;
      }

      if (roman.display === "N" || roman.display === "N6") {
        borrowSource = "minor";
        description = "Neapolitan chord - borrowed flattened II";
      }
    }

    return {
      index,
      roman,
      isBorrowed,
      borrowSource,
      expectedSuffix,
      actualSuffix: resolved.suffix,
      description,
    };
  });
}

export function suggestBorrowedChordSubstitutions(
  roman: ParsedRoman,
  key: ChordKey,
  mode: ScaleMode = "major"
): BorrowedChord[] {
  const borrowed = getModalInterchangeChords(key, mode);

  return borrowed.filter((b) => b.degree === roman.degree);
}
