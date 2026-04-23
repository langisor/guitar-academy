"use client";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─── String definitions ─────────────────────────────────────────────── */
const GUITAR_STRINGS = [
  { note: "E2", frequency: 82.41,  string: 6 },
  { note: "A2", frequency: 110.0,  string: 5 },
  { note: "D3", frequency: 146.83, string: 4 },
  { note: "G3", frequency: 196.0,  string: 3 },
  { note: "B3", frequency: 246.94, string: 2 },
  { note: "E4", frequency: 329.63, string: 1 },
];

/* Build full chromatic scale for free-mode note detection */
function buildChromatic() {
  const names = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const notes = [];
  for (let o = 0; o <= 8; o++)
    for (let i = 0; i < 12; i++)
      notes.push({ note: `${names[i]}${o}`, frequency: 440 * Math.pow(2, (o * 12 + i - 57) / 12) });
  return notes;
}
const CHROMATIC = buildChromatic();

/* ─── YIN pitch detection algorithm ─────────────────────────────────── */
/*
 * de Cheveigné & Kawahara (2002) "YIN, a fundamental frequency estimator
 * for speech and music." Uses Cumulative Mean Normalized Difference
 * Function (CMNDF) + parabolic interpolation — much more accurate and
 * stable than naive autocorrelation, especially for guitar.
 */
function detectPitchYIN(buffer, sampleRate, threshold = 0.15) {
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
function findClosest(freq, pool) {
  return pool.reduce((best, c) =>
    Math.abs(c.frequency - freq) < Math.abs(best.frequency - freq) ? c : best
  );
}

function getCents(detected, target) {
  return 1200 * Math.log2(detected / target);
}

function getRMS(buf) {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return Math.sqrt(sum / buf.length);
}

/* Median filter for pitch stability – eliminates outlier frames */
class MedianFilter {
  constructor(size = 7) { this.size = size; this.buf = []; }
  push(v) {
    this.buf.push(v);
    if (this.buf.length > this.size) this.buf.shift();
    const s = [...this.buf].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  }
  reset() { this.buf = []; }
}

/* Map note name to audio filename (E2 → E2.mp3, A#2 → As2.mp3) */
function noteToFilename(note) {
  return `/audio/guitar/${note.replace("#", "s")}.mp3`;
}

/* ─── Main Hook ──────────────────────────────────────────────────────── */
export function useTuner() {
  // Audio analysis refs
  const audioCtxRef    = useRef(null);
  const analyserRef    = useRef(null);
  const dataArrayRef   = useRef(null);
  const animRef        = useRef(null);
  const pitchFilter    = useRef(new MedianFilter(7));
  
  // Playback refs
  const playbackCtxRef = useRef(null);
  const currentSourceRef = useRef(null);
  const audioBufferCache = useRef(new Map());

  // State
  const [status,       setStatus]       = useState("idle");   // idle | listening | denied
  const [frequency,    setFrequency]    = useState(null);
  const [note,         setNote]         = useState("--");
  const [cents,        setCents]        = useState(0);
  const [targetString, setTargetString] = useState(null);
  const [rms,          setRms]          = useState(0);
  const [playingNote,  setPlayingNote]  = useState(null);

  /* Draw waveform callback (passed to UI) */
  const drawWaveform = useCallback((canvasRef) => {
    const canvas = canvasRef.current;
    if (!canvas || !dataArrayRef.current) return;
    
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const buf = dataArrayRef.current.subarray(0, 512);
    
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#22d47b";
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.7;
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

  /* Main pitch-detection loop */
  const detect = useCallback(() => {
    const analyser  = analyserRef.current;
    const dataArray = dataArrayRef.current;
    if (!analyser || !dataArray) return;

    analyser.getFloatTimeDomainData(dataArray);

    // Signal level
    const sigRMS = getRMS(dataArray);
    setRms(sigRMS);

    if (sigRMS > 0.005) {
      const raw = detectPitchYIN(dataArray, audioCtxRef.current.sampleRate, 0.15);
      if (raw !== -1 && raw > 60 && raw < 2000) {
        const smoothed = pitchFilter.current.push(raw);
        const pool = targetString ? [targetString] : GUITAR_STRINGS;
        const closest = findClosest(smoothed, pool.length > 1 ? CHROMATIC : pool);
        const c = getCents(smoothed, closest.frequency);

        setFrequency(smoothed);
        setNote(closest.note);
        setCents(c);
      }
    } else {
      // Silence – keep last note displayed but reset filter
      if (sigRMS < 0.003) {
        setFrequency(null);
        pitchFilter.current.reset();
      }
    }

    animRef.current = requestAnimationFrame(detect);
  }, [targetString]);

  /* Start microphone */
  const startAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false, 
          noiseSuppression: false, 
          autoGainControl: false 
        } 
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
      animRef.current = requestAnimationFrame(detect);
    } catch {
      setStatus("denied");
    }
  }, [detect]);

  /* Play reference note */
  const playReferenceNote = useCallback(async (noteData) => {
    // Stop any currently playing sound
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {}
      currentSourceRef.current = null;
    }

    // Initialize playback context if needed
    if (!playbackCtxRef.current) {
      playbackCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = playbackCtxRef.current;

    // Resume if suspended (autoplay policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const filename = noteToFilename(noteData.note);

    try {
      setPlayingNote(noteData.note);

      // Check cache
      let audioBuffer = audioBufferCache.current.get(filename);
      
      if (!audioBuffer) {
        // Fetch and decode
        const response = await fetch(filename);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        audioBufferCache.current.set(filename, audioBuffer);
      }

      // Play
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
    startAudio();
    return () => {
      if (animRef.current)        cancelAnimationFrame(animRef.current);
      if (audioCtxRef.current)    audioCtxRef.current.close();
      if (playbackCtxRef.current) playbackCtxRef.current.close();
    };
  }, [startAudio]);

  /* Restart detect loop when targetString changes */
  useEffect(() => {
    if (status !== "listening") return;
    cancelAnimationFrame(animRef.current);
    pitchFilter.current.reset();
    animRef.current = requestAnimationFrame(detect);
  }, [targetString, detect, status]);

  return {
    // State
    status,
    frequency,
    note,
    cents,
    targetString,
    rms,
    playingNote,
    
    // Actions
    setTargetString,
    playReferenceNote,
    drawWaveform,
    
    // Constants
    GUITAR_STRINGS,
  };
}