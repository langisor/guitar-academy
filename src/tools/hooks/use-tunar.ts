"use client";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─── TypeScript Interfaces ───────────────────────────────────────────── */

export interface GuitarString {
  note: string;
  frequency: number;
  string: number;
}

export interface Note {
  note: string;
  frequency: number;
}

export type TunerStatus = "idle" | "listening" | "denied";

export interface TunerState {
  status: TunerStatus;
  frequency: number | null;
  note: string;
  cents: number;
  targetString: GuitarString | null;
  rms: number;
  playingNote: string | null;
  isInTune: boolean;
  showSuccess: boolean;
  /** A4 reference frequency (default 440 Hz) */
  a4Ref: number;
  /** Number of strings successfully tuned this session */
  tunedCount: number;
}

export interface UseTunerReturn extends TunerState {
  setTargetString: (string: GuitarString | null) => void;
  playReferenceNote: (noteData: GuitarString) => Promise<void>;
  drawWaveform: (canvasRef: React.RefObject<HTMLCanvasElement | null>) => void;
  setA4Ref: (hz: number) => void;
  startAudio: () => Promise<void>;
  stopAudio: () => void;
  GUITAR_STRINGS: GuitarString[];
  isInTune: boolean;
  showSuccess: boolean;
}

interface AnalyserRef {
  current: AnalyserNode | null;
}

interface AudioContextRef {
  current: AudioContext | null;
}

interface Float32ArrayRef {
  current: Float32Array | null;
}

interface AnimationFrameRef {
  current: number | null;
}

interface AudioBufferSourceRef {
  current: AudioBufferSourceNode | null;
}

interface AudioBufferCacheRef {
  current: Map<string, AudioBuffer>;
}

interface MedianFilterRef {
  current: MedianFilter;
}

/* ─── String definitions ─────────────────────────────────────────────── */
const BASE_GUITAR_STRINGS: GuitarString[] = [
  { note: "E2", frequency: 82.41,  string: 6 },
  { note: "A2", frequency: 110.0,  string: 5 },
  { note: "D3", frequency: 146.83, string: 4 },
  { note: "G3", frequency: 196.0,  string: 3 },
  { note: "B3", frequency: 246.94, string: 2 },
  { note: "E4", frequency: 329.63, string: 1 },
];

/**
 * Recompute guitar string frequencies for a given A4 reference.
 * Standard A4 = 440 Hz. Each string's frequency scales linearly.
 */
function buildGuitarStrings(a4Hz: number): GuitarString[] {
  const ratio = a4Hz / 440;
  return BASE_GUITAR_STRINGS.map(s => ({ ...s, frequency: s.frequency * ratio }));
}

/* Build full chromatic scale for free-mode note detection */
function buildChromatic(a4Hz: number): Note[] {
  const names = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const notes: Note[] = [];
  for (let o = 0; o <= 8; o++)
    for (let i = 0; i < 12; i++)
      notes.push({ note: `${names[i]}${o}`, frequency: a4Hz * Math.pow(2, (o * 12 + i - 57) / 12) });
  return notes;
}

/* ─── YIN pitch detection algorithm ─────────────────────────────────── */
/*
 * de Cheveigné & Kawahara (2002) "YIN, a fundamental frequency estimator
 * for speech and music." Uses Cumulative Mean Normalized Difference
 * Function (CMNDF) + parabolic interpolation — much more accurate and
 * stable than naive autocorrelation, especially for guitar.
 */
function detectPitchYIN(buffer: Float32Array, sampleRate: number, threshold = 0.15): number {
  const halfSize = Math.floor(buffer.length / 2);
  const yin = new Float32Array(halfSize);

  // Step 1 – difference function d(τ)
  // Step 2 – CMNDF: d'(τ) = d(τ) · τ / Σ d(j), d'(0) = 1
  yin[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < halfSize; tau++) {
    let diff = 0;
    for (let i = 0; i < halfSize; i++) {
      const d = buffer[i] - buffer[i + tau];
      diff += d * d;
    }
    runningSum += diff;
    yin[tau] = runningSum === 0 ? 0 : (diff * tau) / runningSum;
  }

  // Step 3 – absolute threshold: find first dip below threshold
  let tau = 2;
  while (tau < halfSize) {
    if (yin[tau] < threshold) {
      while (tau + 1 < halfSize && yin[tau + 1] < yin[tau]) tau++;
      break;
    }
    tau++;
  }

  if (tau === halfSize || yin[tau] >= threshold) return -1;

  // Step 5 – parabolic interpolation for sub-sample precision
  let betterTau = tau;
  if (tau > 0 && tau < halfSize - 1) {
    const s0 = yin[tau - 1], s2 = yin[tau + 1];
    const denom = 2 * yin[tau] - s2 - s0;
    if (Math.abs(denom) > 1e-10) betterTau = tau + (s0 - s2) / (2 * denom);
  }

  return sampleRate / betterTau;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
function findClosest(freq: number, pool: GuitarString[] | Note[]): GuitarString | Note {
  return pool.reduce((best, c) =>
    Math.abs(c.frequency - freq) < Math.abs(best.frequency - freq) ? c : best
  );
}

function getCents(detected: number, target: number): number {
  return 1200 * Math.log2(detected / target);
}

function getRMS(buf: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return Math.sqrt(sum / buf.length);
}

/* Median filter for pitch stability – eliminates outlier frames */
class MedianFilter {
  size: number;
  buf: number[];

  constructor(size = 7) {
    this.size = size;
    this.buf = [];
  }

  push(v: number): number {
    this.buf.push(v);
    if (this.buf.length > this.size) this.buf.shift();
    const s = [...this.buf].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  }
  reset(): void { this.buf = []; }
}

/* Map note name to audio filename (E2 → E2.mp3, A#2 → As2.mp3) */
function noteToFilename(note: string): string {
  return `/audio/guitar/${note.replace("#", "s")}.mp3`;
}

/* ─── Main Hook ──────────────────────────────────────────────────────── */
export function useTuner(): UseTunerReturn {
  // Audio analysis refs
  const audioCtxRef: AudioContextRef = useRef(null);
  const analyserRef: AnalyserRef = useRef(null);
  const dataArrayRef: Float32ArrayRef = useRef(null);
  const animRef: AnimationFrameRef = useRef(null);
  const pitchFilter: MedianFilterRef = useRef(new MedianFilter(7));

  // Playback refs
  const playbackCtxRef: AudioContextRef = useRef(null);
  const currentSourceRef: AudioBufferSourceRef = useRef(null);
  const audioBufferCache: AudioBufferCacheRef = useRef(new Map());
  const successAudioRef: AudioBufferSourceRef = useRef(null);

  // Use refs for values consumed inside the rAF loop to avoid stale closures
  const inTuneStabilityRef = useRef(0);
  const showSuccessRef = useRef(false);
  const targetStringRef = useRef<GuitarString | null>(null);
  const a4RefValueRef = useRef(440);
  const tunedNotesRef = useRef<Set<string>>(new Set());

  // State
  const [status,       setStatus]       = useState<TunerStatus>("idle");
  const [frequency,    setFrequency]    = useState<number | null>(null);
  const [note,         setNote]         = useState<string>("--");
  const [cents,        setCents]        = useState<number>(0);
  const [targetString, _setTargetString] = useState<GuitarString | null>(null);
  const [rms,          setRms]          = useState<number>(0);
  const [playingNote,  setPlayingNote]  = useState<string | null>(null);
  const [isInTune,     setIsInTune]     = useState<boolean>(false);
  const [showSuccess,  setShowSuccess]  = useState<boolean>(false);
  const [a4Ref,        _setA4Ref]       = useState<number>(440);
  const [tunedCount,   setTunedCount]   = useState<number>(0);

  /** Keep ref in sync with state so the rAF loop always sees the latest value */
  const setTargetString = useCallback((s: GuitarString | null) => {
    targetStringRef.current = s;
    _setTargetString(s);
  }, []);

  const setA4Ref = useCallback((hz: number) => {
    a4RefValueRef.current = hz;
    _setA4Ref(hz);
  }, []);

  /* Play success sound */
  const playSuccessSound = useCallback(async (): Promise<void> => {
    if (successAudioRef.current) {
      try { successAudioRef.current.stop(); } catch { /* ignore */ }
      successAudioRef.current = null;
    }

    if (!playbackCtxRef.current) {
      const AudioContextClass = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      playbackCtxRef.current = new AudioContextClass();
    }
    const ctx = playbackCtxRef.current;
    if (ctx.state === "suspended") await ctx.resume();

    try {
      let audioBuffer = audioBufferCache.current.get("/audio/success.mp3");
      if (!audioBuffer) {
        const response = await fetch("/audio/success.mp3");
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        audioBufferCache.current.set("/audio/success.mp3", audioBuffer);
      }
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => { successAudioRef.current = null; };
      source.start(0);
      successAudioRef.current = source;
    } catch (err) {
      console.error("Failed to play success sound:", err);
    }
  }, []);

  /* Draw waveform callback (passed to UI) */
  const drawWaveform = useCallback((canvasRef: React.RefObject<HTMLCanvasElement | null>): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width, H = canvas.height;

    // Idle / silence state — draw flat centre line
    if (!dataArrayRef.current) {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#22222a";
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      return;
    }

    const buf = dataArrayRef.current.subarray(0, 512);
    const currentRMS = getRMS(buf);

    ctx.clearRect(0, 0, W, H);

    // Gradient colour: green when in tune, amber otherwise
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    if (showSuccessRef.current) {
      grad.addColorStop(0, "#22d47b44");
      grad.addColorStop(0.5, "#22d47b");
      grad.addColorStop(1, "#22d47b44");
    } else if (currentRMS > 0.005) {
      grad.addColorStop(0, "#e8a02044");
      grad.addColorStop(0.5, "#e8a020");
      grad.addColorStop(1, "#e8a02044");
    } else {
      grad.addColorStop(0, "#22222a");
      grad.addColorStop(1, "#22222a");
    }

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = currentRMS > 0.005 ? 0.85 : 0.3;
    ctx.beginPath();

    const sliceW = W / buf.length;
    let x = 0;
    for (let i = 0; i < buf.length; i++) {
      const y = (1 - (buf[i] + 1) / 2) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      x += sliceW;
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, []);

  /* Main pitch-detection loop — uses refs only, no state in closure */
  const detect = useCallback(() => {
    const analyser  = analyserRef.current;
    const dataArray = dataArrayRef.current;
    if (!analyser || !dataArray) return;

    analyser.getFloatTimeDomainData(dataArray as any);

    const sigRMS = getRMS(dataArray);
    setRms(sigRMS);

    if (sigRMS > 0.005) {
      const sampleRate = audioCtxRef.current?.sampleRate ?? 44100;
      const raw = detectPitchYIN(dataArray, sampleRate, 0.12);

      if (raw !== -1 && raw > 60 && raw < 2000) {
        const smoothed = pitchFilter.current.push(raw);
        const a4Hz = a4RefValueRef.current;
        const chromatic = buildChromatic(a4Hz);
        const strings   = buildGuitarStrings(a4Hz);
        const ts = targetStringRef.current;
        const pool = ts ? [ts] : strings;
        const closest = findClosest(smoothed, pool.length > 1 ? chromatic : pool);
        const c = getCents(smoothed, closest.frequency);

        setFrequency(smoothed);
        setNote(closest.note);
        setCents(c);

        const currentlyInTune = Math.abs(c) <= 3;
        setIsInTune(currentlyInTune);

        if (currentlyInTune) {
          inTuneStabilityRef.current++;
          // Trigger success after 10 consecutive in-tune frames (~167 ms at 60 fps)
          if (inTuneStabilityRef.current >= 10 && !showSuccessRef.current) {
            showSuccessRef.current = true;
            setShowSuccess(true);

            // Track unique strings tuned this session
            const noteName = closest.note;
            if (!tunedNotesRef.current.has(noteName)) {
              tunedNotesRef.current.add(noteName);
              setTunedCount(tunedNotesRef.current.size);
            }

            playSuccessSound();
            setTimeout(() => {
              showSuccessRef.current = false;
              setShowSuccess(false);
            }, 2000);
          }
        } else {
          inTuneStabilityRef.current = 0;
          if (showSuccessRef.current) {
            showSuccessRef.current = false;
            setShowSuccess(false);
          }
        }
      }
    } else {
      if (sigRMS < 0.003) {
        setFrequency(null);
        pitchFilter.current.reset();
        inTuneStabilityRef.current = 0;
        if (showSuccessRef.current) {
          showSuccessRef.current = false;
          setShowSuccess(false);
        }
        setIsInTune(false);
      }
    }
    animRef.current = requestAnimationFrame(detect);
  }, [playSuccessSound]);

  /* Start microphone */
  const startAudio = useCallback(async () => {
    // Already listening, don't restart
    if (status === "listening") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 4096;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Float32Array(analyser.fftSize);

      audioCtxRef.current  = audioCtx;
      analyserRef.current  = analyser;
      dataArrayRef.current = dataArray;

      setStatus("listening");
      // Start animation loop in next effect
    } catch {
      setStatus("denied");
    }
  }, [status]);

  /* Stop microphone */
  const stopAudio = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    pitchFilter.current.reset();
    inTuneStabilityRef.current = 0;
    setStatus("idle");
    setFrequency(null);
    setNote("--");
    setCents(0);
    setRms(0);
    setIsInTune(false);
  }, []);

  /* Play reference note */
  const playReferenceNote = useCallback(async (noteData: GuitarString): Promise<void> => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch { /* ignore */ }
      currentSourceRef.current = null;
    }

    if (!playbackCtxRef.current) {
      const AudioContextClass = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      playbackCtxRef.current = new AudioContextClass();
    }
    const ctx = playbackCtxRef.current;
    if (ctx.state === "suspended") await ctx.resume();

    const filename = noteToFilename(noteData.note);

    try {
      setPlayingNote(noteData.note);

      let audioBuffer = audioBufferCache.current.get(filename);
      if (!audioBuffer) {
        const response = await fetch(filename);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        audioBufferCache.current.set(filename, audioBuffer);
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setPlayingNote(null);
        currentSourceRef.current = null;
      };
      source.start(0);
      currentSourceRef.current = source;
    } catch (err) {
      console.error("Failed to play reference note:", err);
      setPlayingNote(null);
    }
  }, []);

  /* Initialize on mount */
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 4096;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Float32Array(analyser.fftSize);

        audioCtxRef.current  = audioCtx;
        analyserRef.current  = analyser;
        dataArrayRef.current = dataArray;

        if (isMounted) {
          setStatus("listening");
        }
      } catch {
        if (isMounted) {
          setStatus("denied");
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      stopAudio();
      if (playbackCtxRef.current) playbackCtxRef.current.close();
    };
  }, [stopAudio]);

  /* Start animation loop when listening status is set */
  useEffect(() => {
    if (status !== "listening") return;
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(detect);
  }, [status]);

  /* Restart detect loop when targetString changes */
  useEffect(() => {
    if (status !== "listening") return;
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    pitchFilter.current.reset();
    animRef.current = requestAnimationFrame(detect);
  }, [targetString, status]);

  return {
    status,
    frequency,
    note,
    cents,
    targetString,
    rms,
    playingNote,
    isInTune,
    showSuccess,
    a4Ref,
    tunedCount,
    setTargetString,
    playReferenceNote,
    drawWaveform,
    setA4Ref,
    startAudio,
    stopAudio,
    GUITAR_STRINGS: buildGuitarStrings(a4Ref),
  };
}
