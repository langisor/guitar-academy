"use client"

import { memo, useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useLeftHandMode } from '@/hooks/useLeftHandMode'
import { ChordData, getChordByName, chordList } from '@/data/chords'

interface FingerPosition {
  string: number
  fret: number
  finger: number
}

interface ChordDiagramProps {
  chordName?: string
  chordData?: ChordData
  fingers?: FingerPosition[] | number[]
  openStrings?: number[]
  muteStrings?: number[]
  frets?: number
  startFret?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  showFingerNumbers?: boolean
  interactive?: boolean
  onFretClick?: (string: number, fret: number) => void
  onChordSelect?: (chordName: string) => void
  highlightedFret?: { string: number; fret: number } | null
}

function convertLegacyFingers(fingers: number[]): FingerPosition[] {
  return fingers
    .map((fret, idx) => {
      if (fret <= 0) return null
      return { string: idx, fret, finger: Math.ceil((idx + 1) / 2) }
    })
    .filter((f): f is FingerPosition => f !== null)
}

const fingerColors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
]

const sizeConfig = {
  sm: { width: 100, height: 120, circleR: 6, strokeW: 1, textSize: 6 },
  md: { width: 140, height: 160, circleR: 9, strokeW: 1.5, textSize: 8 },
  lg: { width: 180, height: 200, circleR: 12, strokeW: 2, textSize: 10 },
}

const ChordDiagramComponent = ({
  chordName,
  chordData: providedChordData,
  fingers: providedFingers,
  openStrings: providedOpenStrings,
  muteStrings: providedMuteStrings,
  frets: providedFrets,
  startFret: providedStartFret,
  className,
  size = 'md',
  showLabels = true,
  showFingerNumbers = true,
  interactive = false,
  onFretClick,
  onChordSelect,
  highlightedFret,
}: ChordDiagramProps) => {
  const { leftHandMode, getStringNames } = useLeftHandMode()
  const [hoveredFret, setHoveredFret] = useState<{ string: number; fret: number } | null>(null)

  const chordData = useMemo(() => {
    if (providedChordData) return providedChordData
    if (chordName) return getChordByName(chordName)
    return undefined
  }, [chordName, providedChordData])

  const fingers = useMemo(() => {
    if (providedFingers) {
      if (Array.isArray(providedFingers) && typeof providedFingers[0] === 'number') {
        return convertLegacyFingers(providedFingers as number[])
      }
      return providedFingers as FingerPosition[]
    }
    return chordData?.fingers || []
  }, [chordData, providedFingers])

  const openStrings = useMemo(() => {
    if (providedOpenStrings) return providedOpenStrings
    if (Array.isArray(providedFingers) && typeof providedFingers[0] === 'number') {
      const legacyFingers = providedFingers as number[]
      return legacyFingers
        .map((f, idx) => (f === 0 ? idx + 1 : null))
        .filter((s): s is number => s !== null)
    }
    return chordData?.openStrings || []
  }, [chordData, providedFingers, providedOpenStrings])

  const muteStrings = useMemo(() => {
    if (providedMuteStrings) return providedMuteStrings
    if (Array.isArray(providedFingers) && typeof providedFingers[0] === 'number') {
      const legacyFingers = providedFingers as number[]
      return legacyFingers
        .map((f, idx) => (f === -1 ? idx + 1 : null))
        .filter((s): s is number => s !== null)
    }
    return chordData?.muteStrings || []
  }, [chordData, providedFingers, providedMuteStrings])

  const startFret = providedStartFret ?? chordData?.startFret ?? 0
  const frets = providedFrets ?? 5

  const config = sizeConfig[size]
  const stringNames = getStringNames()

  const mirroredFingers = useMemo(() => {
    if (!leftHandMode) return fingers
    return fingers.map((f) => ({
      ...f,
      string: 5 - f.string,
    }))
  }, [fingers, leftHandMode])

  const handleFretClick = useCallback(
    (stringIndex: number, fret: number) => {
      onFretClick?.(stringIndex, fret)
    },
    [onFretClick]
  )

  const svgWidth = config.width
  const svgHeight = config.height
  const marginLeft = 20
  const marginTop = startFret > 1 ? 15 : 10
  const fretSpacing = (svgHeight - marginTop) / (frets + 1)
  const stringSpacing = (svgWidth - marginLeft * 2) / 5

  const isHighlighted = useCallback(
    (stringIndex: number, fretIndex: number) => {
      return (
        highlightedFret?.string === stringIndex && highlightedFret?.fret === fretIndex
      )
    },
    [highlightedFret]
  )

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {showLabels && (
        <div className="text-lg font-bold mb-2 text-foreground">
          {chordData?.name || chordName || 'Chord'}
        </div>
      )}

      <div
        className={cn(
          'relative bg-background rounded-lg p-2 border-2 border-border transition-transform duration-300 ease-in-out',
          leftHandMode && 'scale-x-[-1]'
        )}
        style={{ width: svgWidth, height: svgHeight }}
        role="img"
        aria-label={`Chord diagram for ${chordData?.name || chordName || 'unknown chord'}, ${
          leftHandMode ? 'left-handed' : 'right-handed'
        } view`}
      >
        {startFret > 1 && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">
            {startFret}fr
          </div>
        )}

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="fretGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a67c52" />
              <stop offset="100%" stopColor="#8b5a2b" />
            </linearGradient>
          </defs>

          {Array.from({ length: frets + 1 }).map((_, fretIndex) => (
            <line
              key={`fret-${fretIndex}`}
              x1={marginLeft}
              y1={marginTop + fretIndex * fretSpacing}
              x2={svgWidth - marginLeft}
              y2={marginTop + fretIndex * fretSpacing}
              stroke={fretIndex === 0 ? '#333' : '#888'}
              strokeWidth={fretIndex === 0 ? config.strokeW * 2 : config.strokeW}
            />
          ))}

          {Array.from({ length: 6 }).map((_, stringIndex) => (
            <line
              key={`string-${stringIndex}`}
              x1={marginLeft + stringIndex * stringSpacing}
              y1={marginTop}
              x2={marginLeft + stringIndex * stringSpacing}
              y2={marginTop + frets * fretSpacing}
              stroke="#666"
              strokeWidth={stringIndex === 0 || stringIndex === 5 ? config.strokeW * 1.2 : config.strokeW * 0.7}
              className="transition-colors duration-200"
            />
          ))}

          {muteStrings.map((string) => (
            <g key={`mute-${string}`}>
              <line
                x1={marginLeft + (string - 1) * stringSpacing - 4}
                y1={marginTop - 8}
                x2={marginLeft + (string - 1) * stringSpacing + 4}
                y2={marginTop - 2}
                stroke="#333"
                strokeWidth={2}
              />
              <line
                x1={marginLeft + (string - 1) * stringSpacing - 4}
                y1={marginTop - 2}
                x2={marginLeft + (string - 1) * stringSpacing + 4}
                y2={marginTop - 8}
                stroke="#333"
                strokeWidth={2}
              />
            </g>
          ))}

          {openStrings.map((string) => (
            <circle
              key={`open-${string}`}
              cx={marginLeft + (string - 1) * stringSpacing}
              cy={marginTop + frets * fretSpacing + 8}
              r={config.circleR * 0.6}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={2}
            />
          ))}

          {mirroredFingers.map((finger, idx) => {
            const x = marginLeft + finger.string * stringSpacing
            const y = marginTop + (finger.fret - 0.5) * fretSpacing
            const isHov = hoveredFret?.string === finger.string && hoveredFret?.fret === finger.fret
            const isHl = isHighlighted(finger.string, finger.fret)

            return (
              <g
                key={`finger-${idx}`}
                onClick={() => handleFretClick(finger.string, finger.fret)}
                onMouseEnter={() => setHoveredFret({ string: finger.string, fret: finger.fret })}
                onMouseLeave={() => setHoveredFret(null)}
                className={cn('cursor-pointer', interactive && 'cursor-pointer')}
                role={interactive ? 'button' : undefined}
                tabIndex={interactive ? 0 : undefined}
                onKeyDown={
                  interactive
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleFretClick(finger.string, finger.fret)
                        }
                      }
                    : undefined
                }
                aria-label={
                  interactive
                    ? `Finger ${finger.finger} at string ${finger.string}, fret ${finger.fret}`
                    : undefined
                }
              >
                <circle
                  cx={x}
                  cy={y}
                  r={config.circleR + (isHov ? 2 : 0)}
                  className={cn(
                    fingerColors[(finger.finger - 1) % 5],
                    'transition-all duration-200',
                    isHl && 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  )}
                  stroke={isHl ? '#ef4444' : '#fff'}
                  strokeWidth={isHl ? 3 : 2}
                  style={{
                    filter: isHov ? 'drop-shadow(0 0 6px currentColor)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  }}
                />
                {showFingerNumbers && (
                  <text
                    x={x}
                    y={y + config.textSize / 2}
                    textAnchor="middle"
                    className="fill-white font-bold pointer-events-none select-none"
                    style={{ fontSize: config.textSize }}
                  >
                    {finger.finger}
                  </text>
                )}
              </g>
            )
          })}

          {stringNames.map((name, idx) => (
            <text
              key={`string-label-${idx}`}
              x={marginLeft + idx * stringSpacing}
              y={marginTop - 5}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px] font-medium"
            >
              {name}
            </text>
          ))}
        </svg>

        {hoveredFret && interactive && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-0.5 rounded text-xs whitespace-nowrap">
            String {hoveredFret.string + 1} · Fret {hoveredFret.fret}
          </div>
        )}
      </div>

      {interactive && chordList.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1 justify-center max-w-xs">
          {chordList.map((chord) => (
            <button
              key={chord.name}
              onClick={() => onChordSelect?.(chord.name)}
              className={cn(
                'px-2 py-1 text-xs rounded border transition-colors',
                (chordData?.name === chord.name)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted border-border'
              )}
              aria-pressed={chordData?.name === chord.name}
            >
              {chord.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const ChordDiagram = memo(ChordDiagramComponent)

interface LeftHandToggleProps {
  className?: string
}

export function LeftHandToggle({ className }: LeftHandToggleProps) {
  const { leftHandMode, toggleLeftHandMode } = useLeftHandMode()

  return (
    <button
      onClick={toggleLeftHandMode}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200',
        leftHandMode
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background hover:bg-muted border-border',
        className
      )}
      aria-pressed={leftHandMode}
      aria-label={`Left hand mode ${leftHandMode ? 'enabled' : 'disabled'}`}
    >
      <span className="text-lg" aria-hidden="true">
        {leftHandMode ? '🤚' : '✋'}
      </span>
      <span className="text-sm font-medium">
        {leftHandMode ? 'Left Hand' : 'Right Hand'}
      </span>
      <span
        className={cn(
          'w-8 h-4 rounded-full relative transition-colors duration-200',
          leftHandMode ? 'bg-primary-foreground/30' : 'bg-muted-foreground/30'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200',
            leftHandMode ? 'left-4' : 'left-0.5'
          )}
        />
      </span>
    </button>
  )
}
