"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FretboardProps {
  highlightedNotes?: string[];
  highlightedFrets?: { string: number; fret: number }[];
  showNoteNames?: boolean;
  showFretNumbers?: boolean;
  className?: string;
  frets?: number;
  startFret?: number;
  onNoteClick?: (string: number, fret: number) => void;
}

const stringNames = ['E', 'A', 'D', 'G', 'B', 'e'];
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getNoteAtFret(openNote: string, fret: number): string {
  const openIndex = noteNames.indexOf(openNote);
  return noteNames[(openIndex + fret) % 12];
}

export function Fretboard({
  highlightedNotes = [],
  highlightedFrets = [],
  showNoteNames = true,
  showFretNumbers = false,
  className,
  frets = 12,
  startFret = 0,
  onNoteClick
}: FretboardProps) {
  const [hoveredNote, setHoveredNote] = useState<{ string: number; fret: number } | null>(null);
  
  const openNotes = ['E', 'A', 'D', 'G', 'B', 'e'];
  const stringTuning = ['E', 'A', 'D', 'G', 'B', 'e'];

  const isHighlighted = (stringIndex: number, fret: number) => {
    const note = getNoteAtFret(openNotes[stringIndex], fret);
    return highlightedNotes.includes(note);
  };

  const isFretHighlighted = (string: number, fret: number) => {
    return highlightedFrets.some(h => h.string === string && h.fret === fret);
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="min-w-[600px]">
        <div className="flex">
          <div className="flex flex-col gap-0 pr-2 pt-6">
            {stringNames.map((name, i) => (
              <div 
                key={i} 
                className="h-8 flex items-center text-sm text-muted-foreground font-medium"
              >
                {name}
              </div>
            ))}
          </div>
          
          <div className="flex-1 relative">
            {showFretNumbers && (
              <div className="flex">
                {Array.from({ length: frets + 1 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-6 flex items-center justify-center text-xs text-muted-foreground"
                  >
                    {i === 0 ? 'O' : startFret + i}
                  </div>
                ))}
              </div>
            )}
            
            <div className="relative">
              <svg
                viewBox={`0 0 ${(frets + 1) * 50 + 20} 200`}
                className="w-full h-auto"
                style={{ height: '200px' }}
              >
                {Array.from({ length: frets + 1 }, (_, fret) => (
                  <line
                    key={`fret-${fret}`}
                    x1={fret * 50 + 10}
                    y1="10"
                    x2={fret * 50 + 10}
                    y2="190"
                    stroke={fret === 0 ? "#333" : "#888"}
                    strokeWidth={fret === 0 ? 4 : [3, 5, 7, 9, 12].includes(fret) ? 3 : 1}
                  />
                ))}
                
                {[0, 1, 2, 3, 4, 5].map((string) => (
                  <line
                    key={`string-${string}`}
                    x1="10"
                    y1={10 + string * 30}
                    x2={(frets + 1) * 50 + 10}
                    y2={10 + string * 30}
                    stroke="#888"
                    strokeWidth={[0, 5].includes(string) ? 2 : string < 3 ? 1.5 : 1}
                  />
                ))}
                
                {[3, 5, 7, 9, 12].map((fret) => (
                  fret <= frets && (
                    <circle
                      key={`dot-${fret}`}
                      cx={fret * 50 + 35}
                      cy="100"
                      r="4"
                      fill="#888"
                    />
                  )
                ))}
                
                {[12].map((fret) => (
                  fret <= frets && (
                    <g key={`dots-${fret}`}>
                      <circle cx={fret * 50 + 35} cy="50" r="4" fill="#888" />
                      <circle cx={fret * 50 + 35} cy="150" r="4" fill="#888" />
                    </g>
                  )
                ))}
                
                {Array.from({ length: 6 }, (_, stringIndex) =>
                  Array.from({ length: frets + 1 }, (_, fretIndex) => {
                    const note = getNoteAtFret(openNotes[stringIndex], fretIndex);
                    const highlighted = isHighlighted(stringIndex, fretIndex);
                    const fretHighlighted = isFretHighlighted(stringIndex, fretIndex);
                    
                    if (!highlighted && !fretHighlighted) return null;
                    
                    return (
                      <g
                        key={`highlight-${stringIndex}-${fretIndex}`}
                        onClick={() => onNoteClick?.(stringIndex, fretIndex)}
                        onMouseEnter={() => setHoveredNote({ string: stringIndex, fret: fretIndex })}
                        onMouseLeave={() => setHoveredNote(null)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={fretIndex * 50 + 35}
                          cy={10 + stringIndex * 30}
                          r="12"
                          fill={fretHighlighted ? "#ef4444" : "#22c55e"}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        {showNoteNames && (
                          <text
                            x={fretIndex * 50 + 35}
                            y={14 + stringIndex * 30}
                            textAnchor="middle"
                            className="fill-white text-xs font-bold pointer-events-none"
                          >
                            {note}
                          </text>
                        )}
                      </g>
                    );
                  })
                )}
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex mt-2 pl-8">
          <div className="flex gap-[50px] text-xs text-muted-foreground">
            {Array.from({ length: frets + 1 }, (_, i) => (
              <div key={i} className="w-[50px] text-center">
                {i === 0 ? 'Open' : `${startFret + i}`}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
