import { Chord, ChordKey, ChordSuffix } from "../types/chords.types";
import {
  ScaleMode,
  ParsedRoman,
  ChordProgression,
  ProgressionStep,
  SuggestionResult,
  HarmonyAnalysis,
  CommonProgression,
  COMMON_PROGRESSIONS,
} from "../types/progression.types";
import { ChordsRepository } from "../repositories/chords.repository";
import {
  parseRomanNumeral,
  parseProgressionString,
  resolveRomanToChordKey,
} from "../lib/roman-numerals";
import {
  harmonizeScale,
  getScaleNotes,
  analyzeFunctionalHarmony,
  findCadenceType,
  generateProgressionFromString,
  transposeProgression,
} from "../lib/harmony";
import {
  getAvailableSecondaryDominants,
  resolveSecondaryDominant,
  analyzeSecondaryDominantUsage,
} from "../lib/secondary-dominants";
import {
  getModalInterchangeChords,
  getNeapolitanChord,
  analyzeBorrowedChordsInProgression,
} from "../lib/borrowed-chords";
import { suggestNextChords } from "../lib/progression-suggester";

export class ProgressionsService {
  private static instance: ProgressionsService;
  private repo: ChordsRepository;

  private constructor() {
    this.repo = ChordsRepository.getInstance();
  }

  public static getInstance(): ProgressionsService {
    if (!ProgressionsService.instance) {
      ProgressionsService.instance = new ProgressionsService();
    }
    return ProgressionsService.instance;
  }

  // ==========================
  // BASIC SCALE & HARMONY
  // ==========================

  async getScaleNotes(key: ChordKey, mode: ScaleMode = "major"): Promise<ChordKey[]> {
    return getScaleNotes(key, mode);
  }

  async harmonizeScale(
    key: ChordKey,
    mode: ScaleMode = "major"
  ): Promise<Array<{ degree: number; roman: string; key: ChordKey; suffix: ChordSuffix }>> {
    return harmonizeScale(key, mode);
  }

  // ==========================
  // PROGRESSION GENERATION
  // ==========================

  async generateProgression(
    key: ChordKey,
    mode: ScaleMode,
    numerals: string[]
  ): Promise<ChordProgression> {
    const steps: ProgressionStep[] = [];

    for (const numeralStr of numerals) {
      const roman = parseRomanNumeral(numeralStr);
      if (!roman) continue;

      const resolved = resolveRomanToChordKey(key, roman, mode);
      if (!resolved) continue;

      const chord = await this.repo.getChord(resolved.key, resolved.suffix);
      if (!chord) continue;

      steps.push({
        id: `${roman.display}-${Date.now()}-${Math.random()}`,
        roman,
        chord,
        positionIndex: 0,
        optional: false,
      });
    }

    return {
      id: `${key}-${mode}-${Date.now()}`,
      name: `${key} ${mode} Progression`,
      key,
      mode,
      steps,
      tags: [],
    };
  }

  async generateFromString(
    key: ChordKey,
    mode: ScaleMode,
    input: string
  ): Promise<ChordProgression> {
    const progression = generateProgressionFromString(input, key, mode);

    const steps: ProgressionStep[] = [];

    for (const item of progression) {
      const chord = await this.repo.getChord(item.chordKey, item.suffix);
      if (!chord) continue;

      steps.push({
        id: `${item.roman.display}-${Date.now()}-${Math.random()}`,
        roman: item.roman,
        chord,
        positionIndex: 0,
        optional: false,
      });
    }

    return {
      id: `${key}-${mode}-${Date.now()}`,
      name: `${key} ${mode} Progression`,
      key,
      mode,
      steps,
      tags: [],
    };
  }

  // ==========================
  // PROGRESSION ANALYSIS
  // ==========================

  async analyzeProgression(
    progression: ChordProgression
  ): Promise<HarmonyAnalysis> {
    const romans = progression.steps.map((s) => s.roman);

    const analysis: HarmonyAnalysis = {
      key: progression.key,
      mode: progression.mode,
      tonalCenter: progression.key,
      modulations: [],
      cadences: [],
      borrowedChords: [],
      secondaryDominants: [],
    };

    const cadence = findCadenceType(romans, progression.mode);
    if (cadence.type && cadence.index !== -1) {
      analysis.cadences.push({
        type: cadence.type,
        stepIndex: cadence.index,
      });
    }

    const borrowedAnalysis = analyzeBorrowedChordsInProgression(
      romans,
      progression.key,
      progression.mode
    );
    analysis.borrowedChords = borrowedAnalysis
      .filter((b) => b.isBorrowed)
      .map((b) => ({
        stepIndex: b.index,
        source: b.borrowSource || "major",
        description: b.description,
      }));

    const secondaryAnalysis = analyzeSecondaryDominantUsage(
      romans,
      progression.key,
      progression.mode
    );
    analysis.secondaryDominants = secondaryAnalysis.map((s) => ({
      stepIndex: s.index,
      target: s.targetDegree.toString(),
      description: s.analysis,
    }));

    return analysis;
  }

  // ==========================
  // SUGGESTIONS
  // ==========================

  async getChordSuggestions(
    key: ChordKey,
    mode: ScaleMode,
    currentSteps: ProgressionStep[],
    maxSuggestions: number = 5
  ): Promise<SuggestionResult[]> {
    const romans = currentSteps.map((s) => s.roman);
    const lastPosition = currentSteps[currentSteps.length - 1]?.chord?.positions[
      currentSteps[currentSteps.length - 1]?.positionIndex || 0
    ];

    return suggestNextChords(romans, key, mode, lastPosition, maxSuggestions);
  }

  async suggestChordSubstitutions(
    step: ProgressionStep,
    key: ChordKey,
    mode: ScaleMode
  ): Promise<Array<{ roman: ParsedRoman; chord: Chord | null; reason: string }>> {
    const borrowed = getModalInterchangeChords(key, mode).filter(
      (b) => b.degree === step.roman.degree
    );

    const suggestions: Array<{ roman: ParsedRoman; chord: Chord | null; reason: string }> = [];

    for (const b of borrowed) {
      const roman = parseRomanNumeral(b.roman);
      if (!roman) continue;

      const chord = await this.repo.getChord(b.chordKey, b.suffix);
      suggestions.push({
        roman,
        chord,
        reason: `${b.description} - ${b.function}`,
      });
    }

    const secondaryDominants = getAvailableSecondaryDominants(key, mode).filter(
      (s) => s.targetDegree === step.roman.degree
    );

    for (const sd of secondaryDominants) {
      const roman = parseRomanNumeral(sd.roman);
      if (!roman) continue;

      const chord = await this.repo.getChord(sd.key, sd.suffix);
      suggestions.push({
        roman,
        chord,
        reason: sd.description,
      });
    }

    return suggestions;
  }

  // ==========================
  // ADVANCED HARMONY
  // ==========================

  async getSecondaryDominants(
    key: ChordKey,
    mode: ScaleMode
  ): Promise<ReturnType<typeof getAvailableSecondaryDominants>> {
    return getAvailableSecondaryDominants(key, mode);
  }

  async getBorrowedChords(
    key: ChordKey,
    mode: ScaleMode
  ): Promise<ReturnType<typeof getModalInterchangeChords>> {
    return getModalInterchangeChords(key, mode);
  }

  async getNeapolitan(
    key: ChordKey,
    mode: ScaleMode
  ): Promise<ReturnType<typeof getNeapolitanChord>> {
    return getNeapolitanChord(key, mode);
  }

  // ==========================
  // COMMON PATTERNS
  // ==========================

  async getCommonProgressions(): Promise<CommonProgression[]> {
    return COMMON_PROGRESSIONS;
  }

  async generateCommonProgression(
    key: ChordKey,
    mode: ScaleMode,
    progressionName: string
  ): Promise<ChordProgression | null> {
    const common = COMMON_PROGRESSIONS.find((p) => p.name === progressionName);
    if (!common) return null;

    return this.generateProgression(key, mode, common.numerals);
  }

  // ==========================
  // TRANSPOSITION
  // ==========================

  async transposeProgression(
    progression: ChordProgression,
    toKey: ChordKey,
    toMode?: ScaleMode
  ): Promise<ChordProgression> {
    const newMode = toMode || progression.mode;
    const romans = progression.steps.map((s) => s.roman);

    return this.generateProgression(toKey, newMode, romans.map((r) => r.display as string));
  }
}
