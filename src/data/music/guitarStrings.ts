"use client"

export interface GuitarString {
  string: number
  note: string
  octave: number
}

export const guitarStrings: GuitarString[] = [
  { string: 6, note: "E", octave: 2 },
  { string: 5, note: "A", octave: 2 },
  { string: 4, note: "D", octave: 3 },
  { string: 3, note: "G", octave: 3 },
  { string: 2, note: "B", octave: 3 },
  { string: 1, note: "E", octave: 4 },
]

export const stringCount = 6

export const getStringByNumber = (stringNum: number): GuitarString | undefined => {
  return guitarStrings.find((s) => s.string === stringNum)
}

export const getOpenNote = (stringNum: number): string => {
  const guitarString = getStringByNumber(stringNum)
  if (!guitarString) return "E4"
  return `${guitarString.note}${guitarString.octave}`
}

export const getStringLabel = (stringNum: number): string => {
  const guitarString = getStringByNumber(stringNum)
  if (!guitarString) return "?"
  return guitarString.note + guitarString.octave
}
