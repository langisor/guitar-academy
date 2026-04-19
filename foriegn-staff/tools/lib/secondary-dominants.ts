import { ChordKey, ChordSuffix } from "../types/chords.types";
import {
  ScaleMode,
  ParsedRoman,
} from "../types/progression.types";
import { parseRomanNumeral, resolveRomanToChordKey } from "./roman-numerals";
import { getScaleIntervals } from "./harmony";

const CHROMATIC = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

export interface SecondaryDominant {
  roman: string;
  display: string;
  degree: number;
  targetDegree: number;
  key: ChordKey;
  suffix: ChordSuffix;
  resolutionKey: ChordKey;
  resolutionSuffix: ChordSuffix;
  description: string;
}

export function getAvailableSecondaryDominants(
  key: ChordKey,
  mode: ScaleMode = "major"
): SecondaryDominant[] {
  const scaleIntervals = getScaleIntervals(mode);
  const rootIndex = CHROMATIC.indexOf(key);

  const targets = [2, 3, 4, 5, 6, 7];

  return targets.map((targetDegree) => {
    const targetDegreeIndex = targetDegree - 1;
    const targetInterval = scaleIntervals[targetDegreeIndex];
    const targetKeyIndex = (rootIndex + targetInterval) % 12;
    const targetKey = CHROMATIC[targetKeyIndex] as ChordKey;

    const dominantInterval = (5 - 1) * 2;
    const dominantKeyIndex = (targetKeyIndex + 7) % 12;
    const dominantKey = CHROMATIC[dominantKeyIndex] as ChordKey;

    const targetRoman = targetDegree === 5 ? "V" : targetDegree === 1 ? "I" : `degree${targetDegree}`;

    return {
      roman: `V/${targetRoman}`,
      display: `V/${targetDegree === 5 ? "V" : targetDegree === 1 ? "I" : targetDegree === 6 ? "vi" : String(targetDegree)}`,
      degree: 5,
      targetDegree,
      key: dominantKey,
      suffix: "7" as ChordSuffix,
      resolutionKey: targetKey,
      resolutionSuffix: getDefaultQualityForTarget(targetDegree, mode),
      description: `Dominant of ${targetKey} (scale degree ${targetDegree})`,
    };
  });
}

function getDefaultQualityForTarget(degree: number, mode: ScaleMode): ChordSuffix {
  if (mode === "major") {
    switch (degree) {
      case 1: return "major";
      case 2: return "minor";
      case 3: return "minor";
      case 4: return "major";
      case 5: return "major";
      case 6: return "minor";
      case 7: return "dim";
    }
  } else {
    switch (degree) {
      case 1: return "minor";
      case 2: return "dim";
      case 3: return "major";
      case 4: return "minor";
      case 5: return "minor";
      case 6: return "major";
      case 7: return "major";
    }
  }
  return "major";
}

export function resolveSecondaryDominant(
  secondaryRoman: ParsedRoman,
  key: ChordKey,
  mode: ScaleMode = "major"
): { dominant: { key: ChordKey; suffix: ChordSuffix }; resolution: { key: ChordKey; suffix: ChordSuffix } } | null {
  if (!secondaryRoman.isSecondaryDominant || !secondaryRoman.targetDegree) {
    return null;
  }

  const dominant = resolveRomanToChordKey(key, secondaryRoman, mode);
  if (!dominant) return null;

  const scaleIntervals = getScaleIntervals(mode);
  const rootIndex = CHROMATIC.indexOf(key);
  const targetDegreeIndex = secondaryRoman.targetDegree - 1;
  const targetInterval = scaleIntervals[targetDegreeIndex];
  const targetKeyIndex = (rootIndex + targetInterval) % 12;
  const resolutionKey = CHROMATIC[targetKeyIndex] as ChordKey;
  const resolutionSuffix = getDefaultQualityForTarget(secondaryRoman.targetDegree, mode);

  return {
    dominant,
    resolution: { key: resolutionKey, suffix: resolutionSuffix },
  };
}

export function getTritoneSubstitution(
  key: ChordKey,
  targetDegree: number,
  mode: ScaleMode = "major"
): { key: ChordKey; suffix: ChordSuffix; description: string } | null {
  const scaleIntervals = getScaleIntervals(mode);
  const rootIndex = CHROMATIC.indexOf(key);
  const targetDegreeIndex = targetDegree - 1;
  const targetInterval = scaleIntervals[targetDegreeIndex];

  const dominantKeyIndex = (rootIndex + targetInterval + 7) % 12;
  const tritoneKeyIndex = (dominantKeyIndex + 6) % 12;

  return {
    key: CHROMATIC[tritoneKeyIndex] as ChordKey,
    suffix: "7" as ChordSuffix,
    description: `Db7 (tritone sub for G7) → resolves to ${targetDegree}`,
  };
}

export function insertSecondaryDominantIntoProgression(
  progression: ParsedRoman[],
  insertAfterIndex: number,
  targetDegree: number,
  key: ChordKey,
  mode: ScaleMode = "major"
): ParsedRoman[] {
  const secondaryRoman = parseRomanNumeral(`V/${targetDegree}`);
  if (!secondaryRoman) return progression;

  const newProgression = [...progression];
  newProgression.splice(insertAfterIndex + 1, 0, secondaryRoman);

  return newProgression;
}

export function analyzeSecondaryDominantUsage(
  progression: ParsedRoman[],
  key: ChordKey,
  mode: ScaleMode = "major"
): Array<{
  index: number;
  roman: ParsedRoman;
  type: "secondary" | "tritone" | "extended";
  targetDegree: number;
  resolutionIndex: number;
  analysis: string;
}> {
  return progression
    .map((roman, index) => {
      if (!roman.isSecondaryDominant || !roman.targetDegree) return null;

      const resolution = resolveSecondaryDominant(roman, key, mode);
      if (!resolution) return null;

      let nextChordIndex = -1;
      for (let i = index + 1; i < progression.length; i++) {
        const nextResolved = resolveRomanToChordKey(key, progression[i], mode);
        if (
          nextResolved &&
          nextResolved.key === resolution.resolution.key &&
          nextResolved.suffix === resolution.resolution.suffix
        ) {
          nextChordIndex = i;
          break;
        }
      }

      return {
        index,
        roman,
        type: "secondary" as const,
        targetDegree: roman.targetDegree,
        resolutionIndex: nextChordIndex,
        analysis:
          nextChordIndex !== -1
            ? `V/${roman.targetDegree} resolves correctly to degree ${roman.targetDegree}`
            : `V/${roman.targetDegree} - resolution not found in progression`,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
