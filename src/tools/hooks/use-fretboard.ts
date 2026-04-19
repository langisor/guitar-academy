"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { ChordKey, ChordPosition, ChordSuffix } from "../types/chords.types";
import {
  FretboardPosition,
  FretboardRegion,
  StringTuning,
  STANDARD_TUNING,
} from "../types/fretboard.types";
import {
  getFretboardConfigAction,
  getAllVoicingsAction,
  findOptimalVoicingAction,
  analyzeVoiceLeadingAction,
  findOptimalPathAction,
  transposePositionAction,
  getVoicingsInRegionAction,
  findVoiceLeadingInRegionAction,
  generateVoicingsForNotesAction,
} from "../actions/fretboard.actions";

const QUERY_KEYS = {
  fretboard: (strings: number, frets: number) => ["fretboard", strings, frets],
  voicings: (key: ChordKey, suffix: ChordSuffix) => ["fretboard", "voicings", key, suffix],
  optimalVoicing: (key: ChordKey, suffix: ChordSuffix, criteria: unknown) =>
    ["fretboard", "optimal", key, suffix, criteria],
  voiceLeading: (fromKey: string, toKey: string) => ["fretboard", "voiceLeading", fromKey, toKey],
  path: (positionIds: string[]) => ["fretboard", "path", positionIds],
  transposed: (positionId: string, semitones: number) =>
    ["fretboard", "transposed", positionId, semitones],
  regionVoicings: (key: ChordKey, suffix: ChordSuffix, region: string) =>
    ["fretboard", "region", key, suffix, region],
  generatedVoicings: (rootNote: ChordKey, notes: string) =>
    ["fretboard", "generated", rootNote, notes],
};

export function useFretboardConfig(
  strings: number = 6,
  frets: number = 24,
  tuning: StringTuning[] = STANDARD_TUNING
) {
  return useQuery({
    queryKey: QUERY_KEYS.fretboard(strings, frets),
    queryFn: () => getFretboardConfigAction(strings, frets, tuning),
  });
}

export function useAllVoicings(
  key: ChordKey | null,
  suffix: ChordSuffix | null,
  maxFret: number = 12
) {
  return useQuery({
    queryKey: key && suffix ? QUERY_KEYS.voicings(key, suffix) : ["fretboard", "voicings", "none"],
    queryFn: () =>
      key && suffix ? getAllVoicingsAction(key, suffix, maxFret) : [],
    enabled: !!key && !!suffix,
  });
}

export function useOptimalVoicing(
  key: ChordKey | null,
  suffix: ChordSuffix | null,
  criteria: {
    preferOpen?: boolean;
    maxFretSpan?: number;
    preferRootPosition?: boolean;
  } = {}
) {
  return useQuery({
    queryKey:
      key && suffix
        ? QUERY_KEYS.optimalVoicing(key, suffix, criteria)
        : ["fretboard", "optimal", "none"],
    queryFn: () =>
      key && suffix ? findOptimalVoicingAction(key, suffix, criteria) : null,
    enabled: !!key && !!suffix,
  });
}

export function useVoiceLeading(
  from: ChordPosition | null,
  to: ChordPosition | null
) {
  return useQuery({
    queryKey:
      from && to
        ? QUERY_KEYS.voiceLeading(JSON.stringify(from.frets), JSON.stringify(to.frets))
        : ["fretboard", "voiceLeading", "none"],
    queryFn: () =>
      from && to ? analyzeVoiceLeadingAction(from, to) : null,
    enabled: !!from && !!to,
  });
}

export function useOptimalPath(positions: ChordPosition[]) {
  return useQuery({
    queryKey: QUERY_KEYS.path(positions.map((p) => JSON.stringify(p.frets))),
    queryFn: () => findOptimalPathAction(positions),
    enabled: positions.length > 0,
  });
}

export function useTransposePosition() {
  return useMutation({
    mutationFn: ({
      position,
      semitones,
    }: {
      position: ChordPosition;
      semitones: number;
    }) => transposePositionAction(position, semitones),
  });
}

export function useVoicingsInRegion(
  key: ChordKey | null,
  suffix: ChordSuffix | null,
  region: FretboardRegion | null
) {
  return useQuery({
    queryKey:
      key && suffix && region
        ? QUERY_KEYS.regionVoicings(key, suffix, JSON.stringify(region))
        : ["fretboard", "region", "none"],
    queryFn: () =>
      key && suffix && region
        ? getVoicingsInRegionAction(key, suffix, region)
        : [],
    enabled: !!key && !!suffix && !!region,
  });
}

export function useVoiceLeadingInRegion(
  chordSequence: Array<{ key: ChordKey; suffix: ChordSuffix }>,
  region: FretboardRegion | null
) {
  return useQuery({
    queryKey:
      chordSequence.length > 0 && region
        ? ["fretboard", "regionPath", JSON.stringify(chordSequence), JSON.stringify(region)]
        : ["fretboard", "regionPath", "none"],
    queryFn: () =>
      region ? findVoiceLeadingInRegionAction(chordSequence, region) : [],
    enabled: chordSequence.length > 0 && !!region,
  });
}

export function useGenerateVoicings(
  rootNote: ChordKey | null,
  notes: string[],
  maxFret: number = 12
) {
  return useQuery({
    queryKey:
      rootNote
        ? QUERY_KEYS.generatedVoicings(rootNote, notes.join(","))
        : ["fretboard", "generated", "none"],
    queryFn: () =>
      rootNote ? generateVoicingsForNotesAction(rootNote, notes, maxFret) : [],
    enabled: !!rootNote && notes.length > 0,
  });
}
