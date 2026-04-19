import { ChordKey, ChordPosition } from "../types/chords.types";
import {
  FretboardNote,
  FretboardPosition,
  StringTuning,
  STANDARD_TUNING,
  FretboardConfig,
  Fingering,
  VoicingAnalysis,
  VoiceLeadingTransition,
  FretboardRegion,
  TransformedPosition,
  NOTE_NAMES,
} from "../types/fretboard.types";

export function getNoteAtFret(stringTuning: StringTuning, fret: number): FretboardNote {
  const noteIndex = NOTE_NAMES.indexOf(stringTuning.note);
  const newIndex = (noteIndex + fret) % 12;
  const octaveShift = Math.floor((noteIndex + fret) / 12);

  return {
    string: 0,
    fret,
    note: NOTE_NAMES[newIndex],
    midi: stringTuning.midi + fret,
    octave: stringTuning.octave + octaveShift,
  };
}

export function getAllNotesOnString(
  stringIndex: number,
  fretCount: number = 24,
  tuning: StringTuning[] = STANDARD_TUNING
): FretboardNote[] {
  const stringTuning = tuning[stringIndex];

  return Array.from({ length: fretCount + 1 }, (_, fret) => ({
    ...getNoteAtFret(stringTuning, fret),
    string: stringIndex,
  }));
}

export function buildFretboard(
  strings: number = 6,
  frets: number = 24,
  tuning: StringTuning[] = STANDARD_TUNING
): FretboardConfig & { notes: FretboardNote[][] } {
  const notes: FretboardNote[][] = [];

  for (let i = 0; i < strings; i++) {
    notes.push(getAllNotesOnString(i, frets, tuning));
  }

  return {
    strings,
    frets,
    tuning,
    notes,
  };
}

export function findNotePositions(
  targetNote: string,
  fretboard: ReturnType<typeof buildFretboard>
): FretboardNote[] {
  const positions: FretboardNote[] = [];

  for (const stringNotes of fretboard.notes) {
    for (const note of stringNotes) {
      if (note.note === targetNote) {
        positions.push(note);
      }
    }
  }

  return positions;
}

export function chordToFretboardPositions(
  chordPosition: ChordPosition,
  tuning: StringTuning[] = STANDARD_TUNING
): FretboardPosition[] {
  const positions: FretboardPosition[] = [];

  for (let string = 0; string < chordPosition.frets.length; string++) {
    const fret = chordPosition.frets[string];
    const finger = chordPosition.fingers?.[string];

    if (fret === -1) {
      positions.push({
        string,
        fret,
        note: "X",
        midi: -1,
        octave: -1,
        isMuted: true,
        finger,
      });
    } else if (fret === 0) {
      const openNote = tuning[string];
      positions.push({
        string,
        fret,
        note: openNote.note,
        midi: openNote.midi,
        octave: openNote.octave,
        isOpen: true,
        finger,
      });
    } else {
      const noteInfo = getNoteAtFret(tuning[string], fret);
      positions.push({
        string,
        fret,
        note: noteInfo.note,
        midi: noteInfo.midi,
        octave: noteInfo.octave,
        finger,
      });
    }
  }

  return positions;
}

export function analyzeFingering(chordPosition: ChordPosition): Fingering {
  const positions = chordToFretboardPositions(chordPosition);
  const playedPositions = positions.filter((p) => p.fret > 0);
  const frets = playedPositions.map((p) => p.fret);
  const fingers = chordPosition.fingers?.filter((f) => f > 0) || [];

  const lowestFret = Math.min(...frets);
  const highestFret = Math.max(...frets);
  const fretSpan = highestFret - lowestFret;

  const openStrings = positions.filter((p) => p.isOpen).length;
  const mutedStrings = positions.filter((p) => p.isMuted).length;

  let stretchRating = 0;
  if (fretSpan > 4) stretchRating = 3;
  else if (fretSpan > 3) stretchRating = 2;
  else if (fretSpan > 2) stretchRating = 1;

  const uniqueFingers = new Set(fingers).size;
  let difficulty: "easy" | "medium" | "hard" = "easy";
  if (fretSpan > 4 || uniqueFingers > 3) difficulty = "hard";
  else if (fretSpan > 2 || uniqueFingers > 2) difficulty = "medium";

  const barres: Fingering["barres"] = [];
  if (chordPosition.barres?.length > 0) {
    for (const barreFret of chordPosition.barres) {
      const barreStrings = playedPositions
        .filter((p) => p.fret === barreFret)
        .map((p) => p.string);

      if (barreStrings.length >= 2) {
        barres.push({
          fret: barreFret,
          startString: Math.min(...barreStrings),
          endString: Math.max(...barreStrings),
          finger: 1,
        });
      }
    }
  }

  let voicingType: Fingering["voicingType"] = "root";
  const bassNote = positions.find((p) => p.string === 5 || p.string === 4);
  if (bassNote) {
    const rootNote = chordPosition.frets[5] >= 0 ? positions[5]?.note : null;
    if (rootNote && bassNote.note !== rootNote) {
      if (bassNote.string === 4) voicingType = "firstInversion";
      else if (bassNote.string === 3) voicingType = "secondInversion";
      else voicingType = "spread";
    }
  }

  return {
    positions,
    barres,
    stretchRating,
    difficulty,
    fretSpan,
    lowestFret,
    highestFret,
    openStrings,
    mutedStrings,
    voicingType,
  };
}

export function analyzeVoicing(
  chordPosition: ChordPosition,
  expectedNotes: string[]
): VoicingAnalysis {
  const fingering = analyzeFingering(chordPosition);
  const playedNotes = fingering.positions
    .filter((p) => !p.isMuted)
    .map((p) => p.note);

  const uniqueNotes = [...new Set(playedNotes)];
  const completeness = uniqueNotes.length / expectedNotes.length;

  const noteCounts: Record<string, number> = {};
  for (const note of playedNotes) {
    noteCounts[note] = (noteCounts[note] || 0) + 1;
  }
  const doubles = Object.values(noteCounts).filter((c) => c > 1).length;

  const omissions = expectedNotes.filter((n) => !uniqueNotes.includes(n));

  const bassNote = fingering.positions.find((p) => p.string >= 4 && !p.isMuted)?.note || "";
  const rootPosition = bassNote === expectedNotes[0];

  let score = 100;
  score -= fingering.stretchRating * 10;
  score -= (5 - uniqueNotes.length) * 15;
  score -= omissions.length * 20;
  score -= doubles * 5;
  if (fingering.difficulty === "hard") score -= 15;
  if (fingering.difficulty === "medium") score -= 5;
  if (rootPosition) score += 10;

  return {
    fingering,
    chordPosition,
    notes: playedNotes,
    intervals: [],
    bassNote,
    rootPosition,
    completeness,
    doubles,
    omissions,
    playable: fingering.fretSpan <= 4 && playedNotes.length >= 3,
    score: Math.max(0, score),
  };
}

export function calculateVoiceLeading(
  from: ChordPosition,
  to: ChordPosition
): VoiceLeadingTransition {
  const fromFingering = analyzeFingering(from);
  const toFingering = analyzeFingering(to);

  const fromAnalysis = analyzeVoicing(from, []);
  const toAnalysis = analyzeVoicing(to, []);

  const fromNotes = fromFingering.positions
    .filter((p) => p.fret > 0)
    .map((p) => p.midi);
  const toNotes = toFingering.positions
    .filter((p) => p.fret > 0)
    .map((p) => p.midi);

  const commonTones = fromNotes.filter((n) => toNotes.includes(n)).length;

  let totalDistance = 0;
  for (let i = 0; i < 6; i++) {
    const fromFret = from.frets[i];
    const toFret = to.frets[i];

    if (fromFret > 0 && toFret > 0) {
      totalDistance += Math.abs(toFret - fromFret);
    }
  }

  const fromMidiSum = fromNotes.reduce((a, b) => a + b, 0);
  const toMidiSum = toNotes.reduce((a, b) => a + b, 0);
  const smoothness = 1 / (1 + Math.abs(toMidiSum - fromMidiSum) / 100);

  const fromFingers = from.fingers?.filter((f) => f > 0) || [];
  const toFingers = to.fingers?.filter((f) => f > 0) || [];
  const fingerMovement = Math.abs(fromFingers.length - toFingers.length);

  const recommended = totalDistance < 8 && commonTones >= 1;

  return {
    from: fromAnalysis,
    to: toAnalysis,
    distance: totalDistance,
    commonTones,
    smoothness,
    fingerMovement,
    recommended,
  };
}

export function findOptimalVoiceLeadingPath(
  chordPositions: ChordPosition[]
): Array<{ position: ChordPosition; transition: VoiceLeadingTransition | null }> {
  if (chordPositions.length === 0) return [];

  const result: Array<{ position: ChordPosition; transition: VoiceLeadingTransition | null }> = [
    { position: chordPositions[0], transition: null },
  ];

  for (let i = 1; i < chordPositions.length; i++) {
    const transition = calculateVoiceLeading(chordPositions[i - 1], chordPositions[i]);
    result.push({
      position: chordPositions[i],
      transition,
    });
  }

  return result;
}

export function transposePosition(
  position: ChordPosition,
  semitones: number
): TransformedPosition {
  if (semitones === 0) {
    return {
      original: position,
      transposed: position,
      shiftAmount: 0,
      valid: true,
    };
  }

  const newFrets = position.frets.map((fret) => {
    if (fret < 0) return -1;
    if (fret === 0) return semitones;
    return fret + semitones;
  });

  const maxFret = Math.max(...newFrets.filter((f) => f > 0));
  if (maxFret > 24) {
    return {
      original: position,
      transposed: position,
      shiftAmount: semitones,
      valid: false,
      reason: "Transposition exceeds fretboard range",
    };
  }

  const transposed: ChordPosition = {
    frets: newFrets,
    fingers: position.fingers,
    baseFret: position.baseFret + (newFrets.find((f) => f > 0) || 0) - Math.max(1, position.frets.find((f) => f > 0) || 1),
    barres: position.barres?.map((b) => b + semitones),
    capo: position.capo,
    midi: position.midi.map((m) => m + semitones),
  };

  return {
    original: position,
    transposed,
    shiftAmount: semitones,
    valid: true,
  };
}

export function findAllVoicingsForChord(
  rootNote: ChordKey,
  targetNotes: string[],
  maxFret: number = 12
): ChordPosition[] {
  const voicings: ChordPosition[] = [];

  const rootMidi = NOTE_NAMES.indexOf(rootNote) + 48;
  const targetMidis = targetNotes.map((n) => {
    const baseIndex = NOTE_NAMES.indexOf(n);
    return baseIndex >= rootMidi % 12 ? baseIndex + 48 : baseIndex + 60;
  });

  for (let baseFret = 0; baseFret <= maxFret - 3; baseFret++) {
    const frets: number[] = [];
    const midi: number[] = [];

    for (let string = 0; string < 6; string++) {
      const stringBaseMidi = STANDARD_TUNING[string].midi;
      let found = false;

      for (let fret = baseFret; fret <= baseFret + 4 && fret <= maxFret; fret++) {
        const noteMidi = stringBaseMidi + fret;
        const normalizedMidi = ((noteMidi % 12) + 12) % 12;

        for (const targetMidi of targetMidis) {
          const normalizedTarget = ((targetMidi % 12) + 12) % 12;
          if (normalizedMidi === normalizedTarget) {
            frets[string] = fret;
            midi[string] = noteMidi;
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (!found) frets[string] = -1;
    }

    const playedCount = frets.filter((f) => f >= 0).length;
    if (playedCount >= 3 && playedCount <= 6) {
      const maxF = Math.max(...frets.filter((f) => f >= 0));
      const minF = Math.min(...frets.filter((f) => f >= 0));

      if (maxF - minF <= 4) {
        voicings.push({
          frets,
          fingers: [],
          baseFret: minF,
          barres: [],
          midi,
        });
      }
    }
  }

  return voicings.slice(0, 10);
}

export function getRegionPositions(
  region: FretboardRegion,
  positions: FretboardPosition[]
): FretboardPosition[] {
  return positions.filter(
    (p) =>
      p.fret >= region.startFret &&
      p.fret <= region.endFret &&
      p.string >= region.startString &&
      p.string <= region.endString
  );
}
