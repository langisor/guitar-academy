"use client"

import type { ChordData } from "@/data/music/chords"

type StrumDirection = "down" | "up"

const SAMPLE_BASE_URL = "/samples/guitar/"

const STRING_NOTES: Record<number, string> = {
  6: "E2",
  5: "A2",
  4: "D3",
  3: "G3",
  2: "B3",
  1: "E4",
}

function getNoteAtFret(stringNum: number, fret: number): string {
  const baseNote = STRING_NOTES[stringNum]
  if (!baseNote) return "E4"

  const match = baseNote.match(/^([A-G]#?)(\d+)$/)
  if (!match) return baseNote

  const [, noteName, octaveStr] = match
  const octave = parseInt(octaveStr, 10)

  const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const CHROMATIC_INTERVALS: Record<string, number> = {
    C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11,
  }

  const noteIndex = CHROMATIC_INTERVALS[noteName]
  if (noteIndex === undefined) return baseNote

  const newNoteIndex = (noteIndex + fret) % 12
  const newOctave = octave + Math.floor((noteIndex + fret) / 12)

  return `${NOTE_NAMES[newNoteIndex]}${newOctave}`
}

class SynthesizerEngine {
  private audioContext: AudioContext | null = null
  private oscillators: Map<string, OscillatorNode> = new Map()
  private gains: Map<string, GainNode> = new Map()

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    return this.audioContext
  }

  async ensureResumed(): Promise<void> {
    const ctx = this.getAudioContext()
    if (ctx.state === "suspended") {
      await ctx.resume()
    }
  }

  noteToFrequency(note: string): number {
    const match = note.match(/^([A-G]#?)(\d+)$/)
    if (!match) return 440

    const [, noteName, octaveStr] = match
    const octave = parseInt(octaveStr, 10)

    const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    const noteIndex = NOTE_NAMES.indexOf(noteName)
    const a4Index = NOTE_NAMES.indexOf("A")
    const a4Octave = 4

    const semitones = (octave - a4Octave) * 12 + (noteIndex - a4Index)
    return 440 * Math.pow(2, semitones / 12)
  }

  playNote(note: string, duration: number = 1, delay: number = 0): void {
    const ctx = this.getAudioContext()
    const id = `${note}-${Date.now()}-${Math.random()}`

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = "sawtooth"
    oscillator.frequency.setValueAtTime(this.noteToFrequency(note), ctx.currentTime + delay)
    oscillator.connect(gainNode)

    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.setValueAtTime(2000, ctx.currentTime + delay)
    filter.Q.setValueAtTime(1, ctx.currentTime + delay)

    gainNode.connect(filter)
    filter.connect(ctx.destination)

    const now = ctx.currentTime + delay
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

    oscillator.start(now)
    oscillator.stop(now + duration)

    this.oscillators.set(id, oscillator)
    this.gains.set(id, gainNode)

    oscillator.onended = () => {
      this.oscillators.delete(id)
      this.gains.delete(id)
    }
  }

  playString(stringNum: number, fret: number = 0, duration: number = 1.5, delay: number = 0): void {
    const note = getNoteAtFret(stringNum, fret)
    this.playNote(note, duration, delay)
  }

  playStrum(
    notes: { string: number; fret: number }[],
    direction: StrumDirection = "down",
    strumDelay: number = 0.035,
    duration: number = 1.5
  ): void {
    const sortedNotes = [...notes].sort((a, b) => {
      return direction === "down" ? b.string - a.string : a.string - b.string
    })

    sortedNotes.forEach((note, index) => {
      this.playString(note.string, note.fret, duration, index * strumDelay)
    })
  }

  dispose(): void {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop()
        osc.disconnect()
      } catch {}
    })
    this.oscillators.clear()
    this.gains.clear()

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

interface ToneSampler {
  triggerAttackRelease: (note: string, duration: string, time?: number) => void
  dispose: () => void
}

interface ToneModule {
  now: () => number
  Sampler: new (options: object) => ToneSampler
}

class ToneJSEngine {
  private sampler: ToneSampler | null = null
  private loaded: boolean = false
  private ToneModule: ToneModule | null = null

  async initialize(): Promise<void> {
    if (this.loaded) return

    try {
      const ToneModule = await import("tone")
      this.ToneModule = ToneModule

      const hasSamples = await this.checkSamplesExist()
      if (hasSamples) {
        this.sampler = new ToneModule.Sampler({
          urls: {
            E2: "E2.mp3",
            A2: "A2.mp3",
            D3: "D3.mp3",
            G3: "G3.mp3",
            B3: "B3.mp3",
            E4: "E4.mp3",
          },
          baseUrl: SAMPLE_BASE_URL,
          onload: () => {
            this.loaded = true
          },
        }).toDestination()
      } else {
        this.sampler = null
        this.loaded = true
      }
    } catch (error) {
      console.warn("Tone.js not available, using Web Audio fallback:", error)
      this.sampler = null
      this.loaded = true
    }
  }

  private async checkSamplesExist(): Promise<boolean> {
    try {
      const response = await fetch(`${SAMPLE_BASE_URL}E2.mp3`, { method: "HEAD" })
      return response.ok
    } catch {
      return false
    }
  }

  isLoaded(): boolean {
    return this.loaded
  }

  playString(stringNum: number, fret: number = 0, delay: number = 0): void {
    if (this.sampler && this.ToneModule) {
      const note = getNoteAtFret(stringNum, fret)
      this.sampler.triggerAttackRelease(note, "2n", this.ToneModule.now() + delay)
    } else {
      SynthEngine.playString(stringNum, fret, 1.5, delay)
    }
  }

  playStrum(
    notes: { string: number; fret: number }[],
    direction: StrumDirection = "down",
    strumDelay: number = 0.035,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _duration: number | string = "2n"
  ): void {
    const sortedNotes = [...notes].sort((a, b) => {
      return direction === "down" ? b.string - a.string : a.string - b.string
    })

    sortedNotes.forEach((note, index) => {
      this.playString(note.string, note.fret, index * strumDelay)
    })
  }

  dispose(): void {
    if (this.sampler) {
      this.sampler.dispose()
      this.sampler = null
    }
    this.loaded = false
  }
}

export const SynthEngine = new SynthesizerEngine()
export const ToneEngine = new ToneJSEngine()

export type AudioEngine = {
  initialize: () => Promise<void>
  isLoaded: () => boolean
  playString: (stringNum: number, fret?: number, delay?: number) => void
  playStrum: (
    notes: { string: number; fret: number }[],
    direction?: StrumDirection,
    strumDelay?: number,
    duration?: number | string
  ) => void
  dispose: () => void
}

export function getGuitarEngine(): AudioEngine {
  return ToneEngine as unknown as AudioEngine
}

export interface PlaybackOptions {
  direction?: StrumDirection
  strumDelay?: number
  duration?: number | string
  volume?: number
}

export function playChord(
  chord: ChordData,
  options: PlaybackOptions = {}
): void {
  const engine = getGuitarEngine()

  const muted = new Set(chord.muteStrings)
  const notes: { string: number; fret: number }[] = []

  for (const finger of chord.fingers) {
    if (!muted.has(finger.string)) {
      notes.push({ string: finger.string, fret: finger.fret })
    }
  }

  for (const openString of chord.openStrings) {
    if (!muted.has(openString) && !notes.some((n) => n.string === openString)) {
      notes.push({ string: openString, fret: 0 })
    }
  }

  const direction = options.direction ?? "down"
  const strumDelay = options.strumDelay ?? 0.035

  engine.playStrum(notes, direction, strumDelay, options.duration ?? "2n")
}

export function playString(stringNum: number, fret: number = 0): void {
  const engine = getGuitarEngine()
  engine.playString(stringNum, fret)
}
