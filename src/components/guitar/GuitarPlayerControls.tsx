"use client"

import { memo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useGuitarEngine, StrumDirection } from "@/hooks/useGuitarEngine"

interface GuitarPlayerControlsProps {
  chordName: string
  className?: string
  showDirectionToggle?: boolean
  onReady?: (ready: boolean) => void
}

const GuitarPlayerControlsComponent = ({
  chordName,
  className,
  showDirectionToggle = true,
  onReady,
}: GuitarPlayerControlsProps) => {
  const { isReady, isLoading, error, playChord, initialize } = useGuitarEngine()

  const handlePlayDown = useCallback(async () => {
    if (!isReady) {
      await initialize()
      onReady?.(true)
    }
    await playChord(chordName, { direction: "down" })
  }, [isReady, initialize, onReady, playChord, chordName])

  const handlePlayUp = useCallback(async () => {
    if (!isReady) {
      await initialize()
      onReady?.(true)
    }
    await playChord(chordName, { direction: "up" })
  }, [isReady, initialize, onReady, playChord, chordName])

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex gap-2">
        <button
          onClick={handlePlayDown}
          disabled={isLoading}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
            "bg-green-600 text-white hover:bg-green-700 active:scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          )}
          aria-label={`Play ${chordName} with down strum`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12l7 7 7-7" />
          </svg>
          <span>Down</span>
        </button>

        {showDirectionToggle && (
          <button
            onClick={handlePlayUp}
            disabled={isLoading}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
              "border-2 border-primary text-primary hover:bg-primary/10 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label={`Play ${chordName} with up strum`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
            <span>Up</span>
          </button>
        )}
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground animate-pulse">Loading audio...</p>
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {isReady && !isLoading && (
        <p className="text-xs text-muted-foreground">
          Click to play <span className="font-medium">{chordName}</span>
        </p>
      )}
    </div>
  )
}

export const GuitarPlayerControls = memo(GuitarPlayerControlsComponent)

interface ChordDiagramWithAudioProps {
  chordName: string
  className?: string
  size?: "sm" | "md" | "lg"
  showLabels?: boolean
  showPlayButton?: boolean
}

export function ChordDiagramWithAudio({
  chordName,
  className,
  size = "md",
  showLabels = true,
  showPlayButton = true,
}: ChordDiagramWithAudioProps) {
  const { isReady, playChord, initialize } = useGuitarEngine()

  const handlePlayChord = useCallback(
    async (name: string, direction: StrumDirection) => {
      if (!isReady) {
        await initialize()
      }
      await playChord(name, { direction })
    },
    [isReady, initialize, playChord]
  )

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <ChordDiagram
        chordName={chordName}
        size={size}
        showLabels={showLabels}
        showPlayButton={showPlayButton}
        onPlayChord={handlePlayChord}
      />
    </div>
  )
}

import { ChordDiagram } from "./ChordDiagram"
