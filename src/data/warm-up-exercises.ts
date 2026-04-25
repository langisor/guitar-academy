export interface WarmUpStep {
  step: number
  instruction: string
  tip?: string
}

export interface WarmUpExercise {
  id: string
  title: string
  description: string
  duration: string
  section: 1 | 2 | 3
  difficulty: "beginner" | "intermediate" | "advanced"
  steps: WarmUpStep[]
  tips?: string[]
  targetBpm?: number
  chords?: string[]
}

export const warmUpExercises: WarmUpExercise[] = [
  {
    id: "finger-stretching",
    title: "Finger Stretching",
    description: "Essential warm-up exercises to prepare your fingers for playing and prevent injury",
    duration: "5-10 min",
    section: 1,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Gently stretch fingers backward for 10 seconds each" },
      { step: 2, instruction: "Make fists and open hands 10 times" },
      { step: 3, instruction: "Rotate wrists clockwise and counterclockwise" },
      { step: 4, instruction: "Practice finger independence exercises on fretboard" },
      { step: 5, instruction: "Play chromatic runs slowly on all strings" }
    ],
    tips: [
      "Never force stretches - gentle tension only",
      "Do this before every practice session",
      "Stop if you feel pain",
      "Consistency is more important than intensity"
    ]
  },
  {
    id: "finger-independence",
    title: "Finger Independence",
    description: "Build finger independence and coordination",
    duration: "5 min",
    section: 1,
    difficulty: "beginner",
    targetBpm: 60,
    steps: [
      { step: 1, instruction: "Place fingers on frets 1-2-3-4 of the low E string (6th string)" },
      { step: 2, instruction: "Play each note slowly and clearly: index(1)-middle(2)-ring(3)-pinky(4)" },
      { step: 3, instruction: "Move to the A string (5th string) and repeat the pattern" },
      { step: 4, instruction: "Continue across all strings from low E to high e" },
      { step: 5, instruction: "Move up one fret (to fret 2) and repeat the pattern" }
    ],
    tips: [
      "Keep fingers close to fretboard",
      "Press only as hard as needed",
      "Maintain steady tempo with metronome",
      "Focus on clean, clear notes"
    ]
  },
  {
    id: "chromatic-warmup",
    title: "Chromatic Warm-Up",
    description: "Simple chromatic exercise for all fingers",
    duration: "3 min",
    section: 1,
    difficulty: "beginner",
    targetBpm: 60,
    steps: [
      { step: 1, instruction: "Play frets 1-2-3-4 on each string using one finger per fret" },
      { step: 2, instruction: "Start on 6th string (low E), move up to 1st string (high e)" },
      { step: 3, instruction: "Reverse: play frets 4-3-2-1 coming back down" },
      { step: 4, instruction: "Move position up one fret and repeat the pattern" },
      { step: 5, instruction: "Continue up the fretboard as far as comfortable" }
    ],
    tips: [
      "Keep thumb behind neck",
      "Arch fingers properly",
      "Start at 60 BPM",
      "Use metronome for steady tempo"
    ]
  },
  {
    id: "chord-transitions",
    title: "Basic Chord Transitions",
    description: "Master smooth transitions between essential beginner chords",
    duration: "15 min",
    section: 2,
    difficulty: "beginner",
    targetBpm: 60,
    chords: ["C", "G", "D", "Em", "Am"],
    steps: [
      { step: 1, instruction: "Practice G to C chord transition 20 times slowly" },
      { step: 2, instruction: "Add D chord: G-C-D-C progression" },
      { step: 3, instruction: "Practice Am to F transition (most difficult open to barre)" },
      { step: 4, instruction: "Combine: G-D-Em-C progression" },
      { step: 5, instruction: "Gradually increase tempo using metronome" }
    ],
    tips: [
      "Keep thumb behind neck for leverage",
      "Look for common finger positions between chords",
      "Practice without strumming first",
      "Use metronome once transitions are smooth"
    ]
  },
  {
    id: "one-minute-changes",
    title: "One Minute Changes",
    description: "Build speed between chord transitions",
    duration: "10 min",
    section: 2,
    difficulty: "beginner",
    targetBpm: 80,
    chords: ["C", "G"],
    steps: [
      { step: 1, instruction: "Choose two chords (e.g., C and G)" },
      { step: 2, instruction: "Set timer for 1 minute" },
      { step: 3, instruction: "Change between chord A to chord B as many times as possible" },
      { step: 4, instruction: "Count successful changes only" },
      { step: 5, instruction: "Record your score and try to beat it" }
    ],
    tips: [
      "Focus on accuracy over speed",
      "Look for common fingers between chords",
      "Practice the movement without strumming first",
      "Target: 30 changes/minute for C→G"
    ]
  },
  {
    id: "strumming-patterns",
    title: "Essential Strumming",
    description: "Learn the fundamental strumming patterns used in most popular songs",
    duration: "15 min",
    section: 3,
    difficulty: "beginner",
    targetBpm: 80,
    chords: ["C", "G", "Em", "D"],
    steps: [
      { step: 1, instruction: "Practice Down strokes only: D-D-D-D" },
      { step: 2, instruction: "Add Up strokes on the '&' beats: D-U-D-U" },
      { step: 3, instruction: "Full pattern: Down-Down-Up-Up-Down-Up (rock pattern)" },
      { step: 4, instruction: "Apply to progression: C-G-Em-D" },
      { step: 5, instruction: "Practice with different tempos, starting slower" }
    ],
    tips: [
      "Keep strumming hand moving even on upstrokes",
      "Start slowly and build speed gradually",
      "Focus on consistent rhythm over speed",
      "Practice with songs you know"
    ]
  }
]

export function getExerciseById(id: string): WarmUpExercise | undefined {
  return warmUpExercises.find(e => e.id === id)
}

export function getExercisesBySection(section: 1 | 2 | 3): WarmUpExercise[] {
  return warmUpExercises.filter(e => e.section === section)
}