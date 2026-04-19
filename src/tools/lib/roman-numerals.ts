import { ChordKey, ChordSuffix } from "../types/chords.types";
import {
  RomanNumeral,
  ParsedRoman,
  RomanCase,
  RomanModifier,
  ScaleMode,
} from "../types/progression.types";

const ROMAN_TO_NUMBER: Record<string, number> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7,
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7,
};

const NUMBER_TO_ROMAN_UPPER: Record<number, string> = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII",
};

const NUMBER_TO_ROMAN_LOWER: Record<number, string> = {
  1: "i", 2: "ii", 3: "iii", 4: "iv", 5: "v", 6: "vi", 7: "vii",
};

const CHROMATIC_NOTES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const SCALE_INTERVALS: Record<ScaleMode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

const MAJOR_SCALE_QUALITY: Record<number, ChordSuffix> = {
  1: "major",
  2: "minor",
  3: "minor",
  4: "major",
  5: "major",
  6: "minor",
  7: "dim",
};

const MINOR_SCALE_QUALITY: Record<number, ChordSuffix> = {
  1: "minor",
  2: "dim",
  3: "major",
  4: "minor",
  5: "minor",
  6: "major",
  7: "major",
};

const HARMONIC_MINOR_QUALITY: Record<number, ChordSuffix> = {
  1: "minor",
  2: "dim",
  3: "aug",
  4: "minor",
  5: "major",
  6: "major",
  7: "dim",
};

function getKeyIndex(key: ChordKey): number {
  return CHROMATIC_NOTES.indexOf(key);
}

function getNoteAtInterval(rootIndex: number, interval: number): ChordKey {
  const noteIndex = (rootIndex + interval) % 12;
  return CHROMATIC_NOTES[noteIndex] as ChordKey;
}

export function parseRomanNumeral(input: string): ParsedRoman | null {
  const normalized = input.trim();

  const secondaryMatch = normalized.match(/^[vV]\/([iIvV]+)$/);
  if (secondaryMatch) {
    const targetRoman = secondaryMatch[1];
    const targetDegree = ROMAN_TO_NUMBER[targetRoman.toUpperCase()];
    if (!targetDegree) return null;

    return {
      numeral: "V",
      case: "upper",
      modifier: "7",
      degree: 5,
      quality: "7",
      isSecondaryDominant: true,
      targetDegree,
      isBorrowed: false,
      display: `V/${targetRoman}` as RomanNumeral,
    };
  }

  const neapolitanMatch = normalized.match(/^N6?$/i);
  if (neapolitanMatch) {
    return {
      numeral: "N",
      case: "upper",
      modifier: "",
      degree: 2,
      quality: "major",
      isSecondaryDominant: false,
      isBorrowed: true,
      borrowSource: "major",
      display: "N" as RomanNumeral,
    };
  }

  const regex = /^([iIvV]+)(°|\+|maj7|min7|m7|7|6|9|sus4|sus2|add9)?$/;
  const match = normalized.match(regex);

  if (!match) return null;

  const romanPart = match[1];
  const modifier = (match[2] || "") as RomanModifier;

  const caseType: RomanCase = romanPart === romanPart.toUpperCase() ? "upper" : "lower";
  const degree = ROMAN_TO_NUMBER[romanPart.toUpperCase()];

  if (!degree) return null;

  let quality: ChordSuffix = deriveQualityFromModifier(caseType, modifier, degree);

  const modifierMap: Record<string, RomanModifier> = {
    "m7": "min7",
    "°": "dim",
    "+": "aug",
  };

  return {
    numeral: romanPart,
    case: caseType,
    modifier: modifierMap[modifier] || modifier || "",
    degree,
    quality,
    isSecondaryDominant: false,
    isBorrowed: false,
    display: normalized as RomanNumeral,
  };
}

function deriveQualityFromModifier(
  caseType: RomanCase,
  modifier: string,
  degree: number
): ChordSuffix {
  if (modifier.includes("dim") || modifier === "°") return "dim";
  if (modifier.includes("aug") || modifier === "+") return "aug";
  if (modifier.includes("7")) {
    if (modifier === "maj7") return "maj7";
    if (modifier === "min7" || modifier === "m7") return "m7";
    return "7";
  }
  if (modifier.includes("sus")) return modifier as ChordSuffix;
  if (modifier.includes("6")) return "6";
  if (modifier.includes("9")) return "9";
  if (modifier.includes("add9")) return "add9";

  return caseType === "upper" ? "major" : "minor";
}

export function getDefaultQualityForDegree(
  degree: number,
  mode: ScaleMode = "major"
): ChordSuffix {
  switch (mode) {
    case "major":
    case "mixolydian":
      return MAJOR_SCALE_QUALITY[degree];
    case "minor":
    case "dorian":
      return MINOR_SCALE_QUALITY[degree];
    case "harmonicMinor":
      return HARMONIC_MINOR_QUALITY[degree];
    default:
      return MAJOR_SCALE_QUALITY[degree];
  }
}

export function resolveRomanToChordKey(
  rootKey: ChordKey,
  roman: ParsedRoman,
  mode: ScaleMode = "major"
): { key: ChordKey; suffix: ChordSuffix } | null {
  const rootIndex = getKeyIndex(rootKey);
  const scaleIntervals = SCALE_INTERVALS[mode];

  if (roman.isSecondaryDominant && roman.targetDegree) {
    const targetDegreeIndex = roman.targetDegree - 1;
    const targetInterval = scaleIntervals[targetDegreeIndex];
    const targetKey = getNoteAtInterval(rootIndex, targetInterval);

    const targetRootIndex = getKeyIndex(targetKey);
    const dominantInterval = scaleIntervals[4];
    const dominantKey = getNoteAtInterval(targetRootIndex, dominantInterval);

    return { key: dominantKey, suffix: "7" };
  }

  if (roman.display === "N" || roman.display === "N6") {
    const secondDegreeInterval = scaleIntervals[1];
    const neapolitanKey = getNoteAtInterval(rootIndex, secondDegreeInterval);
    return { key: neapolitanKey, suffix: "major" };
  }

  const degreeIndex = roman.degree - 1;
  const interval = scaleIntervals[degreeIndex];
  const chordKey = getNoteAtInterval(rootIndex, interval);

  let suffix = roman.quality;
  if (!roman.modifier) {
    suffix = getDefaultQualityForDegree(roman.degree, mode);
  }

  return { key: chordKey, suffix };
}

export function romanNumeralToDisplay(
  degree: number,
  quality: ChordSuffix,
  mode: ScaleMode = "major"
): string {
  const defaultQuality = getDefaultQualityForDegree(degree, mode);

  let roman = "";
  const isMajorish =
    quality === "major" ||
    quality === "maj7" ||
    quality === "6" ||
    quality === "add9";

  if (isMajorish) {
    roman = NUMBER_TO_ROMAN_UPPER[degree];
  } else {
    roman = NUMBER_TO_ROMAN_LOWER[degree];
  }

  let modifier = "";
  if (quality === "7" && degree === 5) {
    modifier = "7";
  } else if (quality === "7") {
    modifier = "7";
  } else if (quality === "maj7") {
    modifier = "maj7";
  } else if (quality === "m7" || quality === "min7") {
    modifier = "7";
  } else if (quality === "dim" || quality === "dim7") {
    modifier = "°";
  } else if (quality === "aug") {
    modifier = "+";
  } else if (quality === "sus4") {
    modifier = "sus4";
  } else if (quality === "sus2") {
    modifier = "sus2";
  } else if (quality === "6") {
    modifier = "6";
  } else if (quality === "9") {
    modifier = "9";
  } else if (quality === "add9") {
    modifier = "add9";
  }

  if (quality === defaultQuality) {
    modifier = "";
  }

  return roman + modifier;
}

export function parseProgressionString(
  input: string,
  key: ChordKey,
  mode: ScaleMode = "major"
): ParsedRoman[] {
  const tokens = input.split(/[\s\-\,]+/).filter((t) => t.trim());

  return tokens
    .map((token) => parseRomanNumeral(token))
    .filter((r): r is ParsedRoman => r !== null);
}

export function suggestNextRomanNumerals(
  currentProgression: ParsedRoman[],
  key: ChordKey,
  mode: ScaleMode = "major"
): ParsedRoman[] {
  if (currentProgression.length === 0) {
    return [1, 4, 5, 6].map((degree) =>
      parseRomanNumeral(degree === 6 && mode === "major" ? "vi" : `I${degree === 1 ? "" : "V".repeat(degree - 1).toLowerCase()}`)
    ).filter((r): r is ParsedRoman => r !== null);
  }

  const last = currentProgression[currentProgression.length - 1];
  const suggestions: ParsedRoman[] = [];

  switch (last.degree) {
    case 1:
      suggestions.push(
        parseRomanNumeral(mode === "major" ? "IV" : "iv")!,
        parseRomanNumeral(mode === "major" ? "V" : "v")!,
        parseRomanNumeral(mode === "major" ? "vi" : "VI")!,
        parseRomanNumeral("ii")!
      );
      break;
    case 2:
      suggestions.push(
        parseRomanNumeral("V")!,
        parseRomanNumeral(mode === "major" ? "IV" : "iv")!
      );
      break;
    case 4:
      suggestions.push(
        parseRomanNumeral("I")!,
        parseRomanNumeral("V")!,
        parseRomanNumeral("ii")!
      );
      break;
    case 5:
      suggestions.push(
        parseRomanNumeral("I")!,
        parseRomanNumeral("vi")!,
        parseRomanNumeral("IV")!
      );
      break;
    case 6:
      suggestions.push(
        parseRomanNumeral("ii")!,
        parseRomanNumeral("IV")!,
        parseRomanNumeral("V")!
      );
      break;
    default:
      suggestions.push(
        parseRomanNumeral("I")!,
        parseRomanNumeral("IV")!,
        parseRomanNumeral("V")!
      );
  }

  const seen = new Set(currentProgression.map((r) => r.degree));
  if (seen.has(5) && !seen.has(1)) {
    suggestions.unshift(parseRomanNumeral("I")!);
  }

  return suggestions.filter((s, i, arr) => arr.findIndex((t) => t.degree === s.degree) === i);
}
