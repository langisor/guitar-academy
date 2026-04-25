"use client"

import { cn } from "@/lib/utils"

interface SimpleFretboardProps {
  highlightedFret?: number
  highlightedStrings?: number[]
  showFretNumbers?: boolean
  startFret?: number
  frets?: number
  className?: string
}

const stringNames = ["E", "A", "D", "G", "B", "e"]

export function SimpleFretboard({
  highlightedFret,
  highlightedStrings = [],
  showFretNumbers = true,
  startFret = 1,
  frets = 5,
  className
}: SimpleFretboardProps) {
  const isNut = startFret === 1

  return (
    <div className={cn("overflow-x-auto py-2", className)}>
      <div className="min-w-max">
        {/* Fret numbers */}
        {showFretNumbers && (
          <div className="flex ml-8 mb-1">
            {Array.from({ length: frets }, (_, i) => (
              <div
                key={i}
                className="w-10 text-center text-xs text-muted-foreground"
              >
                {startFret + i}
              </div>
            ))}
          </div>
        )}

        {/* Fretboard */}
        <div className="flex flex-col">
          {stringNames.map((stringName, stringIndex) => (
            <div key={stringIndex} className="flex items-center">
              {/* String label */}
              <div className="w-8 text-right pr-2 text-sm font-medium text-muted-foreground">
                {stringName}
              </div>

              {/* String line and frets */}
              <div className="flex flex-1">
                {Array.from({ length: frets }, (_, fretIndex) => {
                  const fretNum = startFret + fretIndex
                  const isHighlighted = highlightedFret === fretNum && highlightedStrings.includes(stringIndex)

                  return (
                    <div
                      key={fretIndex}
                      className={cn(
                        "w-10 h-8 flex items-center justify-center border-r border-gray-300 dark:border-gray-700 relative",
                        isHighlighted && "bg-primary/20"
                      )}
                    >
                      {/* String line */}
                      <div
                        className={cn(
                          "absolute left-2 right-2 h-0.5",
                          stringIndex < 3 ? "bg-orange-800 dark:bg-orange-300" : "bg-gray-400 dark:bg-gray-500"
                        )}
                      />

                      {/* Finger dot */}
                      {isHighlighted && (
                        <div className="w-4 h-4 rounded-full bg-primary z-10" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Nut (if starting from fret 1) */}
        {isNut && (
          <div className="flex mt-[-2rem]">
            <div className="w-8" />
            <div className="w-10 h-2 bg-gray-800 dark:bg-gray-400 rounded-sm" />
          </div>
        )}
      </div>
    </div>
  )
}

interface FretboardPosition {
  string: number
  fret: number
  finger?: number
}

interface ChordFretboardProps {
  positions?: FretboardPosition[]
  openStrings?: number[]
  muteStrings?: number[]
  barreFrets?: { fret: number; fromString: number; toString: number }[]
  startFret?: number
  className?: string
}

export function ChordFretboard({
  positions = [],
  openStrings = [],
  muteStrings = [],
  barreFrets = [],
  startFret = 1,
  className
}: ChordFretboardProps) {
  const isNut = startFret === 1

  return (
    <div className={cn("overflow-x-auto py-2", className)}>
      <div className="min-w-max">
        {/* Fret numbers */}
        <div className="flex ml-8 mb-1">
          <div className="w-10 text-center text-xs text-muted-foreground">1</div>
          <div className="w-10 text-center text-xs text-muted-foreground">2</div>
          <div className="w-10 text-center text-xs text-muted-foreground">3</div>
          <div className="w-10 text-center text-xs text-muted-foreground">4</div>
        </div>

        {/* Fretboard */}
        <div className="flex flex-col">
          {stringNames.map((stringName, stringIndex) => {
            const isMuted = muteStrings.includes(stringIndex + 1)
            const isOpen = openStrings.includes(stringIndex + 1)
            const position = positions.find(p => p.string === stringIndex + 1)

            return (
              <div key={stringIndex} className="flex items-center">
                {/* String label */}
                <div className="w-8 text-right pr-2 text-sm font-medium text-muted-foreground">
                  {isMuted ? "✕" : isOpen ? "○" : stringName}
                </div>

                {/* String/fret display */}
                <div className="flex flex-1 relative">
                  {position ? (
                    <div className="flex items-center">
                      {Array.from({ length: 4 }, (_, fretIndex) => {
                        const fretNum = startFret + fretIndex
                        const isPosition = position.fret === fretNum
                        const fingerNum = position.finger

                        return (
                          <div
                            key={fretIndex}
                            className={cn(
                              "w-10 h-10 flex items-center justify-center border-r border-gray-300 dark:border-gray-700 relative"
                            )}
                          >
                            {/* String line */}
                            <div
                              className={cn(
                                "absolute left-2 right-2 h-0.5",
                                stringIndex < 3 ? "bg-orange-800 dark:bg-orange-300" : "bg-gray-400 dark:bg-gray-500"
                              )}
                            />

                            {/* Finger dot */}
                            {isPosition && (
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                                {fingerNum && (
                                  <span className="text-white text-xs font-bold">
                                    {fingerNum}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    // Just show empty frets
                    <div className="flex">
                      {Array.from({ length: 4 }, (_, fretIndex) => (
                        <div
                          key={fretIndex}
                          className="w-10 h-10 border-r border-gray-300 dark:border-gray-700 relative"
                        >
                          <div
                            className={cn(
                              "absolute left-2 right-2 h-0.5",
                              stringIndex < 3 ? "bg-orange-800 dark:bg-orange-300" : "bg-gray-400 dark:bg-gray-500"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Nut */}
        {isNut && (
          <div className="flex mt-[-2.5rem]">
            <div className="w-8" />
            <div className="w-10 h-2 bg-gray-800 dark:bg-gray-400 rounded-sm" />
          </div>
        )}
      </div>
    </div>
  )
}