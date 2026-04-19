import { Chord, ChordKey, ChordPosition, ChordSuffix } from "../types/chords.types";
import {
  ScaleMode,
  ParsedRoman,
  SuggestionResult,
} from "../types/progression.types";
import {
  parseRomanNumeral,
  resolveRomanToChordKey,
  suggestNextRomanNumerals,
} from "./roman-numerals";
import { analyzeFunctionalHarmony, getDegreeChord } from "./harmony";
import { ChordsRepository } from "../repositories/chords.repository";

const WEIGHTS = {
  cadenceStrength: 0.3,
  voiceLeading: 0.25,
  functionalHarmony: 0.25,
  commonPatterns: 0.2,
};

interface ChordPositionComparison {
  from: ChordPosition;
  to: ChordPosition;
  commonTones: number;
  semitoneMovements: number[];
  totalDistance: number;
}

function getNoteFromFret(stringBaseMidi: number, fret: number): number {
  return stringBaseMidi + fret;
}

function calculateVoiceLeadingDistance(
  from: ChordPosition,
  to: ChordPosition
): number {
  const playedFrom = from.frets
    .map((f, i) => ({ fret: f, string: i }))
    .filter((p) => p.fret > 0);
  const playedTo = to.frets
    .map((f, i) => ({ fret: f, string: i }))
    .filter((p) => p.fret > 0);

  const stringBases = [40, 45, 50, 55, 59, 64];

  const fromNotes = playedFrom.map(
    (p) => getNoteFromFret(stringBases[p.string], p.fret)
  );
  const toNotes = playedTo.map(
    (p) => getNoteFromFret(stringBases[p.string], p.fret)
  );

  let totalDistance = 0;
  const maxString = Math.max(from.frets.length, to.frets.length);

  for (let i = 0; i < maxString; i++) {
    const fromFret = from.frets[i];
    const toFret = to.frets[i];

    if (fromFret === toFret) continue;
    if (fromFret < 0 && toFret < 0) continue;

    if (fromFret > 0 && toFret > 0) {
      totalDistance += Math.abs(toFret - fromFret);
    } else if (fromFret < 0 && toFret > 0) {
      totalDistance += 2;
    } else if (fromFret > 0 && toFret < 0) {
      totalDistance += 1;
    }
  }

  const commonTones = fromNotes.filter((n) => toNotes.includes(n)).length;
  const commonToneBonus = commonTones * -2;

  return Math.max(0, totalDistance + commonToneBonus);
}

function getCadenceStrength(
  lastRoman: ParsedRoman,
  candidateRoman: ParsedRoman,
  mode: ScaleMode
): number {
  let strength = 0;

  if (lastRoman.degree === 5 && candidateRoman.degree === 1) {
    strength = 1.0;
  } else if (lastRoman.degree === 4 && candidateRoman.degree === 1) {
    strength = 0.8;
  } else if (lastRoman.degree === 5 && candidateRoman.degree === 6) {
    strength = 0.4;
  } else if (candidateRoman.degree === 5) {
    strength = 0.7;
  } else if (candidateRoman.degree === 1) {
    strength = 0.6;
  } else if (lastRoman.degree === 2 && candidateRoman.degree === 5) {
    strength = 0.75;
  } else if (lastRoman.degree === 4 && candidateRoman.degree === 5) {
    strength = 0.7;
  } else if (lastRoman.degree === 6 && candidateRoman.degree === 2) {
    strength = 0.6;
  }

  if (candidateRoman.isSecondaryDominant) {
    strength += 0.3;
  }

  if (lastRoman.isSecondaryDominant && lastRoman.targetDegree === candidateRoman.degree) {
    strength += 0.4;
  }

  return Math.min(1, strength);
}

function getFunctionalHarmonyScore(
  progression: ParsedRoman[],
  candidate: ParsedRoman,
  mode: ScaleMode
): number {
  const extended = [...progression, candidate];
  const analysis = analyzeFunctionalHarmony(extended, "C" as ChordKey, mode);
  const lastAnalysis = analysis[analysis.length - 1];

  switch (lastAnalysis.function) {
    case "tonic":
      return 0.7;
    case "dominant":
      return 0.8;
    case "subdominant":
      return 0.6;
    case "predominant":
      return 0.5;
    default:
      return 0.4;
  }
}

function getCommonPatternScore(
  progression: ParsedRoman[],
  candidate: ParsedRoman
): number {
  const lastTwo = progression.slice(-2);
  if (lastTwo.length < 2) return 0.5;

  const pattern = [...lastTwo, candidate].map((r) => r.degree);

  const commonPatterns = [
    [4, 5, 1],
    [6, 4, 1],
    [2, 5, 1],
    [1, 4, 5],
    [1, 5, 6],
    [6, 2, 5],
    [1, 6, 4],
    [4, 5, 6],
  ];

  for (const common of commonPatterns) {
    if (
      pattern[0] === common[0] &&
      pattern[1] === common[1] &&
      pattern[2] === common[2]
    ) {
      return 1.0;
    }
  }

  const commonTwoChord = [
    [5, 1],
    [4, 1],
    [2, 5],
    [4, 5],
    [6, 2],
    [1, 4],
    [1, 5],
    [1, 6],
  ];

  const lastPattern = [pattern[1], pattern[2]];
  for (const common of commonTwoChord) {
    if (lastPattern[0] === common[0] && lastPattern[1] === common[1]) {
      return 0.7;
    }
  }

  return 0.4;
}

export async function suggestNextChords(
  currentProgression: ParsedRoman[],
  key: ChordKey,
  mode: ScaleMode = "major",
  currentPosition?: ChordPosition,
  maxSuggestions: number = 5
): Promise<SuggestionResult[]> {
  const repo = ChordsRepository.getInstance();

  const candidateRomans = suggestNextRomanNumerals(currentProgression, key, mode);

  const results: SuggestionResult[] = [];

  for (const roman of candidateRomans) {
    const resolved = resolveRomanToChordKey(key, roman, mode);
    if (!resolved) continue;

    const chord = await repo.getChord(resolved.key, resolved.suffix);
    if (!chord || chord.positions.length === 0) continue;

    let bestPosition = chord.positions[0];
    let voiceLeadingScore = 0.5;

    if (currentPosition) {
      let minDistance = Infinity;
      for (const pos of chord.positions) {
        const distance = calculateVoiceLeadingDistance(currentPosition, pos);
        if (distance < minDistance) {
          minDistance = distance;
          bestPosition = pos;
        }
      }

      voiceLeadingScore = Math.max(0, 1 - minDistance / 15);
    }

    const cadenceStrength = currentProgression.length > 0
      ? getCadenceStrength(currentProgression[currentProgression.length - 1], roman, mode)
      : 0.5;

    const functionalScore = getFunctionalHarmonyScore(currentProgression, roman, mode);
    const patternScore = getCommonPatternScore(currentProgression, roman);

    const totalScore =
      cadenceStrength * WEIGHTS.cadenceStrength +
      voiceLeadingScore * WEIGHTS.voiceLeading +
      functionalScore * WEIGHTS.functionalHarmony +
      patternScore * WEIGHTS.commonPatterns;

    const reasons: string[] = [];
    if (cadenceStrength > 0.8) reasons.push("Strong cadential resolution");
    else if (cadenceStrength > 0.6) reasons.push("Good harmonic flow");

    if (voiceLeadingScore > 0.7) reasons.push("Smooth voice leading");
    if (functionalScore > 0.7) reasons.push("Strong functional role");
    if (patternScore > 0.8) reasons.push("Common progression pattern");
    if (roman.isSecondaryDominant) reasons.push("Creates forward motion");

    results.push({
      step: {
        id: `${roman.display}-${Date.now()}-${Math.random()}`,
        roman,
        chord,
        positionIndex: chord.positions.indexOf(bestPosition),
        optional: false,
      },
      score: totalScore,
      reasons,
      voiceLeadingDistance: currentPosition ? calculateVoiceLeadingDistance(currentPosition, bestPosition) : undefined,
      cadenceStrength,
      functionalWeight: functionalScore,
    });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions);
}

export function rankChordTransitions(
  fromChord: Chord,
  toChords: Chord[],
  fromPositionIndex: number = 0
): Array<{ chord: Chord; score: number; bestPositionIndex: number }> {
  const fromPosition = fromChord.positions[fromPositionIndex];

  return toChords
    .map((chord) => {
      let bestScore = Infinity;
      let bestPositionIdx = 0;

      for (let i = 0; i < chord.positions.length; i++) {
        const distance = calculateVoiceLeadingDistance(fromPosition, chord.positions[i]);
        if (distance < bestScore) {
          bestScore = distance;
          bestPositionIdx = i;
        }
      }

      return {
        chord,
        score: 1 / (1 + bestScore),
        bestPositionIndex: bestPositionIdx,
      };
    })
    .sort((a, b) => b.score - a.score);
}
