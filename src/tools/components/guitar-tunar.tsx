"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Mic, MicOff } from "lucide-react";
import { useTuner } from "@/tools/hooks/use-tuner";

/* ─── Tuning Needle SVG ──────────────────────────────────────────────── */
function NeedleGauge({ cents, active }: { cents: number; active: boolean }) {
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const angleDeg = (clampedCents / 50) * 52;           // ±52° swing
  const inTune = active && Math.abs(clampedCents) < 5;

  // Arc parameters
  const cx = 160, cy = 140, r = 110;
  const startAng = -232, endAng = -308; // unused – manual path instead

  // Generate arc path from -52° to +52° centred at bottom
  function polarToXY(deg: number) {
    const rad = (deg - 90) * (Math.PI / 180);
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }
  const arcStart = polarToXY(-52);
  const arcEnd   = polarToXY( 52);

  // Tick marks
  const ticks = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];

  // Needle endpoint
  const needleLen = 95;
  const nRad = (angleDeg - 90) * (Math.PI / 180);
  const nx = cx + needleLen * Math.cos(nRad);
  const ny = cy + needleLen * Math.sin(nRad);

  const accent = inTune ? "var(--primary)" : "var(--accent)";
  const dim    = inTune ? "var(--primary)" : "var(--accent)";

  return (
    <svg viewBox="0 0 320 160" style={{ width: "100%", height: "auto", overflow: "visible" }}>
      {/* Arc track */}
      <path
        d={`M ${arcStart[0]} ${arcStart[1]} A ${r} ${r} 0 0 1 ${arcEnd[0]} ${arcEnd[1]}`}
        fill="none" stroke="var(--border)" strokeWidth="18" strokeLinecap="round"
      />
      {/* Active arc segment */}
      {active && (() => {
        const seg = polarToXY(angleDeg);
        const large = Math.abs(angleDeg) > 0 ? 0 : 0;
        const sweep = angleDeg >= 0 ? 1 : 0;
        const origin = polarToXY(0);
        return (
          <path
            d={`M ${origin[0]} ${origin[1]} A ${r} ${r} 0 ${large} ${sweep} ${seg[0]} ${seg[1]}`}
            fill="none" stroke={accent} strokeWidth="18" strokeLinecap="round"
            style={{ opacity: 0.7 }}
          />
        );
      })()}

      {/* Tick marks */}
      {ticks.map(t => {
        const inner = t === 0 ? 88 : (Math.abs(t) % 10 === 0 ? 94 : 99);
        const outer = 106;
        const pa = polarToXY((t / 50) * 52);
        const pb = polarToXY((t / 50) * 52);
        const ia = [(cx + (inner / r) * (pa[0] - cx)), (cy + (inner / r) * (pa[1] - cy))];
        const oa = [(cx + (outer / r) * (pa[0] - cx)), (cy + (outer / r) * (pa[1] - cy))];
        return (
          <line key={t} x1={Number(ia[0].toFixed(2))} y1={Number(ia[1].toFixed(2))} x2={Number(oa[0].toFixed(2))} y2={Number(oa[1].toFixed(2))}
                stroke={t === 0 ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth={t === 0 ? 2 : 1}
          />
        );
      })}

      {/* Centre label */}
      <text x={cx} y={cy - 26} textAnchor="middle" fill="var(--muted-foreground)" fontSize="9" fontFamily="monospace">♭ FLAT</text>
      <text x={cx} y={cy - 26} textAnchor="middle" fill="var(--muted-foreground)" fontSize="9" fontFamily="monospace" dx="46">SHARP ♯</text>
      <text x={cx - 46} y={cy - 26} textAnchor="middle" fill="var(--muted-foreground)" fontSize="9" fontFamily="monospace">♭ FLAT</text>

      {/* Needle */}
      <motion.line
        x1={cx} y1={cy} 
        x2={Number(nx.toFixed(2))} y2={Number(ny.toFixed(2))}
        stroke={accent} strokeWidth="2.5" strokeLinecap="round"
        animate={{ 
          rotate: angleDeg,
          transition: { 
            type: "spring", 
            stiffness: 200, 
            damping: 20,
            mass: 1
          }
        }}
        style={{ 
          transformOrigin: `${cx}px ${cy}px`,
          filter: `drop-shadow(0 0 4px ${accent})` 
        }}
      />
      {/* Pivot */}
      <motion.circle 
        cx={cx} cy={cy} r="5" 
        animate={{ fill: accent }}
        transition={{ duration: 0.2 }}
      />
      <circle cx={cx} cy={cy} r="2.5" fill="var(--background)" />

      {/* Cents readout */}
      <motion.text 
        x={cx} y={cy + 26} textAnchor="middle"
        fontSize="13" fontFamily="monospace" fontWeight="bold"
        animate={{ fill: active ? accent : "var(--muted-foreground)" }}
        transition={{ duration: 0.2 }}
      >
        {active ? `${clampedCents > 0 ? "+" : ""}${clampedCents.toFixed(1)}¢` : "– ¢"}
      </motion.text>
    </svg>
  );
}

/* ─── LED Indicator Bar ──────────────────────────────────────────────── */
function LEDBar({ cents, active }: { cents: number; active: boolean }) {
  const LEDS = 21;          // 10 flat | centre | 10 sharp
  const mid  = Math.floor(LEDS / 2);
  const lit  = active ? Math.round((cents / 50) * mid) : null;
  const inTune = active && Math.abs(cents) < 5;

  return (
    <div style={{ display: "flex", gap: "3px", justifyContent: "center", alignItems: "center" }}>
      {Array.from({ length: LEDS }, (_, i) => {
        const pos   = i - mid;
        const isLit = lit !== null && (lit >= 0 ? pos >= 0 && pos <= lit : pos <= 0 && pos >= lit);
        const isCtr = i === mid;
        let color   = "var(--muted)";
        if (isLit || (inTune && isCtr)) {
          if (inTune)           color = "var(--primary)";
          else if (lit !== null && lit > 2)     color = "var(--destructive)";
          else if (lit !== null && lit < -2)    color = "var(--primary)";
          else                  color = "var(--accent)";
        } else if (isCtr) {
          color = "var(--muted)";
        }
        return (
          <div key={i} style={{
            width: isCtr ? 6 : 4, height: isCtr ? 14 : 10,
            borderRadius: 2, background: color,
            transition: "background 0.06s",
            boxShadow: isLit || (inTune && isCtr) ? `0 0 5px ${color}` : "none",
          }} />
        );
      })}
    </div>
  );
}

/* ─── Waveform Canvas ────────────────────────────────────────────────── */
function WaveformCanvas({ canvasRef, drawWaveform }: { canvasRef: React.RefObject<HTMLCanvasElement | null>; drawWaveform: ((ref: React.RefObject<HTMLCanvasElement | null>) => void) | null }) {
  useEffect(() => {
    if (!canvasRef.current || !drawWaveform) return;
    const interval = setInterval(() => drawWaveform(canvasRef), 50); // 20fps for canvas
    return () => clearInterval(interval);
  }, [canvasRef, drawWaveform]);

  return (
    <canvas ref={canvasRef} width={320} height={60}
      style={{ width: "100%", height: 60, borderRadius: 6, background: "var(--muted)" }}
    />
  );
}

/* ─── String Selector with Play Button ──────────────────────────────── */
function StringSelector({ targetString, onSelect, detectedNote, playingNote, onPlay, GUITAR_STRINGS }: {
  targetString: { note: string; string: number } | null;
  onSelect: (s: { note: string; string: number } | null) => void;
  detectedNote: string | null;
  playingNote: string | null;
  onPlay: (s: { note: string; string: number }) => void;
  GUITAR_STRINGS: Array<{ note: string; string: number }>;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
      {GUITAR_STRINGS.map((s) => {
        const isTarget   = targetString?.note === s.note;
        const isDetected = !targetString && detectedNote === s.note;
        const isPlaying  = playingNote === s.note;
        const active     = isTarget || isDetected;
        
        return (
          <div key={s.note} style={{ position: "relative" }}>
            <button 
              onClick={() => onSelect(isTarget ? null : s)}
              style={{
                width: "100%",
                padding: "8px 0", 
                border: "none", 
                borderRadius: 6, 
                cursor: "pointer",
                fontFamily: "monospace", 
                fontSize: 12, 
                fontWeight: "bold", 
                lineHeight: 1.3,
                background: active ? (isTarget ? "var(--primary)" : "var(--primary)") : "var(--card)",
                color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
                outline: isTarget ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                transition: "all 0.12s",
                position: "relative",
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.6 }}>{s.string}</div>
              <div>{s.note}</div>
              {isPlaying && (
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  border: "2px solid var(--primary)",
                  borderRadius: 6,
                  opacity: 0.8,
                }} />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(s);
              }}
              style={{
                position: "absolute",
                top: 2, right: 2,
                width: 20, height: 20,
                border: "none",
                borderRadius: 4,
                background: isPlaying ? "var(--primary)" : "var(--border)",
                color: isPlaying ? "var(--primary-foreground)" : "var(--muted-foreground)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                transition: "all 0.15s",
                backdropFilter: "blur(4px)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--primary)"}
              onMouseLeave={(e) => e.currentTarget.style.background = isPlaying ? "var(--primary)" : "var(--border)"}
              title="Play reference tone"
            >
              {isPlaying ? "pause" : "play"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Signal Meter ───────────────────────────────────────────────────── */
function SignalMeter({ rms }: { rms: number }) {
  const pct = Math.min(1, rms / 0.12) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: "monospace", fontSize: 10, color: "var(--muted-foreground)", width: 24 }}>SIG</span>
      <div style={{ flex: 1, height: 3, background: "var(--muted)", borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: pct > 70 ? "var(--destructive)" : "var(--primary)", borderRadius: 2, transition: "width 0.05s" }} />
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function GuitarTuner() {
  const waveCanvasRef = useRef(null);
  
  // Use the custom hook for all tuner logic
  const {
    status,
    frequency,
    note,
    cents,
    targetString,
    rms,
    playingNote,
    isInTune,
    pitchGuidance,
    showSuccess,
    isManuallyStopped,
    startTuner,
    stopTuner,
    setTargetString,
    playReferenceNote,
    drawWaveform,
    GUITAR_STRINGS,
  } = useTuner();

  const isActive    = status === "listening" && frequency !== null;
  const inTune      = isActive && isInTune;
  const tuningLabel = !isActive
    ? (isManuallyStopped ? "tuner stopped" : status === "denied" ? "mic access denied" : status === "listening" ? "play a string…" : "starting…")
    : showSuccess
      ? "✓ Perfect!"
      : inTune
        ? "in tune"
        : cents > 0 ? `${cents.toFixed(1)}¢ sharp` : `${Math.abs(cents).toFixed(1)}¢ flat`;

  const accentColor = showSuccess ? "var(--primary)" : inTune ? "var(--primary)" : isActive ? "var(--accent)" : "var(--muted-foreground)";

  return (
    <div style={{
      width: "100%", maxWidth: 360, background: "var(--card)", borderRadius: 16,
      padding: "20px 18px 18px", fontFamily: "monospace",
      boxShadow: "0 0 0 1px var(--border), 0 20px 60px rgba(0,0,0,0.6)",
      userSelect: "none",
      margin: "0 auto",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.div 
            animate={{ 
              scale: status === "listening" ? [1, 1.2, 1] : 1,
              opacity: status === "listening" ? 1 : 0.3
            }}
            transition={{ 
              duration: 2, 
              repeat: status === "listening" ? Infinity : 0,
              ease: "easeInOut"
            }}
            style={{ 
              width: 8, 
              height: 8, 
              borderRadius: "50%", 
              background: status === "listening" ? "var(--primary)" : "var(--muted-foreground)", 
              boxShadow: status === "listening" ? "0 0 6px var(--primary)" : "none" 
            }} 
          />
          <span style={{ fontSize: 11, color: "var(--muted-foreground)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Guitar Tuner</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.button
            onClick={status === "listening" ? stopTuner : startTuner}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              border: "none",
              borderRadius: 6,
              background: status === "listening" ? "var(--primary)" : isManuallyStopped ? "var(--destructive)" : "var(--muted-foreground)",
              color: status === "listening" ? "var(--primary-foreground)" : isManuallyStopped ? "var(--destructive-foreground)" : "var(--muted-foreground)",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: "bold",
              transition: "all 0.2s",
            }}
          >
            {status === "listening" ? <Pause size={14} /> : <Play size={14} />}
            {status === "listening" ? "Stop" : "Start"}
          </motion.button>
          <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>YIN</span>
        </div>
      </div>

      {/* Waveform oscilloscope */}
      <WaveformCanvas canvasRef={waveCanvasRef} drawWaveform={drawWaveform} />

      {/* Needle gauge */}
      <div style={{ margin: "8px 0 2px" }}>
        <NeedleGauge cents={cents} active={isActive} />
      </div>

      {/* LED bar */}
      <LEDBar cents={cents} active={isActive} />

      {/* Note display */}
      <div style={{ textAlign: "center", margin: "14px 0 4px" }}>
        <motion.div 
          animate={{ 
            color: accentColor,
            scale: showSuccess ? [1, 1.05, 1] : 1,
            textShadow: isActive ? `0 0 30px ${accentColor}44` : "none"
          }}
          transition={{ duration: 0.3 }}
          style={{ 
            fontSize: 64, 
            fontWeight: "bold", 
            letterSpacing: "-0.02em", 
            lineHeight: 1
          }}
        >
          {note}
        </motion.div>
        <motion.div 
          animate={{ opacity: isActive ? 1 : 0.6 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}
        >
          {isActive ? `${frequency.toFixed(2)} Hz` : "-- Hz"}
        </motion.div>
        <motion.div 
          animate={{ color: accentColor }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: 11, marginTop: 2, minHeight: 16 }}
        >
          {tuningLabel}
        </motion.div>
        
        {/* Pitch Guidance Indicator */}
        {isActive && pitchGuidance && !inTune && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ 
              fontSize: 14, 
              color: pitchGuidance === "up" ? "var(--primary)" : "var(--destructive)", 
              marginTop: 4, 
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4
            }}
          >
            <motion.span
              animate={{ y: pitchGuidance === "up" ? [-2, 2, -2] : [2, -2, 2] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {pitchGuidance === "up" ? "▲" : "▼"}
            </motion.span>
            <span>{pitchGuidance === "up" ? "Tune Up" : "Tune Down"}</span>
            <motion.span 
              style={{ fontSize: 12, opacity: 0.7 }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ({pitchGuidance === "up" ? "+" : "-"})
            </motion.span>
          </motion.div>
        )}
        
        {/* Success Message */}
        {showSuccess && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20 
            }}
            style={{ 
              fontSize: 12, 
              color: "var(--primary)", 
              marginTop: 4, 
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              ✓ Perfect pitch achieved!
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />

      {/* String selector */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: "var(--muted-foreground)", letterSpacing: "0.1em", marginBottom: 6 }}>
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