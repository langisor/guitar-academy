"use client"

import { Play, Pause, Plus, Minus } from "lucide-react"
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

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardContent className="p-4">
        {/* BPM Display */}
        <div className="text-center mb-4">
          <div className="text-4xl font-bold tabular-nums">{bpm}</div>
          <div className="text-sm text-muted-foreground">BPM</div>
        </div>

        {/* Beat indicators */}
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: beatsPerMeasure }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full transition-all",
                isPlaying && i === currentBeat
                  ? "bg-primary scale-125"
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* BPM Slider */}
        <div className="mb-4">
          <Slider
            value={[bpm]}
            onValueChange={handleSliderChange}
            min={40}
            max={200}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>40</span>
            <span>200</span>
          </div>
        </div>

        {/* Quick BPM buttons */}
        <div className="flex justify-center gap-2 mb-4">
          {[60, 80, 100, 120].map((preset) => (
            <Button
              key={preset}
              variant={bpm === preset ? "default" : "outline"}
              size="sm"
              onClick={() => onBpmChange(preset)}
            >
              {preset}
            </Button>
          ))}
        </div>

        {/* Play/Stop */}
        <div className="flex justify-center">
          {isPlaying ? (
            <Button onClick={onStop} size="lg" variant="destructive">
              <Pause className="w-5 h-5 mr-2" />
              Stop
            </Button>
          ) : (
            <Button onClick={onStart} size="lg">
              <Play className="w-5 h-5 mr-2" />
              Start
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}