import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`
  }
  return xp.toString()
}

export function calculateStreak(lastPracticeDate: Date | null): number {
  if (!lastPracticeDate) return 0
  
  const now = new Date()
  const diff = now.getTime() - lastPracticeDate.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 1
  if (days === 1) return 1
  
  return 0
}

export function getChordFingers(chordName: string): number[] {
  const chords: Record<string, number[]> = {
    'C': [0, 3, 2, 0, 1, 0],
    'D': [-1, -1, 0, 2, 3, 2],
    'Em': [0, 2, 2, 0, 0, 0],
    'G': [3, 2, 0, 0, 0, 3],
    'A': [0, 2, 2, 2, 0, 0],
    'Am': [0, 1, 2, 2, 0, 0],
    'E': [0, 2, 2, 1, 0, 0],
    'F': [1, 3, 3, 2, 1, 1],
    'F#m': [2, 4, 4, 3, 2, 2],
    'Bm': [-1, 2, 4, 4, 3, -1],
  }
  return chords[chordName] || [0, 0, 0, 0, 0, 0]
}
