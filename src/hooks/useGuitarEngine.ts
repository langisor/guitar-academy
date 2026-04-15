"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { getGuitarEngine, AudioEngine, playChord as playChordEngine } from "@/lib/audio/GuitarSampleEngine"
import type { ChordData } from "@/data/music/chords"
import { getChordByName } from "@/data/music/chords"

export type StrumDirection = "down" | "up"

export interface PlaybackOptions {
  direction?: StrumDirection
  strumDelay?: number
  duration?: number | string
}

interface UseGuitarEngineReturn {
  isReady: boolean
  isLoading: boolean
  error: string | null
  playString: (stringNum: number, fret?: number) => Promise<void>
  playChord: (chordName: string, options?: PlaybackOptions) => Promise<void>
  playChordData: (chord: ChordData, options?: PlaybackOptions) => Promise<void>
  initialize: () => Promise<void>
  dispose: () => void
}

export function useGuitarEngine(): UseGuitarEngineReturn {
  const engineRef = useRef<AudioEngine | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initialize = useCallback(async () => {
    if (engineRef.current || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const Tone = await import("tone")
      await Tone.start()

      const engine = getGuitarEngine()
      await engine.initialize()

      engineRef.current = engine
      setIsReady(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initialize audio"
      setError(message)
      console.error("Guitar engine initialization failed:", err)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const playString = useCallback(
    async (stringNum: number, fret: number = 0) => {
      if (!engineRef.current) {
        await initialize()
      }

      if (engineRef.current) {
        engineRef.current.playString(stringNum, fret)
      }
    },
    [initialize]
  )

  const playChordData = useCallback(
    async (chord: ChordData, options: PlaybackOptions = {}) => {
      if (!engineRef.current) {
        await initialize()
      }

      if (engineRef.current) {
        playChordEngine(chord, options)
      }
    },
    [initialize]
  )

  const playChord = useCallback(
    async (chordName: string, options: PlaybackOptions = {}) => {
      const chord = getChordByName(chordName)
      if (!chord) {
        console.warn(`Chord not found: ${chordName}`)
        return
      }

      await playChordData(chord, options)
    },
    [playChordData]
  )

  const dispose = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.dispose()
      engineRef.current = null
      setIsReady(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      dispose()
    }
  }, [dispose])

  return {
    isReady,
    isLoading,
    error,
    playString,
    playChord,
    playChordData,
    initialize,
    dispose,
  }
}

export default useGuitarEngine
