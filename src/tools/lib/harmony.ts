import { ChordKey, ChordSuffix } from "../types/chords.types";
import {
  ScaleMode,
  ParsedRoman,
  CommonProgression,
  COMMON_PROGRESSIONS,
} from "../types/progression.types";
import {
  parseRomanNumeral,
  getDefaultQualityForDegree,
  resolveRomanToChordKey,
  romanNumeralToDisplay,
} from "./roman-numerals";

const CHROMATIC = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const NATURAL_MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];
const HARMONIC_MINOR_SCALE = [0, 2, 3, 5, 7, 8, 11];
const MELODIC_MINOR_SCALE = [0, 2, 3, 5, 7, 9, 11];
const DORIAN_SCALE = [0, 2, 3, 5, 7, 9, 10];
const MIXOLYDIAN_SCALE = [0, 2, 4, 5, 7, 9, 10];

export function getScaleIntervals(mode: ScaleMode): number[] {
  switch (mode) {
    case "major":
      return MAJOR_SCALE;
    case "minor":
      return NATURAL_MINOR_SCALE;
    case "harmonicMinor":
      return HARMONIC_MINOR_SCALE;
    case "melodicMinor":
      return MELODIC_MINOR_SCALE;
    case "dorian":
      return DORIAN_SCALE;
    case "mixolydian":
      return MIXOLYDIAN_SCALE;
    default:
      return MAJOR_SCALE;
  }
}

export function getScaleNotes(key: ChordKey, mode: ScaleMode): ChordKey[] {
  const rootIndex = CHROMATIC.indexOf(key);
  const intervals = getScaleIntervals(mode);

  return intervals.map((interval) => {
    const noteIndex = (rootIndex + interval) % 12;
    return CHROMATIC[noteIndex] as ChordKey;
  });
}

export function harmonizeScale(
  key: ChordKey,
  mode: ScaleMode = "major"
): Array<{ degree: number; roman: string; key: ChordKey; suffix: ChordSuffix }> {
  const scaleNotes = getScaleNotes(key, mode);

  return scaleNotes.map((note, index) => {
    const degree = index + 1;
    const suffix = getDefaultQualityForDegree(degree, mode);
    const roman = romanNumeralToDisplay(degree, suffix, mode);

    return {
      degree,
      roman,
      key: note,
      suffix,
    };
  });
}

export function getDegreeChord(
  key: ChordKey,
  degree: number,
  mode: ScaleMode = "major",
  qualityOverride?: ChordSuffix
): { key: ChordKey; suffix: ChordSuffix } {
  const scaleNotes = getScaleNotes(key, mode);
  const note = scaleNotes[degree - 1];
  const suffix = qualityOverride || getDefaultQualityForDegree(degree, mode);

  return { key: note, suffix };
}

export function findCadenceType(
  progression: ParsedRoman[],
  mode: ScaleMode = "major"
): { type: "authentic" | "plagal" | "half" | "deceptive" | null; index: number } {
  if (progression.length < 2) return { type: null, index: -1 };

  const lastTwo = progression.slice(-2);
  const [penultimate, final] = lastTwo;

  if (penultimate.degree === 5 && final.degree === 1) {
    return { type: "authentic", index: progression.length - 2 };
  }

  if (penultimate.degree === 4 && final.degree === 1) {
    return { type: "plagal", index: progression.length - 2 };
  }

  if (penultimate.degree === 5 && final.degree !== 1) {
    return { type: "half", index: progression.length - 2 };
  }

  if (penultimate.degree === 5 && final.degree === 6) {
    return { type: "deceptive", index: progression.length - 2 };
  }

  return { type: null, index: -1 };
}

export function analyzeFunctionalHarmony(
  progression: ParsedRoman[],
  key: ChordKey,
  mode: ScaleMode = "major"
): Array<{
  index: number;
  roman: ParsedRoman;
  function: "tonic" | "subdominant" | "dominant" | "predominant" | "other";
  description: string;
}> {
  return progression.map((roman, index) => {
    let harmonicFunction: "tonic" | "subdominant" | "dominant" | "predominant" | "other";
    let description = "";

    const tonicDegrees = [1];
    const subdominantDegrees = [4];
    const predominantDegrees = [2, 6];
    const dominantDegrees = [5, 7];

    if (tonicDegrees.includes(roman.degree)) {
      harmonicFunction = "tonic";
      description = "Tonic function - home, stable";
    } else if (subdominantDegrees.includes(roman.degree)) {
      harmonicFunction = "subdominant";
      description = "Subdominant - moves away from tonic";
    } else if (predominantDegrees.includes(roman.degree)) {
      harmonicFunction = "predominant";
      description = "Predominant - leads to dominant";
    } else if (dominantDegrees.includes(roman.degree)) {
      harmonicFunction = "dominant";
      description = "Dominant - tension, wants to resolve to tonic";
    } else {
      harmonicFunction = "other";
      description = "Non-diatonic or extended function";
    }

    if (roman.isSecondaryDominant) {
      harmonicFunction = "dominant";
      description = `Secondary dominant V/${roman.targetDegree} - creates forward motion`;
    }

    if (roman.isBorrowed) {
      description += " (Borrowed from parallel mode)";
    }

    return { index, roman, function: harmonicFunction, description };
  });
}

export function getCommonProgressions(): CommonProgression[] {
  return COMMON_PROGRESSIONS;
}

export function generateProgressionFromString(
  input: string,
  key: ChordKey,
  mode: ScaleMode = "major"
): Array<{ roman: ParsedRoman; chordKey: ChordKey; suffix: ChordSuffix }> {
  const tokens = input.split(/[\s\-\,]+/).filter((t) => t.trim());

  return tokens
    .map((token) => {
      const roman = parseRomanNumeral(token);
      if (!roman) return null;

      const resolved = resolveRomanToChordKey(key, roman, mode);
      if (!resolved) return null;

      return {
        roman,
        chordKey: resolved.key,
        suffix: resolved.suffix,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export function transposeProgression(
  progression: ParsedRoman[],
  fromKey: ChordKey,
  toKey: ChordKey,
  mode: ScaleMode = "major"
): Array<{ roman: ParsedRoman; chordKey: ChordKey; suffix: ChordSuffix }> {
  return progression
    .map((roman) => {
      const resolved = resolveRomanToChordKey(toKey, roman, mode);
      if (!resolved) return null;

      return {
        roman,
        chordKey: resolved.key,
        suffix: resolved.suffix,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export function getCircleOfFifthsProgression(
  key: ChordKey,
  mode: ScaleMode = "major"
): Array<{ degree: number; roman: string; key: ChordKey; suffix: ChordSuffix }> {
  const progression = mode === "major" ? [6, 2, 5, 1] : [6, 2, 5, 1];

  return progression.map((degree) => {
    const chord = getDegreeChord(key, degree, mode);
    const roman = romanNumeralToDisplay(degree, chord.suffix, mode);

    return {
      degree,
      roman,
      key: chord.key,
      suffix: chord.suffix,
    };
  });
}

export function getPlagalCadence(
  key: ChordKey,
  mode: ScaleMode = "major"
): Array<{ degree: number; roman: string; key: ChordKey; suffix: ChordSuffix }> {
  return [
    { degree: 4, ...getDegreeChord(key, 4, mode), roman: romanNumeralToDisplay(4, getDegreeChord(key, 4, mode).suffix, mode) },
    { degree: 1, ...getDegreeChord(key, 1, mode), roman: romanNumeralToDisplay(1, getDegreeChord(key, 1, mode).suffix, mode) },
  ];
}

export function getAuthenticCadence(
  key: ChordKey,
  mode: ScaleMode = "major",
  withDominant7: boolean = true
): Array<{ degree: number; roman: string; key: ChordKey; suffix: ChordSuffix }> {
  const dominant = getDegreeChord(key, 5, mode);
  const tonic = getDegreeChord(key, 1, mode);

  return [
    { degree: 5, key: dominant.key, suffix: withDominant7 ? "7" : dominant.suffix, roman: withDominant7 ? "V7" : "V" },
    { degree: 1, key: tonic.key, suffix: tonic.suffix, roman: romanNumeralToDisplay(1, tonic.suffix, mode) },
  ];
}
