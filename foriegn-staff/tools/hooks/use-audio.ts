"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chord, ChordPosition } from "../types/chords.types";
import { AudioEngine, getAudioEngine } from "../services/audio.service";

export interface PlaybackState {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  tempo: number;
  volume: number;
  isReady: boolean;
}

export function useAudioPlayback() {
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    tempo: 80,
    volume: 0.7,
    isReady: false,
  });
  
  const engineRef = useRef<AudioEngine | null>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio engine
  useEffect(() => {
    const init = async () => {
      engineRef.current = getAudioEngine();
      await engineRef.current.init();
      setState(prev => ({ ...prev, isReady: true }));
    };
    init();
  }, []);

  // Update volume when changed
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setVolume(state.volume);
    }
  }, [state.volume]);

  const preloadChord = useCallback(async (chord: Chord, positionIndex: number = 0) => {
    if (!engineRef.current) return;
    await engineRef.current.preloadChord(chord, positionIndex);
  }, []);

  const playChord = useCallback((position: ChordPosition, duration: number = 2) => {
    if (!engineRef.current || !state.isReady) return;
    engineRef.current.playChord(position, 0, duration);
  }, [state.isReady]);

  const playNote = useCallback((midi: number, duration?: number) => {
    if (!engineRef.current || !state.isReady) return;
    engineRef.current.playNote(midi, 0, duration);
  }, [state.isReady]);

  const playProgression = useCallback(async (
    chords: Array<{ chord: Chord; positionIndex: number }>,
    onStepChange?: (index: number) => void
  ) => {
    if (!engineRef.current || !state.isReady || chords.length === 0) return;

    setState(prev => ({ 
      ...prev, 
      isPlaying: true, 
      totalSteps: chords.length,
      currentStep: 0 
    }));

    // Preload all chords
    await Promise.all(chords.map(({ chord, positionIndex }) => 
      engineRef.current?.preloadChord(chord, positionIndex)
    ));

    const beatDuration = (60 / state.tempo) * 1000 * 2; // 2 beats per chord
    let currentIndex = 0;

    // Play first chord immediately
    const first = chords[0];
    const firstPos = first.chord.positions[first.positionIndex] || first.chord.positions[0];
    if (firstPos) {
      engineRef.current.playChord(firstPos, 0, beatDuration / 1000);
    }
    onStepChange?.(0);

    playIntervalRef.current = setInterval(() => {
      currentIndex++;
      
      if (currentIndex >= chords.length) {
        // Loop back to start
        currentIndex = 0;
      }

      const { chord, positionIndex } = chords[currentIndex];
      const position = chord.positions[positionIndex] || chord.positions[0];
      
      if (position && engineRef.current) {
        engineRef.current.playChord(position, 0, beatDuration / 1000);
      }

      setState(prev => ({ ...prev, currentStep: currentIndex }));
      onStepChange?.(currentIndex);
    }, beatDuration);
  }, [state.isReady, state.tempo]);

  const stopPlayback = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current.resume();
    }
    setState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }));
  }, []);

  const pausePlayback = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    engineRef.current?.stop();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resumePlayback = useCallback(() => {
    engineRef.current?.resume();
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const setTempo = useCallback((tempo: number) => {
    setState(prev => ({ ...prev, tempo: Math.max(40, Math.min(200, tempo)) }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    preloadChord,
    playChord,
    playNote,
    playProgression,
    stopPlayback,
    pausePlayback,
    resumePlayback,
    setTempo,
    setVolume,
  };
}
