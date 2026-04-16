import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserProgress {
 xp: number
 streak: number
 levelsCompleted: number[]
 currentLevelId: number | null
 dailyGoalMinutes: number
 dailyPracticeMinutes: number
 lastPracticeDate: string | null
 totalPracticeMinutes: number
}

interface ProgressState extends UserProgress {
 addXP: (amount: number) => void
 completeLevel: (levelId: number) => void
 updateDailyPractice: (minutes: number) => void
 updateStreak: () => void
 setCurrentLevel: (levelId: number) => void
 resetProgress: () => void
}

const initialState: UserProgress = {
 xp: 0,
 streak: 0,
 levelsCompleted: [],
 currentLevelId: 1,
 dailyGoalMinutes: 15,
 dailyPracticeMinutes: 0,
 lastPracticeDate: null,
 totalPracticeMinutes: 0,
}

export const useProgressStore = create<ProgressState>()(
 persist(
  (set, get) => ({
   ...initialState,

   addXP: (amount: number) => set((state) => ({
    xp: state.xp + amount
   })),

   completeLevel: (levelId: number) => set((state) => ({
    levelsCompleted: state.levelsCompleted.includes(levelId)
     ? state.levelsCompleted
     : [...state.levelsCompleted, levelId],
    xp: state.xp + 50
   })),

   updateDailyPractice: (minutes: number) => set((state) => ({
    dailyPracticeMinutes: state.dailyPracticeMinutes + minutes,
    totalPracticeMinutes: state.totalPracticeMinutes + minutes,
    lastPracticeDate: new Date().toISOString()
   })),

   updateStreak: () => {
    const state = get()
    const today = new Date().toISOString().split('T')[0]

    if (state.lastPracticeDate) {
     const lastDate = state.lastPracticeDate.split('T')[0]
     const yesterday = new Date()
     yesterday.setDate(yesterday.getDate() - 1)

     if (lastDate === today) return

     if (lastDate === yesterday.toISOString().split('T')[0]) {
      set({ streak: state.streak + 1 })
     } else {
      set({ streak: 1 })
     }
    } else {
     set({ streak: 1 })
    }
   },

   setCurrentLevel: (levelId: number) => set({
    currentLevelId: levelId
   }),

   resetProgress: () => set(initialState),
  }),
  {
   name: 'guitar-progress-storage',
  }
 )
)
