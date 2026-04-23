"use client";

import { useRef, useEffect } from "react";
import { useTuner, GuitarString } from "../hooks/use-tunar";

/* ─── TypeScript Interfaces ───────────────────────────────────────────── */

interface NeedleGaugeProps {
  cents: number;
  active: boolean;
  showSuccess: boolean;
}

interface LEDBarProps {
  cents: number;
  active: boolean;
  showSuccess: boolean;
}

interface WaveformCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawWaveform: (canvasRef: React.RefObject<HTMLCanvasElement | null>) => void;
}

interface StringSelectorProps {
  targetString: GuitarString | null;
  onSelect: (string: GuitarString | null) => void;
  detectedNote: string;
  playingNote: string | null;
  onPlay: (noteData: GuitarString) => Promise<void>;
  GUITAR_STRINGS: GuitarString[];
}

interface SignalMeterProps {
  rms: number;
}

/* ─── Tuning Needle SVG ──────────────────────────────────────────────── */
function NeedleGauge({ cents, active, showSuccess }: NeedleGaugeProps) {
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const angleDeg = (clampedCents / 50) * 52;
  const inTune = active && Math.abs(clampedCents) <= 3; // Use reduced sensitivity

  const cx = 160, cy = 140, r = 110;

  function polarToXY(deg: number): [number, number] {
    const rad = (deg - 90) * (Math.PI / 180);
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }
  const arcStart = polarToXY(-52);
  const arcEnd   = polarToXY( 52);

  const ticks = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];

  const needleLen = 95;
  const nRad = (angleDeg - 90) * (Math.PI / 180);
  const nx = cx + needleLen * Math.cos(nRad);
  const ny = cy + needleLen * Math.sin(nRad);

  // Enhanced success visual
  const accent = showSuccess ? "#22d47b" : (inTune ? "#22d47b" : "#e8a020");

  return (
    <svg viewBox="0 0 320 160" className="w-full h-auto overflow-visible">
      <path
        d={`M ${arcStart[0]} ${arcStart[1]} A ${r} ${r} 0 0 1 ${arcEnd[0]} ${arcEnd[1]}`}
        fill="none" stroke="#2a2a32" strokeWidth="18" strokeLinecap="round"
      />
      {active && (() => {
        const seg = polarToXY(angleDeg);
        const large = Math.abs(angleDeg) > 0 ? 0 : 0;
        const sweep = angleDeg >= 0 ? 1 : 0;
        const origin = polarToXY(0);
        return (
          <path
            d={`M ${origin[0]} ${origin[1]} A ${r} ${r} 0 ${large} ${sweep} ${seg[0]} ${seg[1]}`}
            fill="none" stroke={accent} strokeWidth="18" strokeLinecap="round"
            className="opacity-70"
          />
        );
      })()}

      {ticks.map(t => {
        const inner = t === 0 ? 88 : (Math.abs(t) % 10 === 0 ? 94 : 99);
        const outer = 106;
        const pa = polarToXY((t / 50) * 52);
        const ia = [(cx + (inner / r) * (pa[0] - cx)), (cy + (inner / r) * (pa[1] - cy))];
        const oa = [(cx + (outer / r) * (pa[0] - cx)), (cy + (outer / r) * (pa[1] - cy))];
        return (
          <line key={t} x1={ia[0]} y1={ia[1]} x2={oa[0]} y2={oa[1]}
            stroke={t === 0 ? "#22d47b" : "#44444f"} strokeWidth={t === 0 ? 2 : 1}
          />
        );
      })}

      <text x={cx} y={cy - 26} textAnchor="middle" fill="#44444f" fontSize="9" className="font-mono">♭ FLAT</text>
      <text x={cx} y={cy - 26} textAnchor="middle" fill="#44444f" fontSize="9" className="font-mono" dx="46">SHARP ♯</text>
      <text x={cx - 46} y={cy - 26} textAnchor="middle" fill="#44444f" fontSize="9" className="font-mono">♭ FLAT</text>

      <line x1={cx} y1={cy} x2={nx} y2={ny}
        stroke={accent} strokeWidth="2.5" strokeLinecap="round"
        className="transition-all duration-75 ease-out"
        style={{ filter: `drop-shadow(0 0 4px ${accent})` }}
      />
      <circle cx={cx} cy={cy} r="5" fill={accent} />
      <circle cx={cx} cy={cy} r="2.5" fill="#0d0d12" />

      <text x={cx} y={cy + 26} textAnchor="middle"
        fill={active ? accent : "#33333f"}
        fontSize="13" className="font-mono font-bold"
      >
        {active ? `${clampedCents > 0 ? "+" : ""}${clampedCents.toFixed(1)}¢` : "– ¢"}
      </text>
    </svg>
  );
}

/* ─── LED Indicator Bar ──────────────────────────────────────────────── */
function LEDBar({ cents, active, showSuccess }: LEDBarProps) {
  const LEDS = 21;
  const mid  = Math.floor(LEDS / 2);
  const lit  = active ? Math.round((cents / 50) * mid) : null;
  const inTune = active && Math.abs(cents) <= 3; // Use reduced sensitivity

  return (
    <div className="flex gap-0.5 justify-center items-center">
      {Array.from({ length: LEDS }, (_, i) => {
        const pos   = i - mid;
        const isLit = lit !== null && (lit >= 0 ? pos >= 0 && pos <= lit : pos <= 0 && pos >= lit);
        const isCtr = i === mid;
        let bgColor = "bg-[#1a1a22]";
        let shadow = "";
        
        if (isLit || (inTune && isCtr) || showSuccess) {
          if (showSuccess || inTune) {
            bgColor = "bg-[#22d47b]";
            shadow = "shadow-[0_0_8px_#22d47b]";
          } else if (lit && lit > 2) {
            bgColor = "bg-[#e8501a]";
            shadow = "shadow-[0_0_5px_#e8501a]";
          } else if (lit && lit < -2) {
            bgColor = "bg-[#1a7ee8]";
            shadow = "shadow-[0_0_5px_#1a7ee8]";
          } else {
            bgColor = "bg-[#e8a020]";
            shadow = "shadow-[0_0_5px_#e8a020]";
          }
        } else if (isCtr) {
          bgColor = "bg-[#22472e]";
        }
        
        return (
          <div key={i} className={`
            ${isCtr ? 'w-1.5 h-3.5' : 'w-1 h-2.5'}
            rounded-sm ${bgColor} ${shadow} transition-colors duration-75
          `} />
        );
      })}
    </div>
  );
}

/* ─── Waveform Canvas ────────────────────────────────────────────────── */
function WaveformCanvas({ canvasRef, drawWaveform }: WaveformCanvasProps) {
  useEffect(() => {
    if (!canvasRef.current || !drawWaveform) return;
    const interval = setInterval(() => drawWaveform(canvasRef), 50);
    return () => clearInterval(interval);
  }, [canvasRef, drawWaveform]);

  return (
    <canvas ref={canvasRef} width={320} height={60}
      className="w-full h-[60px] rounded-md bg-[#0a0a10]"
    />
  );
}

/* ─── String Selector with Play Button ──────────────────────────────── */
function StringSelector({ targetString, onSelect, detectedNote, playingNote, onPlay, GUITAR_STRINGS }: StringSelectorProps) {
  return (
    <>
      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      <div className="grid grid-cols-6 gap-1.5">
        {GUITAR_STRINGS.map((s: GuitarString) => {
          const isTarget   = targetString?.note === s.note;
          const isDetected = !targetString && detectedNote === s.note;
          const isPlaying  = playingNote === s.note;
          const active     = isTarget || isDetected;
          
          return (
            <div key={s.note} className="relative">
              <button 
                onClick={() => onSelect(isTarget ? null : s)}
                className={`
                  w-full py-2 px-0 border-0 rounded-md cursor-pointer
                  font-mono text-xs font-bold leading-tight relative
                  ${active 
                    ? (isTarget ? 'bg-[#22d47b22]' : 'bg-[#22d47b11]') 
                    : 'bg-[#16161e]'
                  }
                  ${active ? 'text-[#22d47b]' : 'text-[#55556a]'}
                  ${isTarget 
                    ? 'outline outline-[1.5px] outline-[#22d47b55]' 
                    : 'outline outline-1 outline-[#22222a]'
                  }
                  transition-all duration-100
                `}
              >
                <div className="text-[11px] opacity-60">{s.string}</div>
                <div>{s.note}</div>
                {isPlaying && (
                  <div 
                    className="absolute inset-0 border-2 border-[#22d47b] rounded-md pointer-events-none"
                    style={{ animation: 'pulse-border 0.8s ease-in-out infinite' }}
                  />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(s);
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#22d47b55'}
                onMouseLeave={(e) => e.currentTarget.style.background = isPlaying ? '#22d47b' : '#22222a88'}
                className={`
                  absolute top-0.5 right-0.5 w-5 h-5
                  border-0 rounded cursor-pointer
                  flex items-center justify-center
                  text-[10px] transition-all duration-150
                  backdrop-blur-sm
                  ${isPlaying 
                    ? 'bg-[#22d47b] text-[#0d0d12]' 
                    : 'bg-[#22222a88] text-[#55556a]'
                  }
                `}
                title="Play reference tone"
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ─── Signal Meter ───────────────────────────────────────────────────── */
function SignalMeter({ rms }: SignalMeterProps) {
  const pct = Math.min(1, rms / 0.12) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-[#44444f] w-6">SIG</span>
      <div className="flex-1 h-0.5 bg-[#1a1a22] rounded-sm overflow-hidden">
        <div 
          className={`h-full rounded-sm transition-all duration-50 ${
            pct > 70 ? 'bg-[#e8501a]' : 'bg-[#22d47b]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function GuitarTuner() {
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    status,
    frequency,
    note,
    cents,
    targetString,
    rms,
    playingNote,
    isInTune,
    showSuccess,
    setTargetString,
    playReferenceNote,
    drawWaveform,
    GUITAR_STRINGS,
  } = useTuner();

  const isActive    = status === "listening" && frequency !== null;
  const inTune      = isActive && isInTune;
  const tuningLabel = !isActive
    ? (status === "denied" ? "mic access denied" : status === "listening" ? "play a string…" : "starting…")
    : inTune
      ? "in tune"
      : cents > 0 ? `${cents.toFixed(1)}¢ sharp` : `${Math.abs(cents).toFixed(1)}¢ flat`;

  const accentColor = showSuccess ? "#22d47b" : (inTune ? "#22d47b" : isActive ? "#e8a020" : "#33333f");
  const backgroundColor = showSuccess ? "bg-[#22d47b22]" : "bg-[#0d0d12]";

  return (
    <div className={`w-[360px] ${backgroundColor} rounded-2xl px-[18px] pt-5 pb-[18px] font-mono select-none shadow-[0_0_0_1px_#1e1e28,0_20px_60px_rgba(0,0,0,0.6)] transition-colors duration-300`}>

      {/* Header */}
      <div className="flex justify-between items-center mb-3.5">
        <div className="flex items-center gap-2">
          <div 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              status === "listening" 
                ? 'bg-[#22d47b] shadow-[0_0_6px_#22d47b]' 
                : 'bg-[#33333f]'
            }`} 
          />
          <span className="text-[11px] text-[#44444f] tracking-[0.12em] uppercase">Guitar Tuner</span>
        </div>
        <span className="text-[10px] text-[#2a2a35]">YIN</span>
      </div>

      {/* Waveform oscilloscope */}
      <WaveformCanvas canvasRef={waveCanvasRef} drawWaveform={drawWaveform} />

      {/* Needle gauge */}
      <div className="my-2 mt-2">
        <NeedleGauge cents={cents} active={isActive} showSuccess={showSuccess} />
      </div>

      {/* LED bar */}
      <LEDBar cents={cents} active={isActive} showSuccess={showSuccess} />

      {/* Note display */}
      <div className="text-center my-3.5 mt-3.5">
        <div 
          className="text-6xl font-bold tracking-tight leading-none transition-colors duration-200"
          style={{ 
            color: accentColor,
            textShadow: isActive ? `0 0 30px ${accentColor}44` : "none" 
          }}
        >
          {note}
        </div>
        <div className="text-[13px] text-[#55556a] mt-1">
          {isActive ? `${frequency.toFixed(2)} Hz` : "-- Hz"}
        </div>
        <div 
          className="text-[11px] mt-0.5 min-h-4 transition-colors duration-200"
          style={{ color: accentColor }}
        >
          {tuningLabel}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#1a1a22] my-3" />

      {/* String selector */}
      <div className="mb-2.5">
        <div className="text-[9px] text-[#33333f] tracking-[0.1em] mb-1.5">
          {targetString ? `LOCKED · STRING ${targetString.string}` : "AUTO DETECT · TAP TO LOCK"}
        </div>
        <StringSelector 
          targetString={targetString} 
          onSelect={setTargetString} 
          detectedNote={note}
          playingNote={playingNote}
          onPlay={playReferenceNote}
          GUITAR_STRINGS={GUITAR_STRINGS}
        />
      </div>

      {/* Signal meter */}
      <SignalMeter rms={rms} />
    </div>
  );
}