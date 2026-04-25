"use client"

import { getOpenNote } from "./guitarStrings"

export interface FingerPosition {
  string: number
  fret: number
  finger: number
}

export interface ChordData {
  name: string
  fingers: FingerPosition[]
  openStrings: number[]
  muteStrings: number[]
  barreFrets?: { fret: number; fromString: number; toString: number }[]
  startFret?: number
  difficulty?: "easy" | "medium" | "hard"
}

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

export const CHROMATIC_INTERVALS: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
}

export function getNoteFromFret(baseNote: string, fret: number): string {
  const match = baseNote.match(/^([A-G]#?)(\d+)$/)
  if (!match) return baseNote

  const [, noteName, octaveStr] = match
  const octave = parseInt(octaveStr, 10)

  const noteIndex = CHROMATIC_INTERVALS[noteName]
  if (noteIndex === undefined) return baseNote

  const newNoteIndex = (noteIndex + fret) % 12
  const newOctave = octave + Math.floor((noteIndex + fret) / 12)

  const newNoteName = NOTE_NAMES[newNoteIndex]
  return `${newNoteName}${newOctave}`
}

export function getNoteAtStringFret(stringNum: number, fret: number): string {
  const openNote = getOpenNote(stringNum)
  return getNoteFromFret(openNote, fret)
}

export function getChordNotes(
  chord: ChordData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  leftHandMode: boolean = false
): { string: number; fret: number; note: string }[] {
  const notes: { string: number; fret: number; note: string }[] = []
  const muted = new Set(chord.muteStrings)
  const open = new Set(chord.openStrings)

  for (let stringNum = 1; stringNum <= 6; stringNum++) {
    if (muted.has(stringNum)) continue

    const finger = chord.fingers.find((f) => f.string === stringNum)
    const fret = finger?.fret ?? 0

    if (open.has(stringNum) || fret > 0) {
      const note = getNoteAtStringFret(stringNum, fret)
      notes.push({ string: stringNum, fret, note })
    }
  }

  return notes
}

export const chords: Record<string, ChordData> = {
  C: {
    name: "C",
    fingers: [
      { string: 2, fret: 1, finger: 1 },
      { string: 4, fret: 2, finger: 2 },
      { string: 5, fret: 3, finger: 3 },
    ],
    openStrings: [1, 3],
    muteStrings: [6],
  },
  D: {
    name: "D",
    fingers: [
      { string: 1, fret: 2, finger: 1 },
      { string: 2, fret: 3, finger: 2 },
      { string: 3, fret: 2, finger: 3 },
    ],
    openStrings: [],
    muteStrings: [6, 5, 4],
  },
  Dm: {
    name: "Dm",
    fingers: [
      { string: 1, fret: 1, finger: 1 },
      { string: 2, fret: 2, finger: 2 },
      { string: 3, fret: 2, finger: 3 },
    ],
    openStrings: [4],
    muteStrings: [6, 5],
    difficulty: "medium",
  },
  Em: {
    name: "Em",
    fingers: [
      { string: 4, fret: 2, finger: 2 },
      { string: 5, fret: 2, finger: 3 },
    ],
    openStrings: [6, 3, 2, 1],
    muteStrings: [],
    difficulty: "easy",
  },
  G: {
    name: "G",
    fingers: [
      { string: 1, fret: 2, finger: 1 },
      { string: 2, fret: 3, finger: 2 },
      { string: 3, fret: 2, finger: 3 },
    ],
    openStrings: [5, 4],
    muteStrings: [6],
    difficulty: "easy",
  },
  A: {
    name: "A",
    fingers: [
      { string: 2, fret: 1, finger: 1 },
      { string: 3, fret: 2, finger: 2 },
      { string: 4, fret: 2, finger: 3 },
    ],
    openStrings: [5, 1],
    muteStrings: [6],
    difficulty: "easy",
  },
  Am: {
    name: "Am",
    fingers: [
      { string: 2, fret: 1, finger: 1 },
      { string: 3, fret: 2, finger: 2 },
      { string: 4, fret: 2, finger: 3 },
    ],
    openStrings: [6],
    muteStrings: [1],
    difficulty: "easy",
  },
  E: {
    name: "E",
    fingers: [
      { string: 2, fret: 1, finger: 1 },
      { string: 3, fret: 2, finger: 2 },
      { string: 4, fret: 2, finger: 3 },
    ],
    openStrings: [6, 1, 5],
    muteStrings: [],
    difficulty: "easy",
  },
  F: {
    name: "F",
    fingers: [
      { string: 1, fret: 1, finger: 1 },
      { string: 2, fret: 1, finger: 1 },
      { string: 3, fret: 2, finger: 2 },
      { string: 4, fret: 3, finger: 3 },
      { string: 5, fret: 3, finger: 4 },
    ],
    barreFrets: [{ fret: 1, fromString: 6, toString: 1 }],
    openStrings: [],
    muteStrings: [],
    difficulty: "medium",
  },
  Fm: {
    name: "Fm",
    fingers: [
      { string: 1, fret: 1, finger: 1 },
      { string: 2, fret: 1, finger: 1 },
      { string: 3, fret: 3, finger: 3 },
      { string: 4, fret: 3, finger: 4 },
      { string: 5, fret: 3, finger: 4 },
    ],
    barreFrets: [{ fret: 1, fromString: 6, toString: 1 }],
    openStrings: [],
    muteStrings: [],
    difficulty: "medium",
  },
  FmChord: {
    name: "Fm (alt)",
    fingers: [
      { string: 1, fret: 1, finger: 1 },
      { string: 3, fret: 3, finger: 3 },
      { string: 4, fret: 3, finger: 4 },
      { string: 5, fret: 1, finger: 1 },
    ],
    barreFrets: [{ fret: 1, fromString: 5, toString: 1 }],
    openStrings: [],
    muteStrings: [6, 2],
    difficulty: "medium",
  },
  "F#m": {
    name: "F#m",
    fingers: [
      { string: 1, fret: 2, finger: 1 },
      { string: 2, fret: 2, finger: 1 },
      { string: 3, fret: 4, finger: 2 },
      { string: 4, fret: 4, finger: 3 },
      { string: 5, fret: 4, finger: 4 },
    ],
    barreFrets: [{ fret: 2, fromString: 5, toString: 1 }],
    openStrings: [],
    muteStrings: [],
    difficulty: "medium",
  },
  Bm: {
    name: "Bm",
    fingers: [
      { string: 1, fret: 2, finger: 1 },
      { string: 2, fret: 3, finger: 2 },
      { string: 3, fret: 4, finger: 3 },
      { string: 4, fret: 4, finger: 4 },
    ],
    barreFrets: [{ fret: 2, fromString: 5, toString: 1 }],
    openStrings: [],
    muteStrings: [6],
    startFret: 2,
    difficulty: "hard",
  },
  B7: {
    name: "B7",
    fingers: [
      { string: 1, fret: 2, finger: 1 },
      { string: 2, fret: 1, finger: 1 },
      { string: 3, fret: 2, finger: 2 },
      { string: 4, fret: 0, finger: 0 },
      { string: 5, fret: 2, finger: 3 },
    ],
    openStrings: [4],
    muteStrings: [6],
    difficulty: "medium",
  },
  E7: {
    name: "E7",
    fingers: [
      { string: 3, fret: 1, finger: 1 },
      { string: 4, fret: 0, finger: 0 },
      { string: 5, fret: 2, finger: 2 },
    ],
    openStrings: [6, 1, 5],
    muteStrings: [],
    difficulty: "easy",
  },
  A7: {
    name: "A7",
    fingers: [
      { string: 2, fret: 1, finger: 1 },
      { string: 3, fret: 0, finger: 0 },
      { string: 4, fret: 2, finger: 2 },
    ],
    openStrings: [5, 1],
    muteStrings: [6],
    difficulty: "easy",
  },
  D7: {
    name: "D7",
    fingers: [
      { string: 1, fret: 2, finger: 1 },
      { string: 2, fret: 1, finger: 1 },
      { string: 3, fret: 2, finger: 2 },
    ],
    openStrings: [4],
    muteStrings: [6, 5],
    difficulty: "easy",
  },
  G7: {
    name: "G7",
    fingers: [
      { string: 1, fret: 1, finger: 1 },
      { string: 2, fret: 0, finger: 0 },
      { string: 3, fret: 0, finger: 0 },
      { string: 4, fret: 0, finger: 0 },
    ],
    openStrings: [5, 4],
    muteStrings: [6],
    difficulty: "easy",
  },
  C7: {
    name: "C7",
    fingers: [
      { string: 1, fret: 1, finger: 1 },
      { string: 2, fret: 3, finger: 3 },
      { string: 3, fret: 2, finger: 2 },
      { string: 4, fret: 3, finger: 4 },
    ],
    openStrings: [3],
    muteStrings: [6],
    difficulty: "medium",
  },
  Gm: {
    name: "Gm",
    fingers: [
      { string: 1, fret: 3, finger: 1 },
      { string: 2, fret: 3, finger: 1 },
      { string: 3, fret: 3, finger: 1 },
      { string: 4, fret: 3, finger: 1 },
      { string: 5, fret: 3, finger: 1 },
    ],
    barreFrets: [{ fret: 3, fromString: 5, toString: 1 }],
    openStrings: [],
    muteStrings: [6],
    startFret: 3,
    difficulty: "hard",
  },
  Cm: {
    name: "Cm",
    fingers: [
      { string: 1, fret: 3, finger: 1 },
      { string: 2, fret: 4, finger: 2 },
      { string: 3, fret: 5, finger: 3 },
      { string: 4, fret: 5, finger: 4 },
      { string: 5, fret: 4, finger: 3 },
    ],
    barreFrets: [{ fret: 3, fromString: 5, toString: 1 }],
    openStrings: [],
    muteStrings: [6],
    startFret: 3,
    difficulty: "hard",
  },
}

export const chordList: ChordData[] = Object.values(chords)

export const getChordByName = (name: string): ChordData | undefined => {
  return chords[name]
}

export const getAllChordNames = (): string[] => {
  return Object.keys(chords)
}

export const getChordsByDifficulty = (
  difficulty: "easy" | "medium" | "hard"
): ChordData[] => {
  return chordList.filter((c) => c.difficulty === difficulty)
}
