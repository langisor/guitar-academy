"use client";

import { cn } from "@/lib/utils";

interface ChordDiagramProps {
  chordName: string;
  fingers: number[];
  frets?: number;
  startFret?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

const chordFingerings: Record<string, number[]> = {
  'C': [0, 3, 2, 0, 1, 0],
  'D': [-1, -1, 0, 2, 3, 2],
  'Dm': [-1, -1, 0, 2, 3, 1],
  'Em': [0, 2, 2, 0, 0, 0],
  'G': [3, 2, 0, 0, 0, 3],
  'A': [0, 2, 2, 2, 0, 0],
  'Am': [0, 1, 2, 2, 0, 0],
  'E': [0, 2, 2, 1, 0, 0],
  'F': [1, 3, 3, 2, 1, 1],
  'F#m': [2, 4, 4, 3, 2, 2],
  'Bm': [-1, 2, 4, 4, 3, -1],
  'Fm': [1, 3, 3, 1, 1, 1],
  'Gm': [3, 5, 5, 3, 3, 3],
  'Cm': [-1, 3, 5, 5, 4, 3],
  'A#': [1, 3, 3, 2, 1, 1],
  'C#': [9, 11, 11, 10, 9, 9],
  'D#': [11, 13, 13, 12, 11, 11],
  'G#': [4, 6, 6, 5, 4, 4],
};

const stringNames = ['E', 'A', 'D', 'G', 'B', 'e'];
const fingerColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];

export function ChordDiagram({
  chordName,
  fingers,
  frets = 5,
  startFret = 0,
  className,
  size = "md",
  showLabels = true
}: ChordDiagramProps) {
  const fingering = fingers || chordFingerings[chordName] || Array(6).fill(0);
  const sizeClasses = {
    sm: "w-24 h-32",
    md: "w-32 h-44",
    lg: "w-40 h-56"
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {showLabels && (
        <div className="text-lg font-bold mb-2 text-foreground">{chordName}</div>
      )}
      
      <div className={cn("relative bg-background rounded-lg p-2 border-2 border-border", sizeClasses[size])}>
        {startFret > 1 && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">
            {startFret}fr
          </div>
        )}
        
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="fretPattern" width="100" height="24" patternUnits="userSpaceOnUse">
              <line x1="0" y1="24" x2="100" y2="24" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          
          {[0, 1, 2, 3, 4].map((fret) => (
            <line
              key={fret}
              x1="10"
              y1={fret * 24 + 10}
              x2="90"
              y2={fret * 24 + 10}
              stroke={fret === 0 ? "#333" : "#888"}
              strokeWidth={fret === 0 ? 3 : 1}
            />
          ))}
          
          {[0, 1, 2, 3, 4, 5].map((string) => (
            <line
              key={string}
              x1={10 + string * 16}
              y1="10"
              x2={10 + string * 16}
              y2="110"
              stroke="#666"
              strokeWidth={string === 0 || string === 5 ? 1.5 : 1}
            />
          ))}
          
          {fingering.map((fret, stringIndex) => {
            if (fret === -1) {
              return (
                <text
                  key={stringIndex}
                  x={10 + stringIndex * 16}
                  y="8"
                  textAnchor="middle"
                  className="text-[8px] fill-muted-foreground"
                >
                  ×
                </text>
              );
            }
            
            if (fret === 0) {
              return (
                <circle
                  key={stringIndex}
                  cx={10 + stringIndex * 16}
                  cy="110"
                  r="4"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              );
            }
            
            return (
              <g key={stringIndex}>
                <circle
                  cx={10 + stringIndex * 16}
                  cy={10 + (fret - 0.5) * 24}
                  r="8"
                  className={fingerColors[(fret - 1) % 4]}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
