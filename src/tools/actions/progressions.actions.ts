"use server";

import { Chord, ChordKey, ChordSuffix } from "../types/chords.types";
import {
  ScaleMode,
  ChordProgression,
  ProgressionStep,
  SuggestionResult,
  HarmonyAnalysis,
  CommonProgression,
} from "../types/progression.types";
import { ProgressionsService } from "../services/progressions.service";

const service = ProgressionsService.getInstance();

export async function getScaleNotesAction(
  key: ChordKey,
  mode: ScaleMode = "major"
): Promise<ChordKey[]> {
  return service.getScaleNotes(key, mode);
}

export async function harmonizeScaleAction(
  key: ChordKey,
  mode: ScaleMode = "major"
): Promise<Array<{ degree: number; roman: string; key: ChordKey; suffix: ChordSuffix }>> {
  return service.harmonizeScale(key, mode);
}

export async function generateProgressionAction(
  key: ChordKey,
  mode: ScaleMode,
  numerals: string[]
): Promise<ChordProgression> {
  return service.generateProgression(key, mode, numerals);
}

export async function generateFromStringAction(
  key: ChordKey,
  mode: ScaleMode,
  input: string
): Promise<ChordProgression> {
  return service.generateFromString(key, mode, input);
}

export async function analyzeProgressionAction(
  progression: ChordProgression
): Promise<HarmonyAnalysis> {
  return service.analyzeProgression(progression);
}

export async function getChordSuggestionsAction(
  key: ChordKey,
  mode: ScaleMode,
  currentSteps: ProgressionStep[],
  maxSuggestions: number = 5
): Promise<SuggestionResult[]> {
  return service.getChordSuggestions(key, mode, currentSteps, maxSuggestions);
}

export async function suggestChordSubstitutionsAction(
  step: ProgressionStep,
  key: ChordKey,
  mode: ScaleMode
): Promise<Array<{ roman: ProgressionStep["roman"]; chord: Chord | null; reason: string }>> {
  return service.suggestChordSubstitutions(step, key, mode);
}

export async function getSecondaryDominantsAction(
  key: ChordKey,
  mode: ScaleMode
): Promise<
  Array<{
    roman: string;
    display: string;
    degree: number;
    targetDegree: number;
    key: ChordKey;
    suffix: ChordSuffix;
    resolutionKey: ChordKey;
    resolutionSuffix: ChordSuffix;
    description: string;
  }>
> {
  return service.getSecondaryDominants(key, mode);
}

export async function getBorrowedChordsAction(
  key: ChordKey,
  mode: ScaleMode
): Promise<
  Array<{
    sourceMode: ScaleMode;
    degree: number;
    roman: string;
    chordKey: ChordKey;
    suffix: ChordSuffix;
    description: string;
    function: string;
  }>
> {
  return service.getBorrowedChords(key, mode);
}

export async function getNeapolitanAction(
  key: ChordKey,
  mode: ScaleMode
): Promise<{
  roman: string;
  key: ChordKey;
  suffix: ChordSuffix;
  description: string;
} | null> {
  return service.getNeapolitan(key, mode);
}

export async function getCommonProgressionsAction(): Promise<CommonProgression[]> {
  return service.getCommonProgressions();
}

export async function generateCommonProgressionAction(
  key: ChordKey,
  mode: ScaleMode,
  progressionName: string
): Promise<ChordProgression | null> {
  return service.generateCommonProgression(key, mode, progressionName);
}

export async function transposeProgressionAction(
  progression: ChordProgression,
  toKey: ChordKey,
  toMode?: ScaleMode
): Promise<ChordProgression> {
  return service.transposeProgression(progression, toKey, toMode);
}
