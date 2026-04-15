"use client"

import { memo, useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface NotePosition {
  string: number
  fret: number
  note?: string
  finger?: number
}

interface InteractiveFretboardProps {
  strings?: number
  frets?: number
  startFret?: number
  notes?: NotePosition[]
  leftHandMode?: boolean
  showNoteNames?: boolean
  showFingerNumbers?: boolean
  onNoteClick?: (string: number, fret: number, note?: string) => void
  onStringHover?: (string: number | null) => void
  className?: string
  highlightedStrings?: number[]
}

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const openNotesRight = ['E', 'A', 'D', 'G', 'B', 'e']
const openNotesLeft = ['e', 'B', 'G', 'D', 'A', 'E']

const fingerColors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
]

function getNoteAtFret(openNote: string, fret: number): string {
  const openIndex = noteNames.indexOf(openNote.replace(/[0-9]/g, ''))
  if (openIndex === -1) return ''
  const normalizedFret = ((openIndex + fret) % 12 + 12) % 12
  return noteNames[normalizedFret]
}

const InteractiveFretboardComponent = ({
  strings = 6,
  frets = 5,
  startFret = 0,
  notes = [],
  leftHandMode = false,
  showNoteNames = true,
  showFingerNumbers = true,
  onNoteClick,
  onStringHover,
  className,
  highlightedStrings = [],
}: InteractiveFretboardProps) => {
  const [hoveredFret, setHoveredFret] = useState<{ string: number; fret: number } | null>(null)
  const [hoveredString, setHoveredString] = useState<number | null>(null)

  const stringNames = leftHandMode ? openNotesLeft : openNotesRight

  const noteAtPosition = useCallback(
    (stringIndex: number, fret: number) => {
      return getNoteAtFret(openNotesRight[stringIndex], fret)
    },
    []
  )

  const isStringHighlighted = useCallback(
    (stringIndex: number) => {
      return highlightedStrings.includes(leftHandMode ? 5 - stringIndex : stringIndex)
    },
    [highlightedStrings, leftHandMode]
  )

  const handleFretClick = useCallback(
    (stringIndex: number, fret: number) => {
      const note = noteAtPosition(stringIndex, fret)
      onNoteClick?.(stringIndex, fret, note)
    },
    [onNoteClick, noteAtPosition]
  )

  const handleStringHover = useCallback(
    (stringIndex: number | null) => {
      setHoveredString(stringIndex)
      onStringHover?.(stringIndex)
    },
    [onStringHover]
  )

  const svgWidth = 120
  const svgHeight = frets * 40 + 30
  const leftMargin = 30
  const topMargin = 20

  const renderedStrings = useMemo(() => {
    const arr = []
    for (let i = 0; i < strings; i++) {
      const actualString = leftHandMode ? strings - 1 - i : i
      arr.push(actualString)
    }
    return arr
  }, [strings, leftHandMode])

  return (
    <div
      className={cn('select-none', className)}
      role="application"
      aria-label={`Guitar fretboard, ${leftHandMode ? 'left-handed' : 'right-handed'} view`}
    >
      <svg
        viewBox={`0 0 ${svgWidth + leftMargin * 2} ${svgHeight + topMargin * 2}`}
        className="w-full h-auto transition-transform duration-300 ease-in-out"
        style={{ maxHeight: '300px' }}
      >
        <defs>
          <pattern id="fretboard-grain" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#8B4513" />
            <line x1="0" y1="0" x2="4" y2="0" stroke="#7a3c10" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect
          x={leftMargin}
          y={topMargin}
          width={svgWidth}
          height={svgHeight}
          fill="url(#fretboard-grain)"
          rx="4"
        />

        {startFret > 1 && (
          <text
            x={leftMargin + svgWidth / 2}
            y={topMargin - 5}
            textAnchor="middle"
            className="fill-muted-foreground text-xs font-bold"
          >
            {startFret}fr
          </text>
        )}

        {[0, 1, 2, 3, 5, 7, 9, 12].map((dot) => {
          const fretIndex = dot - startFret
          if (fretIndex < 0 || fretIndex > frets) return null
          const x = leftMargin + (fretIndex + 0.5) * (svgWidth / frets)
          if (dot === 12) {
            return (
              <g key={dot}>
                <circle cx={x} cy={topMargin + svgHeight / 3} r="4" fill="#d4a574" />
                <circle cx={x} cy={topMargin + (svgHeight * 2) / 3} r="4" fill="#d4a574" />
              </g>
            )
          }
          return <circle key={dot} cx={x} cy={topMargin + svgHeight / 2} r="4" fill="#d4a574" />
        })}

        {Array.from({ length: frets + 1 }).map((_, fretIndex) => (
          <line
            key={`fret-${fretIndex}`}
            x1={leftMargin + fretIndex * (svgWidth / frets)}
            y1={topMargin}
            x2={leftMargin + fretIndex * (svgWidth / frets)}
            y2={topMargin + svgHeight}
            stroke={fretIndex === 0 ? '#333' : '#888'}
            strokeWidth={fretIndex === 0 ? 4 : 3}
          />
        ))}

        {renderedStrings.map((stringIndex, visualIndex) => {
          const isHighString = stringIndex >= 4
          const strokeWidth = isHighString ? 1 : stringIndex === 0 || stringIndex === 5 ? 2 : 1.5
          const isHighlighted = isStringHighlighted(stringIndex)
          const isHovered = hoveredString === stringIndex

          return (
            <line
              key={`string-${stringIndex}`}
              x1={leftMargin}
              y1={topMargin + visualIndex * (svgHeight / (strings - 1))}
              x2={leftMargin + svgWidth}
              y2={topMargin + visualIndex * (svgHeight / (strings - 1))}
              stroke={isHighlighted || isHovered ? '#ef4444' : '#888'}
              strokeWidth={strokeWidth}
              className="transition-colors duration-200 cursor-pointer"
              onMouseEnter={() => handleStringHover(stringIndex)}
              onMouseLeave={() => handleStringHover(null)}
              style={{ filter: isHighlighted ? 'drop-shadow(0 0 4px #ef4444)' : 'none' }}
            />
          )
        })}

        {notes.map((note, idx) => {
          const visualStringIndex = renderedStrings.indexOf(note.string)
          if (visualStringIndex === -1) return null

          const x = leftMargin + (note.fret - 0.5 + 0.5) * (svgWidth / frets)
          const y = topMargin + visualStringIndex * (svgHeight / (strings - 1))

          return (
            <g
              key={`note-${idx}`}
              onClick={() => handleFretClick(note.string, note.fret)}
              onMouseEnter={() => setHoveredFret({ string: note.string, fret: note.fret })}
              onMouseLeave={() => setHoveredFret(null)}
              className="cursor-pointer"
              role="button"
              aria-label={`Note ${note.note || getNoteAtFret(openNotesRight[note.string], note.fret)} at string ${note.string}, fret ${note.fret}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleFretClick(note.string, note.fret)
                }
              }}
            >
              <circle
                cx={x}
                cy={y}
                r="10"
                fill={fingerColors[(note.finger || 1) - 1]}
                stroke="#fff"
                strokeWidth="2"
                className="transition-all duration-200 hover:scale-110"
                style={{
                  filter:
                    hoveredFret?.string === note.string && hoveredFret?.fret === note.fret
                      ? 'drop-shadow(0 0 8px currentColor)'
                      : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                }}
              />
              {showFingerNumbers && note.finger && (
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  className="fill-white text-xs font-bold pointer-events-none select-none"
                >
                  {note.finger}
                </text>
              )}
              {showNoteNames && note.note && !showFingerNumbers && (
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  className="fill-white text-xs font-bold pointer-events-none select-none"
                >
                  {note.note}
                </text>
              )}
            </g>
          )
        })}

        {renderedStrings.map((stringIndex, visualIndex) => (
          <text
            key={`label-${stringIndex}`}
            x={leftMargin - 10}
            y={topMargin + visualIndex * (svgHeight / (strings - 1)) + 4}
            textAnchor="end"
            className="fill-muted-foreground text-sm font-medium"
          >
            {stringNames[stringIndex]}
          </text>
        ))}
      </svg>

      {hoveredFret && (
        <div className="absolute top-2 right-2 bg-background/90 px-2 py-1 rounded text-sm shadow-md">
          {getNoteAtFret(openNotesRight[hoveredFret.string], hoveredFret.fret)} - String{' '}
          {hoveredFret.string + 1}, Fret {hoveredFret.fret}
        </div>
      )}
    </div>
  )
}

export const InteractiveFretboard = memo(InteractiveFretboardComponent)
