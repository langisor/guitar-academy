import { Chord, ChordKey, ChordPosition, ChordSuffix } from "../types/chords.types";
import {
  FretboardPosition,
  FretboardConfig,
  Fingering,
  VoicingAnalysis,
  VoiceLeadingTransition,
  FretboardRegion,
  TransformedPosition,
  STANDARD_TUNING,
  StringTuning,
} from "../types/fretboard.types";
import {
  buildFretboard,
  getAllNotesOnString,
  chordToFretboardPositions,
  analyzeFingering,
  analyzeVoicing,
  calculateVoiceLeading,
  findOptimalVoiceLeadingPath,
  transposePosition,
  findAllVoicingsForChord,
  getRegionPositions,
} from "../lib/fretboard";
import { ChordsRepository } from "../repositories/chords.repository";

export class FretboardService {
  private static instance: FretboardService;
  private repo: ChordsRepository;

  private constructor() {
    this.repo = ChordsRepository.getInstance();
  }

  public static getInstance(): FretboardService {
    if (!FretboardService.instance) {
      FretboardService.instance = new FretboardService();
    }
    return FretboardService.instance;
  }

  // ==========================
  // BASIC FRETBOARD DATA
  // ==========================

  async getFretboardConfig(
    strings: number = 6,
    frets: number = 24,
    tuning: StringTuning[] = STANDARD_TUNING
  ): Promise<FretboardConfig & { notes: FretboardPosition[][] }> {
    const config = buildFretboard(strings, frets, tuning);

    const positions: FretboardPosition[][] = config.notes.map((stringNotes) =>
      stringNotes.map((note) => ({
        ...note,
        isOpen: note.fret === 0,
        isMuted: false,
      }))
    );

    return {
      strings,
      frets,
      tuning,
      notes: positions,
    };
  }

  async getNotesOnString(
    stringIndex: number,
    fretCount: number = 24,
    tuning: StringTuning[] = STANDARD_TUNING
  ): Promise<FretboardPosition[]> {
    const notes = getAllNotesOnString(stringIndex, fretCount, tuning);
    return notes.map((n) => ({
      ...n,
      isOpen: n.fret === 0,
      isMuted: false,
    }));
  }

  // ==========================
  // CHORD POSITIONS
  // ==========================

  async getAllVoicings(
    key: ChordKey,
    suffix: ChordSuffix,
    maxFret: number = 12
  ): Promise<Array<{ position: ChordPosition; analysis: VoicingAnalysis }>> {
    const chord = await this.repo.getChord(key, suffix);
    if (!chord) return [];

    const results: Array<{ position: ChordPosition; analysis: VoicingAnalysis }> = [];

    for (const position of chord.positions) {
      const analysis = analyzeVoicing(position, []);
      if (analysis.playable && position.frets.every((f) => f <= maxFret || f < 0)) {
        results.push({ position, analysis });
      }
    }

    return results.sort((a, b) => b.analysis.score - a.analysis.score);
  }

  async findOptimalVoicing(
    key: ChordKey,
    suffix: ChordSuffix,
    criteria: {
      preferOpen?: boolean;
      maxFretSpan?: number;
      preferRootPosition?: boolean;
    } = {}
  ): Promise<{ position: ChordPosition; analysis: VoicingAnalysis } | null> {
    const voicings = await this.getAllVoicings(key, suffix);
    if (voicings.length === 0) return null;

    let best = voicings[0];
    let bestScore = best.analysis.score;

    for (const voicing of voicings) {
      let score = voicing.analysis.score;

      if (criteria.preferOpen && voicing.analysis.fingering.openStrings > 0) {
        score += 10;
      }

      if (criteria.maxFretSpan && voicing.analysis.fingering.fretSpan <= criteria.maxFretSpan) {
        score += 5;
      }

      if (criteria.preferRootPosition && voicing.analysis.rootPosition) {
        score += 15;
      }

      if (score > bestScore) {
        best = voicing;
        bestScore = score;
      }
    }

    return best;
  }

  async convertToFretboardPositions(
    position: ChordPosition
  ): Promise<FretboardPosition[]> {
    return chordToFretboardPositions(position);
  }

  async analyzeFingering(position: ChordPosition): Promise<Fingering> {
    return analyzeFingering(position);
  }

  // ==========================
  // VOICE LEADING
  // ==========================

  async analyzeVoiceLeading(
    from: ChordPosition,
    to: ChordPosition
  ): Promise<VoiceLeadingTransition> {
    return calculateVoiceLeading(from, to);
  }

  async findOptimalPath(
    positions: ChordPosition[]
  ): Promise<Array<{ position: ChordPosition; transition: VoiceLeadingTransition | null }>> {
    return findOptimalVoiceLeadingPath(positions);
  }

  async rankTransitions(
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
    const fromChord = await this.repo.getChord(fromKey, fromSuffix);
    if (!fromChord) return [];

    const fromPosition = fromChord.positions[fromPositionIndex];

    const results: Array<{
      target: { key: ChordKey; suffix: ChordSuffix };
      bestPosition: ChordPosition;
      transition: VoiceLeadingTransition;
      rank: number;
    }> = [];

    for (const target of toOptions) {
      const targetChord = await this.repo.getChord(target.key, target.suffix);
      if (!targetChord || targetChord.positions.length === 0) continue;

      let bestTransition: VoiceLeadingTransition | null = null;
      let bestPosition: ChordPosition = targetChord.positions[0];

      for (const position of targetChord.positions) {
        const transition = calculateVoiceLeading(fromPosition, position);
        if (!bestTransition || transition.distance < bestTransition.distance) {
          bestTransition = transition;
          bestPosition = position;
        }
      }

      if (bestTransition) {
        results.push({
          target,
          bestPosition,
          transition: bestTransition,
          rank: bestTransition.distance,
        });
      }
    }

    return results.sort((a, b) => a.rank - b.rank);
  }

  // ==========================
  // TRANSPOSITION
  // ==========================

  async transposePosition(
    position: ChordPosition,
    semitones: number
  ): Promise<TransformedPosition> {
    return transposePosition(position, semitones);
  }

  async transposeChord(
    key: ChordKey,
    suffix: ChordSuffix,
    positionIndex: number,
    semitones: number
  ): Promise<TransformedPosition | null> {
    const chord = await this.repo.getChord(key, suffix);
    if (!chord || positionIndex >= chord.positions.length) return null;

    return transposePosition(chord.positions[positionIndex], semitones);
  }

  // ==========================
  // FRETBOARD REGIONS
  // ==========================

  async getVoicingsInRegion(
    key: ChordKey,
    suffix: ChordSuffix,
    region: FretboardRegion
  ): Promise<Array<{ position: ChordPosition; analysis: VoicingAnalysis }>> {
    const allVoicings = await this.getAllVoicings(key, suffix, region.endFret);

    return allVoicings.filter((v) => {
      const frets = v.position.frets.filter((f) => f >= 0);
      const inRange = frets.every(
        (f) => f >= region.startFret && f <= region.endFret
      );
      return inRange;
    });
  }

  async findVoiceLeadingInRegion(
    chordSequence: Array<{ key: ChordKey; suffix: ChordSuffix }>,
    region: FretboardRegion
  ): Promise<
    Array<{
      chord: { key: ChordKey; suffix: ChordSuffix };
      position: ChordPosition;
      transition: VoiceLeadingTransition | null;
    }>
  > {
    const results: Array<{
      chord: { key: ChordKey; suffix: ChordSuffix };
      position: ChordPosition;
      transition: VoiceLeadingTransition | null;
    }> = [];

    let previousPosition: ChordPosition | null = null;

    for (const chordRef of chordSequence) {
      const voicings = await this.getVoicingsInRegion(chordRef.key, chordRef.suffix, region);

      if (voicings.length === 0) {
        results.push({
          chord: chordRef,
          position: {
            frets: [-1, -1, -1, -1, -1, -1],
            fingers: [],
            baseFret: 0,
            barres: [],
            midi: [],
          },
          transition: null,
        });
        continue;
      }

      let bestVoicing = voicings[0];

      if (previousPosition) {
        let bestDistance = Infinity;
        for (const voicing of voicings) {
          const transition = calculateVoiceLeading(previousPosition, voicing.position);
          if (transition.distance < bestDistance) {
            bestDistance = transition.distance;
            bestVoicing = voicing;
          }
        }
      }

      const transition = previousPosition
        ? calculateVoiceLeading(previousPosition, bestVoicing.position)
        : null;

      results.push({
        chord: chordRef,
        position: bestVoicing.position,
        transition,
      });

      previousPosition = bestVoicing.position;
    }

    return results;
  }

  // ==========================
  // GENERATE VOICINGS
  // ==========================

  async generateVoicingsForNotes(
    rootNote: ChordKey,
    notes: string[],
    maxFret: number = 12
  ): Promise<ChordPosition[]> {
    return findAllVoicingsForChord(rootNote, notes, maxFret);
  }
}
