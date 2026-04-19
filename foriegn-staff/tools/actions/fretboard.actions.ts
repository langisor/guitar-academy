"use server";

import { ChordKey, ChordPosition, ChordSuffix } from "../types/chords.types";
import {
  FretboardPosition,
  FretboardConfig,
  Fingering,
  VoicingAnalysis,
  VoiceLeadingTransition,
  FretboardRegion,
  TransformedPosition,
  StringTuning,
  STANDARD_TUNING,
} from "../types/fretboard.types";
import { FretboardService } from "../services/fretboard.service";

const service = FretboardService.getInstance();

export async function getFretboardConfigAction(
  strings: number = 6,
  frets: number = 24,
  tuning: StringTuning[] = STANDARD_TUNING
): Promise<FretboardConfig & { notes: FretboardPosition[][] }> {
  return service.getFretboardConfig(strings, frets, tuning);
}

export async function getNotesOnStringAction(
  stringIndex: number,
  fretCount: number = 24,
  tuning: StringTuning[] = STANDARD_TUNING
): Promise<FretboardPosition[]> {
  return service.getNotesOnString(stringIndex, fretCount, tuning);
}

export async function getAllVoicingsAction(
  key: ChordKey,
  suffix: ChordSuffix,
  maxFret: number = 12
): Promise<Array<{ position: ChordPosition; analysis: VoicingAnalysis }>> {
  return service.getAllVoicings(key, suffix, maxFret);
}

export async function findOptimalVoicingAction(
  key: ChordKey,
  suffix: ChordSuffix,
  criteria: {
    preferOpen?: boolean;
    maxFretSpan?: number;
    preferRootPosition?: boolean;
  } = {}
): Promise<{ position: ChordPosition; analysis: VoicingAnalysis } | null> {
  return service.findOptimalVoicing(key, suffix, criteria);
}

export async function convertToFretboardPositionsAction(
  position: ChordPosition
): Promise<FretboardPosition[]> {
  return service.convertToFretboardPositions(position);
}

export async function analyzeFingeringAction(
  position: ChordPosition
): Promise<Fingering> {
  return service.analyzeFingering(position);
}

export async function analyzeVoiceLeadingAction(
  from: ChordPosition,
  to: ChordPosition
): Promise<VoiceLeadingTransition> {
  return service.analyzeVoiceLeading(from, to);
}

export async function findOptimalPathAction(
  positions: ChordPosition[]
): Promise<
  Array<{ position: ChordPosition; transition: VoiceLeadingTransition | null }>
> {
  return service.findOptimalPath(positions);
}

export async function rankTransitionsAction(
  fromKey: ChordKey,
  fromSuffix: ChordSuffix,
  fromPositionIndex: number,
  toOptions: Array<{ key: ChordKey; suffix: ChordSuffix }>
): Promise<
  Array<{
    target: { key: ChordKey; suffix: ChordSuffix };
    bestPosition: ChordPosition;
    transition: VoiceLeadingTransition;
    rank: number;
  }>
> {
  return service.rankTransitions(fromKey, fromSuffix, fromPositionIndex, toOptions);
}

export async function transposePositionAction(
  position: ChordPosition,
  semitones: number
): Promise<TransformedPosition> {
  return service.transposePosition(position, semitones);
}

export async function transposeChordAction(
  key: ChordKey,
  suffix: ChordSuffix,
  positionIndex: number,
  semitones: number
): Promise<TransformedPosition | null> {
  return service.transposeChord(key, suffix, positionIndex, semitones);
}

export async function getVoicingsInRegionAction(
  key: ChordKey,
  suffix: ChordSuffix,
  region: FretboardRegion
): Promise<Array<{ position: ChordPosition; analysis: VoicingAnalysis }>> {
  return service.getVoicingsInRegion(key, suffix, region);
}

export async function findVoiceLeadingInRegionAction(
  chordSequence: Array<{ key: ChordKey; suffix: ChordSuffix }>,
  region: FretboardRegion
): Promise<
  Array<{
    chord: { key: ChordKey; suffix: ChordSuffix };
    position: ChordPosition;
    transition: VoiceLeadingTransition | null;
  }>
> {
  return service.findVoiceLeadingInRegion(chordSequence, region);
}

export async function generateVoicingsForNotesAction(
  rootNote: ChordKey,
  notes: string[],
  maxFret: number = 12
): Promise<ChordPosition[]> {
  return service.generateVoicingsForNotes(rootNote, notes, maxFret);
}
