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
}

export const chords: Record<string, ChordData> = {
  Em: {
    name: 'Em',
    fingers: [
      { string: 4, fret: 2, finger: 2 },
      { string: 5, fret: 2, finger: 3 },
    ],
    openStrings: [6, 3, 2, 1],
    muteStrings: [],
  },
  Am: {
    name: 'Am',
    fingers: [
      { string: 2, fret: 1, finger: 1 },
      { string: 3, fret: 2, finger: 2 },
      { string: 4, fret: 2, finger: 3 },
    ],
    openStrings: [6],
    muteStrings: [1],
  },
  G: {
    name: 'G',
    fingers: [
      { string: 1, fret: 2, finger: 1 },
      { string: 2, fret: 3, finger: 2 },
      { string: 3, fret: 2, finger: 3 },
    ],
    openStrings: [5, 4],
    muteStrings: [6],
  },
  C: {
    name: 'C',
    fingers: [
      { string: 2, fret: 1, finger: 1 },
      { string: 4, fret: 2, finger: 2 },
      { string: 5, fret: 3, finger: 3 },
    ],
    openStrings: [1, 3],
    muteStrings: [6],
  },
  D: {
    name: 'D',
    fingers: [
      { string: 1, fret: 2, finger: 1 },
      { string: 2, fret: 3, finger: 2 },
      { string: 3, fret: 2, finger: 3 },
    ],
    openStrings: [],
    muteStrings: [6, 5, 4],
  },
  E: {
    name: 'E',
    fingers: [
      { string: 2, fret: 1, finger: 1 },
      { string: 3, fret: 2, finger: 2 },
      { string: 4, fret: 2, finger: 3 },
    ],
    openStrings: [6, 1, 5],
    muteStrings: [],
  },
  A: {
    name: 'A',
    fingers: [
      { string: 2, fret: 1, finger: 1 },
      { string: 3, fret: 2, finger: 2 },
      { string: 4, fret: 2, finger: 3 },
    ],
    openStrings: [5, 1],
    muteStrings: [6],
  },
  F: {
    name: 'F',
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
  },
  Dm: {
    name: 'Dm',
    fingers: [
      { string: 1, fret: 1, finger: 1 },
      { string: 2, fret: 2, finger: 2 },
      { string: 3, fret: 2, finger: 3 },
    ],
    openStrings: [4],
    muteStrings: [6, 5],
  },
  Bm: {
    name: 'Bm',
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
  },
}

export const chordList = Object.values(chords)

export const getChordByName = (name: string): ChordData | undefined => {
  return chords[name]
}

export const getAllChordNames = (): string[] => {
  return Object.keys(chords)
}
