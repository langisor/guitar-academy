"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChordKey } from "../types/chords.types";
import {
  ScaleMode,
  ChordProgression,
  ProgressionStep,
  SuggestionResult,
  HarmonyAnalysis,
  CommonProgression,
} from "../types/progression.types";
import {
  generateProgressionAction,
  generateFromStringAction,
  analyzeProgressionAction,
  getChordSuggestionsAction,
  getCommonProgressionsAction,
  generateCommonProgressionAction,
  getScaleNotesAction,
  harmonizeScaleAction,
  getSecondaryDominantsAction,
  getBorrowedChordsAction,
  transposeProgressionAction,
} from "../actions/progressions.actions";

const QUERY_KEYS = {
  progression: (key: ChordKey, mode: ScaleMode, numerals: string[]) =>
    ["progression", key, mode, numerals],
  analysis: (progressionId: string) => ["progression", "analysis", progressionId],
  suggestions: (key: ChordKey, mode: ScaleMode, stepCount: number) =>
    ["progression", "suggestions", key, mode, stepCount],
  common: ["progression", "common"],
  scaleNotes: (key: ChordKey, mode: ScaleMode) => ["scale", key, mode],
  harmonized: (key: ChordKey, mode: ScaleMode) => ["scale", "harmonized", key, mode],
  secondaryDominants: (key: ChordKey, mode: ScaleMode) =>
    ["progression", "secondaryDominants", key, mode],
  borrowedChords: (key: ChordKey, mode: ScaleMode) =>
    ["progression", "borrowed", key, mode],
};

export function useGenerateProgression() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      key,
      mode,
      numerals,
    }: {
      key: ChordKey;
      mode: ScaleMode;
      numerals: string[];
    }) => generateProgressionAction(key, mode, numerals),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.progression(data.key, data.mode, []),
      });
    },
  });
}

export function useGenerateFromString() {
  return useMutation({
    mutationFn: ({
      key,
      mode,
      input,
    }: {
      key: ChordKey;
      mode: ScaleMode;
      input: string;
    }) => generateFromStringAction(key, mode, input),
  });
}

export function useAnalyzeProgression(progression: ChordProgression | null) {
  return useQuery({
    queryKey: progression
      ? QUERY_KEYS.analysis(progression.id)
      : ["progression", "analysis", "none"],
    queryFn: () =>
      progression ? analyzeProgressionAction(progression) : null,
    enabled: !!progression,
  });
}

export function useChordSuggestions(
  key: ChordKey,
  mode: ScaleMode,
  currentSteps: ProgressionStep[],
  maxSuggestions: number = 5
) {
  return useQuery({
    queryKey: QUERY_KEYS.suggestions(key, mode, currentSteps.length),
    queryFn: () =>
      getChordSuggestionsAction(key, mode, currentSteps, maxSuggestions),
    enabled: currentSteps.length >= 0,
  });
}

export function useCommonProgressions() {
  return useQuery({
    queryKey: QUERY_KEYS.common,
    queryFn: () => getCommonProgressionsAction(),
  });
}

export function useGenerateCommonProgression() {
  return useMutation({
    mutationFn: ({
      key,
      mode,
      progressionName,
    }: {
      key: ChordKey;
      mode: ScaleMode;
      progressionName: string;
    }) => generateCommonProgressionAction(key, mode, progressionName),
  });
}

export function useScaleNotes(key: ChordKey, mode: ScaleMode) {
  return useQuery({
    queryKey: QUERY_KEYS.scaleNotes(key, mode),
    queryFn: () => getScaleNotesAction(key, mode),
  });
}

export function useHarmonizedScale(key: ChordKey, mode: ScaleMode) {
  return useQuery({
    queryKey: QUERY_KEYS.harmonized(key, mode),
    queryFn: () => harmonizeScaleAction(key, mode),
  });
}

export function useSecondaryDominants(key: ChordKey, mode: ScaleMode) {
  return useQuery({
    queryKey: QUERY_KEYS.secondaryDominants(key, mode),
    queryFn: () => getSecondaryDominantsAction(key, mode),
  });
}

export function useBorrowedChords(key: ChordKey, mode: ScaleMode) {
  return useQuery({
    queryKey: QUERY_KEYS.borrowedChords(key, mode),
    queryFn: () => getBorrowedChordsAction(key, mode),
  });
}

export function useTransposeProgression() {
  return useMutation({
    mutationFn: ({
      progression,
      toKey,
      toMode,
    }: {
      progression: ChordProgression;
      toKey: ChordKey;
      toMode?: ScaleMode;
    }) => transposeProgressionAction(progression, toKey, toMode),
  });
}
