"use client"

import { useRef, useState, useCallback, useEffect } from "react"

interface UseMetronomeReturn {
  isPlaying: boolean
  isReady: boolean
  currentBeat: number
  bpm: number
  start: () => Promise<void>
  stop: () => void
  setBpm: (bpm: number) => void
}

export function useMetronome(initialBpm = 80): UseMetronomeReturn {
  const synthRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [bpm, setBpmState] = useState(initialBpm)
  const beatsPerMeasure = 4

  const initAudio = useCallback(async () => {
    if (synthRef.current) return

    const Tone = await import("tone")
    await Tone.start()

    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
    }).toDestination()
    synth.volume.value = -12

    synthRef.current = synth
    setIsReady(true)
  }, [])

  const start = useCallback(async () => {
    if (!isReady) await initAudio()
    if (!synthRef.current) return

    setCurrentBeat(0)
    setIsPlaying(true)

    const msPerBeat = (60 / bpm) * 1000
    
    intervalRef.current = setInterval(() => {
      setCurrentBeat(prev => {
        const nextBeat = (prev + 1) % beatsPerMeasure
        synthRef.current?.triggerAttackRelease("C5", "32n")
        return nextBeat
      })
    }, msPerBeat)
  }, [bpm, isReady, initAudio])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCurrentBeat(0)
    setIsPlaying(false)
  }, [])

  const setBpm = useCallback((newBpm: number) => {
    const clamped = Math.max(40, Math.min(200, newBpm))
    setBpmState(clamped)
    
    if (isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current)
      const msPerBeat = (60 / clamped) * 1000
      intervalRef.current = setInterval(() => {
        setCurrentBeat(prev => {
          const nextBeat = (prev + 1) % beatsPerMeasure
          synthRef.current?.triggerAttackRelease("C5", "32n")
          return nextBeat
        })
      }, msPerBeat)
    }
  }, [isPlaying])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (synthRef.current) {
        synthRef.current.dispose()
        synthRef.current = null
      }
    }
  }, [])

  return {
    isPlaying,
    isReady,
    currentBeat,
    bpm,
    start,
    stop,
    setBpm
  }
}