"use client";

import { Chord, ChordPosition } from "../types/chords.types";

// Audio file mapping: note name -> available octaves
const NOTE_FILES: Record<string, number[]> = {
  "A": [2, 3, 4],
  "A#": [2, 3, 4], // As in files
  "Bb": [2, 3, 4], // enharmonic
  "B": [2, 3, 4],
  "C": [3, 4, 5],
  "C#": [3, 4, 5], // Cs in files
  "Db": [3, 4, 5], // enharmonic
  "D": [2, 3, 4, 5],
  "D#": [2, 3, 4], // Ds in files
  "Eb": [2, 3, 4], // enharmonic
  "E": [2, 3, 4],
  "F": [2, 3, 4],
  "F#": [2, 3, 4], // Fs in files
  "Gb": [2, 3, 4], // enharmonic
  "G": [2, 3, 4],
  "G#": [2, 3, 4], // Gs in files
  "Ab": [2, 3, 4], // enharmonic
};

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function midiToNoteName(midi: number): { note: string; octave: number } {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return { note: NOTE_NAMES[noteIndex], octave };
}

function getAudioFileName(midi: number): string | null {
  const { note, octave } = midiToNoteName(midi);
  // Map to file naming convention (As instead of A#, etc.)
  const fileNote = note.replace("#", "s");
  const availableOctaves = NOTE_FILES[note] || NOTE_FILES[note.replace("#", "") + "#"] || [];
  
  // Find closest octave
  const targetOctave = availableOctaves.includes(octave) 
    ? octave 
    : availableOctaves.reduce((closest, oct) => 
        Math.abs(oct - octave) < Math.abs(closest - octave) ? oct : closest,
        availableOctaves[0] || 3
      );
  
  return `/audio/guitar/${fileNote}${targetOctave}.mp3`;
}

export interface AudioNote {
  midi: number;
  url: string;
  when: number; // when to play in seconds
  duration: number;
  gain: number;
}

export interface ChordPlaybackNotes {
  chord: Chord;
  position: ChordPosition;
  notes: AudioNote[];
  duration: number;
}

export class AudioEngine {
  private context: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private masterGain: GainNode | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    this.context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Master gain
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.7;
    this.masterGain.connect(this.context.destination);

    // Create reverb
    await this.createReverb();
    
    this.isInitialized = true;
  }

  private async createReverb(): Promise<void> {
    if (!this.context) return;
    
    this.reverbNode = this.context.createConvolver();
    
    // Create simple impulse response for reverb
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * 2; // 2 seconds
    const impulse = this.context.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Exponential decay noise
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    
    this.reverbNode.buffer = impulse;
    
    // Reverb mix
    const reverbGain = this.context.createGain();
    reverbGain.gain.value = 0.2;
    this.reverbNode.connect(reverbGain);
    reverbGain.connect(this.masterGain!);
  }

  async loadNote(midi: number): Promise<AudioBuffer | null> {
    const url = getAudioFileName(midi);
    if (!url) return null;
    if (!this.context) return null;

    if (this.audioBuffers.has(url)) {
      return this.audioBuffers.get(url)!;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(url, audioBuffer);
      return audioBuffer;
    } catch (e) {
      console.warn(`Failed to load audio: ${url}`, e);
      return null;
    }
  }

  async preloadChord(chord: Chord, positionIndex: number = 0): Promise<void> {
    const position = chord.positions[positionIndex];
    if (!position) return;

    for (const midi of position.midi) {
      await this.loadNote(midi);
    }
  }

  playNote(midi: number, when: number = 0, duration?: number, gain: number = 1): void {
    if (!this.context || !this.masterGain) return;

    const buffer = this.audioBuffers.get(getAudioFileName(midi) || "");
    if (!buffer) {
      console.warn(`Note not loaded: ${midi}`);
      return;
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    const noteGain = this.context.createGain();
    noteGain.gain.value = gain;

    source.connect(noteGain);
    noteGain.connect(this.masterGain);
    
    // Also connect to reverb for depth
    if (this.reverbNode) {
      const reverbSend = this.context.createGain();
      reverbSend.gain.value = 0.3;
      noteGain.connect(reverbSend);
      reverbSend.connect(this.reverbNode);
    }

    const startTime = this.context.currentTime + when;
    source.start(startTime);

    if (duration) {
      const fadeOut = this.context.createGain();
      noteGain.disconnect();
      noteGain.connect(fadeOut);
      fadeOut.connect(this.masterGain);
      
      fadeOut.gain.setValueAtTime(1, startTime + duration - 0.1);
      fadeOut.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      source.stop(startTime + duration);
    }
  }

  playChord(position: ChordPosition, when: number = 0, duration: number = 2, strumDelay: number = 0.02): void {
    if (!this.context) return;

    // Strum effect: play notes with slight delay between them
    position.midi.forEach((midi, index) => {
      const noteDelay = index * strumDelay;
      // Higher gain for root note (first note is usually root)
      const gain = index === 0 ? 1.0 : 0.8;
      this.playNote(midi, when + noteDelay, duration, gain);
    });
  }

  async playProgression(
    chords: Array<{ chord: Chord; positionIndex: number }>,
    tempo: number = 80,
    onBeat?: (index: number) => void
  ): Promise<void> {
    if (!this.context) return;
    
    const beatDuration = 60 / tempo * 2; // 2 beats per chord (half note)
    
    for (let i = 0; i < chords.length; i++) {
      const { chord, positionIndex } = chords[i];
      const position = chord.positions[positionIndex] || chord.positions[0];
      
      if (position) {
        // Preload if not loaded
        await this.preloadChord(chord, positionIndex);
        
        // Play chord
        this.playChord(position, i * beatDuration, beatDuration);
        
        // Callback for visualization
        if (onBeat) {
          setTimeout(() => onBeat(i), i * beatDuration * 1000);
        }
      }
    }
  }

  stop(): void {
    if (!this.context) return;
    this.context.suspend();
  }

  resume(): void {
    if (!this.context) return;
    this.context.resume();
  }

  setVolume(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  getCurrentTime(): number {
    return this.context?.currentTime || 0;
  }
}

// Singleton instance
let audioEngine: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!audioEngine) {
    audioEngine = new AudioEngine();
  }
  return audioEngine;
}

export function formatNoteName(midi: number): string {
  const { note, octave } = midiToNoteName(midi);
  return `${note}${octave}`;
}
