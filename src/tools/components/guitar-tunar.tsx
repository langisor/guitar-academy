"use client";

import { useRef, useEffect, useState } from "react";
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

interface A4SelectorProps {
  a4Ref: number;
  onChange: (hz: number) => void;
}

interface SessionStatsProps {
  tunedCount: number;
}

/* ─── Tuning Needle SVG ──────────────────────────────────────────────── */
function NeedleGauge({ cents, active, showSuccess }: NeedleGaugeProps) {
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const angleDeg = (clampedCents / 50) * 52;
  const inTune = active && Math.abs(clampedCents) <= 3;

  const cx = 160, cy = 140, r = 110;

  function polarToXY(deg: number): [number, number] {
    const rad = (deg - 90) * (Math.PI / 180);
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);
    return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
  }

  const arcStart = polarToXY(-52);
  const arcEnd   = polarToXY(52);

  const ticks = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];

  const needleLen = 95;
  const nRad = (angleDeg - 90) * (Math.PI / 180);
  const nx = cx + needleLen * Math.cos(nRad);
  const ny = cy + needleLen * Math.sin(nRad);

  const accent = showSuccess || inTune ? "#22d47b" : "#e8a020";

  // Arc fill from centre (0°) to current angle
  const arcFillEnd = polarToXY(angleDeg);
  const arcOrigin  = polarToXY(0);
  const largeArc   = Math.abs(angleDeg) > 180 ? 1 : 0;
  const sweepDir   = angleDeg >= 0 ? 1 : 0;

  return (
    <svg
      viewBox="0 0 320 160"
      className="w-full h-auto overflow-visible"
      role="img"
      aria-label={active ? `${clampedCents > 0 ? "+" : ""}${clampedCents.toFixed(1)} cents` : "Tuner needle"}
    >
      {/* Background arc track */}
      <path
        d={`M ${arcStart[0]} ${arcStart[1]} A ${r} ${r} 0 0 1 ${arcEnd[0]} ${arcEnd[1]}`}
        fill="none" stroke="#1e1e28" strokeWidth="18" strokeLinecap="round"
      />

      {/* Coloured fill arc from centre to needle position */}
      {active && Math.abs(angleDeg) > 0.5 && (
        <path
          d={`M ${arcOrigin[0]} ${arcOrigin[1]} A ${r} ${r} 0 ${largeArc} ${sweepDir} ${arcFillEnd[0]} ${arcFillEnd[1]}`}
          fill="none" stroke={accent} strokeWidth="18" strokeLinecap="round"
          className="opacity-60"
        />
      )}

      {/* Tick marks */}
      {ticks.map(t => {
        const inner = t === 0 ? 86 : (Math.abs(t) % 20 === 0 ? 92 : 98);
        const outer = 106;
        const pa = polarToXY((t / 50) * 52);
        const ia: [number, number] = [
          Math.round((cx + (inner / r) * (pa[0] - cx)) * 100) / 100,
          Math.round((cy + (inner / r) * (pa[1] - cy)) * 100) / 100,
        ];
        const oa: [number, number] = [
          Math.round((cx + (outer / r) * (pa[0] - cx)) * 100) / 100,
          Math.round((cy + (outer / r) * (pa[1] - cy)) * 100) / 100,
        ];
        const isMajor = Math.abs(t) % 10 === 0;
        return (
          <line
            key={t}
            x1={ia[0]} y1={ia[1]} x2={oa[0]} y2={oa[1]}
            stroke={t === 0 ? "#22d47b" : (isMajor ? "#3a3a4a" : "#2a2a35")}
            strokeWidth={t === 0 ? 2.5 : (isMajor ? 1.5 : 1)}
          />
        );
      })}

      {/* Tick labels at ±50, ±25 */}
      {([-50, -25, 0, 25, 50] as const).map(t => {
        const labelR = 78;
        const pa = polarToXY((t / 50) * 52);
        const lx = Math.round((cx + (labelR / r) * (pa[0] - cx)) * 100) / 100;
        const ly = Math.round((cy + (labelR / r) * (pa[1] - cy)) * 100) / 100;
        return (
          <text
            key={t}
            x={lx} y={ly}
            textAnchor="middle" dominantBaseline="middle"
            fill={t === 0 ? "#22d47b55" : "#2a2a35"}
            fontSize="7"
            className="font-mono select-none"
          >
            {t === 0 ? "0" : (t > 0 ? `+${t}` : `${t}`)}
          </text>
        );
      })}

      {/* ♭ / ♯ labels */}
      <text x={cx - 52} y={cy - 22} textAnchor="middle" fill="#33333f" fontSize="8" className="font-mono select-none">♭</text>
      <text x={cx + 52} y={cy - 22} textAnchor="middle" fill="#33333f" fontSize="8" className="font-mono select-none">♯</text>

      {/* Needle */}
      <line
        x1={cx} y1={cy}
        x2={Math.round(nx * 100) / 100} y2={Math.round(ny * 100) / 100}
        stroke={accent} strokeWidth="2.5" strokeLinecap="round"
        style={{
          transition: "all 80ms ease-out",
          filter: `drop-shadow(0 0 5px ${accent}88)`,
        }}
      />
      {/* Needle pivot */}
      <circle cx={cx} cy={cy} r="6" fill={accent} style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
      <circle cx={cx} cy={cy} r="2.5" fill="#0d0d12" />

      {/* Cents readout */}
      <text
        x={cx} y={cy + 28}
        textAnchor="middle"
        fill={active ? accent : "#2a2a35"}
        fontSize="13"
        className="font-mono font-bold select-none"
      >
        {active ? `${clampedCents > 0 ? "+" : ""}${clampedCents.toFixed(1)}¢` : "– ¢"}
      </text>
    </svg>
  );
}

/* ─── LED Indicator Bar ──────────────────────────────────────────────── */
function LEDBar({ cents, active, showSuccess }: LEDBarProps) {
  const LEDS = 21;
  const mid  = Math.floor(LEDS / 2); // 10
  const inTune = active && Math.abs(cents) <= 3;

  // How many LEDs to light from centre (signed)
  const litCount = active ? Math.round((Math.max(-50, Math.min(50, cents)) / 50) * mid) : null;

  return (
    <div className="flex gap-0.5 justify-center items-center" role="meter" aria-label="Tuning deviation" aria-valuenow={litCount ?? 0} aria-valuemin={-10} aria-valuemax={10}>
      {Array.from({ length: LEDS }, (_, i) => {
        const pos = i - mid; // -10 … +10
        const isLit =
          litCount !== null &&
          (litCount >= 0 ? pos >= 0 && pos <= litCount : pos <= 0 && pos >= litCount);
        const isCtr = i === mid;

        let bgColor = "bg-[#1a1a22]";
        let shadow  = "";

        if (showSuccess || (inTune && isCtr)) {
          bgColor = "bg-[#22d47b]";
          shadow  = "shadow-[0_0_8px_#22d47b]";
        } else if (isLit) {
          const absLit = Math.abs(litCount ?? 0);
          if (absLit > 6) {
            bgColor = (litCount ?? 0) > 0 ? "bg-[#e8501a]" : "bg-[#1a7ee8]";
            shadow  = (litCount ?? 0) > 0 ? "shadow-[0_0_5px_#e8501a]" : "shadow-[0_0_5px_#1a7ee8]";
          } else if (absLit > 2) {
            bgColor = "bg-[#e8a020]";
            shadow  = "shadow-[0_0_5px_#e8a020]";
          } else {
            bgColor = "bg-[#22d47b]";
            shadow  = "shadow-[0_0_5px_#22d47b]";
          }
        } else if (isCtr) {
          bgColor = "bg-[#22472e]";
        }

        return (
          <div
            key={i}
            className={`${isCtr ? "w-1.5 h-3.5" : "w-1 h-2.5"} rounded-sm ${bgColor} ${shadow} transition-colors duration-75`}
          />
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
    <canvas
      ref={canvasRef}
      width={320}
      height={60}
      className="w-full h-[60px] rounded-md bg-[#0a0a10]"
      aria-hidden="true"
    />
  );
}

/* ─── String Selector with Play Button ──────────────────────────────── */
function StringSelector({
  targetString,
  onSelect,
  detectedNote,
  playingNote,
  onPlay,
  GUITAR_STRINGS,
}: StringSelectorProps) {
  return (
    <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="Guitar string selector">
      {GUITAR_STRINGS.map((s: GuitarString) => {
        const isTarget   = targetString?.note === s.note;
        const isDetected = !targetString && detectedNote === s.note;
        const isPlaying  = playingNote === s.note;
        const active     = isTarget || isDetected;

        return (
          <div key={s.note} className="relative">
            <button
              onClick={() => onSelect(isTarget ? null : s)}
              aria-pressed={isTarget}
              aria-label={`String ${s.string}: ${s.note}`}
              className={[
                "w-full py-2 px-0 border-0 rounded-md cursor-pointer",
                "font-mono text-xs font-bold leading-tight relative",
                active
                  ? isTarget
                    ? "bg-[#22d47b22] text-[#22d47b] outline outline-[1.5px] outline-[#22d47b55]"
                    : "bg-[#22d47b11] text-[#22d47b] outline outline-1 outline-[#22d47b33]"
                  : "bg-[#16161e] text-[#55556a] outline outline-1 outline-[#22222a]",
                "transition-all duration-100",
              ].join(" ")}
            >
              <div className="text-[11px] opacity-60">{s.string}</div>
              <div>{s.note}</div>

              {/* Pulsing border when playing */}
              {isPlaying && (
                <div className="absolute inset-0 border-2 border-[#22d47b] rounded-md pointer-events-none animate-[pulse-border_0.8s_ease-in-out_infinite]" />
              )}
            </button>

            {/* Play reference tone button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(s);
              }}
              aria-label={`Play reference tone for ${s.note}`}
              className={[
                "absolute top-0.5 right-0.5 w-5 h-5",
                "border-0 rounded cursor-pointer",
                "flex items-center justify-center",
                "text-[10px] transition-all duration-150 backdrop-blur-sm",
                isPlaying
                  ? "bg-[#22d47b] text-[#0d0d12]"
                  : "bg-[#22222a88] text-[#55556a] hover:bg-[#22d47b55] hover:text-[#22d47b]",
              ].join(" ")}
              title="Play reference tone"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Signal Meter ───────────────────────────────────────────────────── */
function SignalMeter({ rms }: SignalMeterProps) {
  const pct = Math.min(1, rms / 0.12) * 100;
  return (
    <div className="flex items-center gap-2" role="meter" aria-label="Input signal level" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <span className="font-mono text-[10px] text-[#44444f] w-6 shrink-0">SIG</span>
      <div className="flex-1 h-0.5 bg-[#1a1a22] rounded-sm overflow-hidden">
        <div
          className={`h-full rounded-sm transition-all duration-75 ${pct > 70 ? "bg-[#e8501a]" : "bg-[#22d47b]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[9px] text-[#2a2a35] w-7 text-right tabular-nums">
        {pct > 0 ? `${Math.round(pct)}%` : ""}
      </span>
    </div>
  );
}

/* ─── A4 Reference Frequency Selector ───────────────────────────────── */
const A4_PRESETS = [432, 436, 438, 440, 441, 442, 444] as const;

function A4Selector({ a4Ref, onChange }: A4SelectorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        aria-label="A4 reference frequency"
        className="flex items-center gap-1.5 text-[10px] font-mono text-[#44444f] hover:text-[#22d47b] transition-colors duration-150 cursor-pointer"
      >
        <span className="text-[#2a2a35]">A4</span>
        <span className="text-[#22d47b] font-bold">{a4Ref} Hz</span>
        <span className="text-[#2a2a35] text-[8px]">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="absolute bottom-full right-0 mb-1.5 flex gap-1 bg-[#12121a] border border-[#22222a] rounded-lg p-1.5 shadow-xl z-10">
          {A4_PRESETS.map(hz => (
            <button
              key={hz}
              onClick={() => { onChange(hz); setExpanded(false); }}
              aria-pressed={a4Ref === hz}
              className={[
                "px-2 py-1 rounded text-[10px] font-mono font-bold transition-all duration-100 cursor-pointer border-0",
                a4Ref === hz
                  ? "bg-[#22d47b22] text-[#22d47b] outline outline-1 outline-[#22d47b55]"
                  : "bg-transparent text-[#44444f] hover:text-[#22d47b] hover:bg-[#22d47b11]",
              ].join(" ")}
            >
              {hz}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Session Stats ──────────────────────────────────────────────────── */
function SessionStats({ tunedCount }: SessionStatsProps) {
  const total = 6;
  return (
    <div className="flex items-center gap-2" aria-label={`${tunedCount} of ${total} strings tuned`}>
      <span className="font-mono text-[10px] text-[#44444f] shrink-0">TUNED</span>
      <div className="flex gap-0.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={[
              "w-2 h-2 rounded-full transition-all duration-300",
              i < tunedCount
                ? "bg-[#22d47b] shadow-[0_0_4px_#22d47b]"
                : "bg-[#1a1a22]",
            ].join(" ")}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] text-[#33333f] tabular-nums">
        {tunedCount}/{total}
      </span>
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
    a4Ref,
    tunedCount,
    setTargetString,
    playReferenceNote,
    drawWaveform,
    setA4Ref,
    startAudio,
    stopAudio,
    GUITAR_STRINGS,
  } = useTuner();

  const isActive    = status === "listening" && frequency !== null;
  const inTune      = isActive && isInTune;

  const tuningLabel = !isActive
    ? status === "denied"
      ? "mic access denied"
      : status === "listening"
        ? "play a string…"
        : "starting…"
    : inTune
      ? "in tune ✓"
      : cents > 0
        ? `${cents.toFixed(1)}¢ sharp`
        : `${Math.abs(cents).toFixed(1)}¢ flat`;

  const accentColor = showSuccess || inTune ? "#22d47b" : isActive ? "#e8a020" : "#33333f";

  return (
    <>
      {/* Keyframe for pulsing string border — injected once via a style tag */}
      <style>{`
        @keyframes pulse-border {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
      `}</style>

      <div
        className={[
          "w-full max-w-[380px] mx-auto rounded-2xl px-[18px] pt-5 pb-[18px]",
          "font-mono select-none",
          "shadow-[0_0_0_1px_#1e1e28,0_20px_60px_rgba(0,0,0,0.6)]",
          "transition-colors duration-300",
          showSuccess ? "bg-[#0d1a12]" : "bg-[#0d0d12]",
        ].join(" ")}
        role="region"
        aria-label="Guitar Tuner"
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center mb-3.5">
          <div className="flex items-center gap-2">
            <div
              className={[
                "w-2 h-2 rounded-full transition-all duration-300",
                status === "listening"
                  ? "bg-[#22d47b] shadow-[0_0_6px_#22d47b]"
                  : "bg-[#33333f]",
              ].join(" ")}
              aria-hidden="true"
            />
            <span className="text-[11px] text-[#44444f] tracking-[0.12em] uppercase">
              Guitar Tuner
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Start/Stop button */}
            <button
              onClick={() => status === "listening" ? stopAudio() : startAudio()}
              aria-label={status === "listening" ? "Stop tuner" : "Start tuner"}
              className={[
                "px-2.5 py-1.5 text-[10px] font-mono font-bold rounded-md transition-all duration-150 border-0 cursor-pointer",
                status === "listening"
                  ? "bg-[#e8501a22] text-[#e8501a] outline outline-1 outline-[#e8501a55] hover:outline-2"
                  : status === "denied"
                    ? "bg-[#1a1a22] text-[#44444f] cursor-not-allowed opacity-50"
                    : "bg-[#22d47b22] text-[#22d47b] outline outline-1 outline-[#22d47b55] hover:outline-2",
              ].join(" ")}
              disabled={status === "denied"}
            >
              {status === "listening" ? "⏹ Stop" : status === "denied" ? "Denied" : "▶ Start"}
            </button>

            {/* A4 reference selector */}
            <A4Selector a4Ref={a4Ref} onChange={setA4Ref} />
          </div>
        </div>

        {/* ── Waveform oscilloscope ───────────────────────────────────── */}
        <WaveformCanvas canvasRef={waveCanvasRef} drawWaveform={drawWaveform} />

        {/* ── Needle gauge ────────────────────────────────────────────── */}
        <div className="my-2">
          <NeedleGauge cents={cents} active={isActive} showSuccess={showSuccess} />
        </div>

        {/* ── LED bar ─────────────────────────────────────────────────── */}
        <LEDBar cents={cents} active={isActive} showSuccess={showSuccess} />

        {/* ── Note display ────────────────────────────────────────────── */}
        <div className="text-center my-3.5">
          <div
            className="text-6xl font-bold tracking-tight leading-none transition-colors duration-200"
            style={{
              color: accentColor,
              textShadow: isActive ? `0 0 30px ${accentColor}44` : "none",
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            {note}
          </div>
          <div className="text-[13px] text-[#55556a] mt-1 tabular-nums">
            {isActive ? `${frequency.toFixed(2)} Hz` : "-- Hz"}
          </div>
          <div
            className="text-[11px] mt-0.5 min-h-4 transition-colors duration-200"
            style={{ color: accentColor }}
            aria-live="polite"
          >
            {tuningLabel}
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className="h-px bg-[#1a1a22] my-3" />

        {/* ── String selector ─────────────────────────────────────────── */}
        <div className="mb-2.5">
          <div className="text-[9px] text-[#33333f] tracking-[0.1em] mb-1.5 uppercase">
            {targetString
              ? `Locked · String ${targetString.string} (${targetString.note})`
              : "Auto detect · tap to lock"}
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

        {/* ── Footer: signal meter + session stats ────────────────────── */}
        <div className="mt-3 space-y-1.5">
          <SignalMeter rms={rms} />
          <div className="h-px bg-[#1a1a22]" />
          <SessionStats tunedCount={tunedCount} />
        </div>
      </div>
    </>
  );
}
