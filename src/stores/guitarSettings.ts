import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GuitarSettingsState {
  leftHandMode: boolean
  selectedChord: string | null
  highlightedNotes: string[]
  showNoteNames: boolean
  showFingerNumbers: boolean
  defaultFrets: number
  defaultStartFret: number
}

interface GuitarSettingsActions {
  toggleLeftHandMode: () => void
  setLeftHandMode: (enabled: boolean) => void
  setSelectedChord: (chord: string | null) => void
  setHighlightedNotes: (notes: string[]) => void
  toggleNoteNames: () => void
  toggleFingerNumbers: () => void
  setDefaultFrets: (frets: number) => void
  setDefaultStartFret: (fret: number) => void
}

export type GuitarSettings = GuitarSettingsState & GuitarSettingsActions

const initialState: GuitarSettingsState = {
  leftHandMode: false,
  selectedChord: null,
  highlightedNotes: [],
  showNoteNames: true,
  showFingerNumbers: true,
  defaultFrets: 5,
  defaultStartFret: 0,
}

export const useGuitarSettings = create<GuitarSettings>()(
  persist(
    (set) => ({
      ...initialState,

      toggleLeftHandMode: () => set((state) => ({
        leftHandMode: !state.leftHandMode
      })),

      setLeftHandMode: (enabled: boolean) => set({
        leftHandMode: enabled
      }),

      setSelectedChord: (chord: string | null) => set({
        selectedChord: chord
      }),

      setHighlightedNotes: (notes: string[]) => set({
        highlightedNotes: notes
      }),

      toggleNoteNames: () => set((state) => ({
        showNoteNames: !state.showNoteNames
      })),

      toggleFingerNumbers: () => set((state) => ({
        showFingerNumbers: !state.showFingerNumbers
      })),

      setDefaultFrets: (frets: number) => set({
        defaultFrets: frets
      }),

      setDefaultStartFret: (fret: number) => set({
        defaultStartFret: fret
      }),
    }),
    {
      name: 'guitar-settings-storage',
    }
  )
)
