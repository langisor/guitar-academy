"use client"

import { Play, Pause, Plus, Minus, Volume2, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface MetronomeControlProps {
  bpm: number
  isPlaying: boolean
  currentBeat: number
  beatsPerMeasure?: number
  onBpmChange: (bpm: number) => void
  onStart: () => void
  onStop: () => void
  className?: string
}

export function MetronomeControl({
  bpm,
  isPlaying,
  currentBeat,
  beatsPerMeasure = 4,
  onBpmChange,
  onStart,
  onStop,
  className
}: MetronomeControlProps) {
  const handleSliderChange = (value: number[]) => {
    onBpmChange(value[0])
  }

  const adjustBpm = (delta: number) => {
    onBpmChange(Math.max(40, Math.min(240, bpm + delta)))
  }

  return (
    <Card className={cn("w-full max-w-sm border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden", className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Music className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest">Metronome</span>
          </div>
          <Volume2 className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* BPM Display & Controls */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-10 w-10 border-border/50"
            onClick={() => adjustBpm(-1)}
          >
            <Minus className="w-4 h-4" />
          </Button>

          <div className="text-center flex-1">
            <div className="text-6xl font-black tabular-nums tracking-tighter">{bpm}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
              Beats Per Minute
            </div>
          </div>

          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-10 w-10 border-border/50"
            onClick={() => adjustBpm(1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Beat indicators */}
        <div className="flex justify-center gap-3 mb-8">
          {Array.from({ length: beatsPerMeasure }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-150",
                isPlaying && i === currentBeat
                  ? (i === 0 ? "bg-primary shadow-[0_0_12px_rgba(var(--primary),0.5)]" : "bg-primary/60")
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* BPM Slider */}
        <div className="px-2 mb-8">
          <Slider
            value={[bpm]}
            onValueChange={handleSliderChange}
            min={40}
            max={240}
            step={1}
            className="cursor-pointer"
          />
        </div>

        {/* Play/Stop */}
        <div className="flex justify-center">
          <Button 
            onClick={isPlaying ? onStop : onStart} 
            size="lg" 
            className={cn(
              "w-full h-14 text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-95",
              isPlaying 
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-destructive/20" 
                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
            )}
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6 mr-3 fill-current" />
                STOP
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-3 fill-current" />
                START
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}