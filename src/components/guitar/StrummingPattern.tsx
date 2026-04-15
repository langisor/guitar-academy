"use client";

import { cn } from "@/lib/utils";

interface StrummingPatternProps {
  pattern: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  tempo?: number;
  showTempo?: boolean;
}

const patternSymbols = {
  'D': '↓',
  'U': '↑',
  'd': '↓',
  'u': '↑',
  'x': '×',
  '-': '·',
};

export function StrummingPattern({
  pattern,
  className,
  size = "md",
  tempo = 80,
  showTempo = false
}: StrummingPatternProps) {
  const chars = pattern.split('').filter(c => c !== ' ');
  const sizeClasses = {
    sm: "text-xl gap-1",
    md: "text-2xl gap-2",
    lg: "text-3xl gap-3",
  };

  const symbolSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {showTempo && (
        <div className="text-sm text-muted-foreground">
          {tempo} BPM
        </div>
      )}
      
      <div className={cn("flex items-center justify-center", sizeClasses[size])}>
        {chars.map((char, index) => {
          const symbol = patternSymbols[char as keyof typeof patternSymbols] || char;
          const isDown = char === 'D' || char === 'd';
          const isUp = char === 'U' || char === 'u';
          const isMuted = char === 'x';
          const isRest = char === '-';
          
          return (
            <div
              key={index}
              className={cn(
                "flex items-center justify-center rounded-full border-2 border-border",
                symbolSizes[size],
                isMuted && "bg-muted text-muted-foreground",
                isRest && "border-transparent",
                !isMuted && !isRest && (isDown ? "border-green-500 text-green-500" : "border-blue-500 text-blue-500")
              )}
            >
              <span className={cn(
                "font-mono font-bold",
                isDown && "rotate-180"
              )}>
                {symbol}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="flex gap-4 text-xs text-muted-foreground mt-2">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500">↓</div>
          <span>Down</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-500">↑</div>
          <span>Up</span>
        </div>
      </div>
    </div>
  );
}
