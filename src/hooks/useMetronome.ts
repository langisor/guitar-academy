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
  const transportRef = useRef<any>(null)
  const eventIdRef = useRef<number | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [bpm, setBpmState] = useState(initialBpm)
  const beatsPerMeasure = 4

  const initAudio = useCallback(async () => {
    if (synthRef.current) return

    const Tone = await import("tone")
    await Tone.start()

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination()
    synth.volume.value = -12

    synthRef.current = synth
    transportRef.current = Tone.Transport
    transportRef.current.bpm.value = bpm
    setIsReady(true)
  }, [bpm])

  const start = useCallback(async () => {
    if (!isReady) await initAudio()
    if (!transportRef.current) return

    const Tone = await import("tone")
    if (Tone.getContext().state !== 'running') {
      await Tone.start()
    }

    // Clear existing event if any
    if (eventIdRef.current !== null) {
      transportRef.current.clear(eventIdRef.current)
    }

    setCurrentBeat(0)
    setIsPlaying(true)

    let beatCounter = 0
    eventIdRef.current = transportRef.current.scheduleRepeat((time: number) => {
      const isDownbeat = beatCounter % beatsPerMeasure === 0
      
      // Schedule the sound
      synthRef.current?.triggerAttackRelease(
        isDownbeat ? "C5" : "G4",
        "32n",
        time
      )

      // Schedule the state update
      Tone.Draw.schedule(() => {
        setCurrentBeat(beatCounter % beatsPerMeasure)
        beatCounter++
      }, time)
    }, "4n")

    transportRef.current.start()
  }, [isReady, initAudio])

  const stop = useCallback(() => {
    if (transportRef.current) {
      transportRef.current.stop()
      if (eventIdRef.current !== null) {
        transportRef.current.clear(eventIdRef.current)
        eventIdRef.current = null
      }
    }
    setCurrentBeat(0)
    setIsPlaying(false)
  }, [])

  const setBpm = useCallback((newBpm: number) => {
    const clamped = Math.max(40, Math.min(240, newBpm))
    setBpmState(clamped)
    if (transportRef.current) {
      transportRef.current.bpm.value = clamped
    }
  }, [])

  useEffect(() => {
    return () => {
      if (transportRef.current) {
        transportRef.current.stop()
        transportRef.current.cancel()
      }
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