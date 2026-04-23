"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
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
    <svg viewBox="0 0 320 160" className="tuner-svg">
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
    <div className="tuner-led-bar">
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
          <div key={i} className={`tuner-led ${isCtr ? 'center' : 'side'} ${isLit || (inTune && isCtr) ? 'lit' : ''}`}
               style={{
                 background: color,
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
    <canvas ref={canvasRef} width={320} height={60} className="tuner-waveform-canvas" />
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
    <div className="tuner-string-grid">
      {GUITAR_STRINGS.map((s) => {
        const isTarget   = targetString?.note === s.note;
        const isDetected = !targetString && detectedNote === s.note;
        const isPlaying  = playingNote === s.note;
        const active     = isTarget || isDetected;
        
        return (
          <div key={s.note} className="tuner-string-wrapper">
            <Button 
              onClick={() => onSelect(isTarget ? null : s)}
              variant={active ? "default" : "outline"}
              size="default"
              className="tuner-string-button"
            >
              <div className="tuner-string-number">{s.string}</div>
              <div>{s.note}</div>
              {isPlaying && (
                <div className="tuner-playing-indicator" />
              )}
            </Button>
            <Badge
              variant={isPlaying ? "success" : "secondary"}
              onClick={(e) => {
                e.stopPropagation();
                onPlay(s);
              }}
              className="tuner-play-button cursor-pointer"
              title="Play reference tone"
            >
              {isPlaying ? "pause" : "play"}
            </Badge>
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
    <div className="tuner-signal-meter">
      <span className="tuner-signal-label">SIG</span>
      <Progress value={pct} className="tuner-signal-bar" />
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
    <Card size="sm" className="tuner-container">

      {/* Header */}
      <CardHeader>
        <div className="tuner-title-section">
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
            className={`tuner-status-indicator ${status === "listening" ? 'listening' : ''}`} 
          />
          <CardTitle className="tuner-title">Guitar Tuner</CardTitle>
        </div>
        <CardAction>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={status === "listening" ? stopTuner : startTuner}
              variant={status === "listening" ? "default" : isManuallyStopped ? "destructive" : "outline"}
              size="sm"
            >
              {status === "listening" ? <Pause size={14} /> : <Play size={14} />}
              {status === "listening" ? "Stop" : "Start"}
            </Button>
          </motion.div>
          <span className="tuner-algorithm-label">YIN</span>
        </CardAction>
      </CardHeader>

      <CardContent>
        {/* Waveform oscilloscope */}
        <WaveformCanvas canvasRef={waveCanvasRef} drawWaveform={drawWaveform} />

        {/* Needle gauge */}
        <div className="tuner-gauge-container">
          <NeedleGauge cents={cents} active={isActive} />
        </div>

        {/* LED bar */}
        <LEDBar cents={cents} active={isActive} />

        {/* Note display */}
        <div className="tuner-note-display">
        <motion.div 
          animate={{ 
            color: accentColor,
            scale: showSuccess ? [1, 1.05, 1] : 1,
            textShadow: isActive ? `0 0 30px ${accentColor}44` : "none"
          }}
          transition={{ duration: 0.3 }}
          className="tuner-note"
        >
          {note}
        </motion.div>
        <motion.div 
          animate={{ opacity: isActive ? 1 : 0.6 }}
          transition={{ duration: 0.2 }}
          className="tuner-frequency"
        >
          {isActive ? `${frequency.toFixed(2)} Hz` : "-- Hz"}
        </motion.div>
        <motion.div 
          animate={{ color: accentColor }}
          transition={{ duration: 0.2 }}
          className="tuner-tuning-label"
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
            className={`tuner-pitch-guidance ${pitchGuidance === "up" ? "up" : "down"}`}
          >
            <motion.span
              animate={{ y: pitchGuidance === "up" ? [-2, 2, -2] : [2, -2, 2] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {pitchGuidance === "up" ? "▲" : "▼"}
            </motion.span>
            <span>{pitchGuidance === "up" ? "Tune Up" : "Tune Down"}</span>
            <motion.span 
              className="tuner-pitch-hint"
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
          >
            <Alert className="tuner-success-message">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                ✓ Perfect pitch achieved!
              </motion.div>
            </Alert>
          </motion.div>
        )}
      </div>

      {/* Divider */}
      <Separator />

      {/* String selector */}
      <div className="tuner-string-section">
        <div className="tuner-string-label">
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
      </CardContent>
    </Card>
  );
}