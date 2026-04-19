"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Chord, ChordPosition } from "../types/chords.types";
import { useAudioPlayback } from "../hooks/use-audio";
import { useLeftHanded } from "@/chords/providers/left-handed-provider";
import { ChordDiagram } from "./chord-diagram";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  Music,
  Zap,
  Guitar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GuitarHeroModeProps {
  chords: Array<{ chord: Chord; positionIndex: number; roman?: string }>;
  title?: string;
  autoStart?: boolean;
}

export default function GuitarHeroMode({ 
  chords, 
  title = "Guitar Hero Mode",
  autoStart = false 
}: GuitarHeroModeProps) {
  const {
    isReady,
    isPlaying,
    currentStep,
    tempo,
    volume,
    playProgression,
    stopPlayback,
    pausePlayback,
    setTempo,
    setVolume,
    playChord,
  } = useAudioPlayback();

  const [activeIndex, setActiveIndex] = useState(0);
  const [showFretboard, setShowFretboard] = useState(false);
  const { isLeftHanded } = useLeftHanded();
  const beatRef = useRef<HTMLDivElement>(null);

  // Handle step change from audio playback
  const handleStepChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Start playback
  const handlePlay = useCallback(() => {
    if (isPlaying) {
      pausePlayback();
    } else {
      playProgression(chords, handleStepChange);
    }
  }, [isPlaying, chords, playProgression, pausePlayback, handleStepChange]);

  // Stop playback
  const handleStop = useCallback(() => {
    stopPlayback();
    setActiveIndex(0);
  }, [stopPlayback]);

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && isReady && chords.length > 0) {
      playProgression(chords, handleStepChange);
    }
  }, [autoStart, isReady, chords, playProgression, handleStepChange]);

  // Get visible chords (upcoming)
  const getVisibleChords = () => {
    const visible = [];
    for (let i = 0; i < Math.min(4, chords.length); i++) {
      const idx = (activeIndex + i) % chords.length;
      visible.push({ ...chords[idx], displayIndex: i });
    }
    return visible;
  };

  if (chords.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No chords to display. Add chords to see them here.</p>
        </CardContent>
      </Card>
    );
  }

  const visibleChords = getVisibleChords();
  const currentChord = chords[activeIndex];

  return (
    <div className="space-y-4">
      {/* Main Hero Track */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {activeIndex + 1} / {chords.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chord Track */}
          <div className="relative h-48 bg-muted/30 rounded-xl border-2 border-primary/20 overflow-hidden">
            {/* Play line */}
            <div className="absolute left-20 top-0 bottom-0 w-0.5 bg-primary/40 z-10" />
            <div className="absolute left-16 top-1/2 -translate-y-1/2 z-20">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isPlaying 
                  ? "bg-primary shadow-lg shadow-primary/50 animate-pulse" 
                  : "bg-muted"
              )}>
                <Guitar className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>

            {/* Lane markers */}
            <div className="absolute inset-0 flex">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="flex-1 border-r border-muted-foreground/10 last:border-r-0"
                />
              ))}
            </div>

            {/* Chord slots */}
            <div className="absolute inset-0 flex items-center pl-32 gap-4">
              {visibleChords.map((item, i) => (
                <div
                  key={`${activeIndex}-${i}`}
                  className={cn(
                    "flex-shrink-0 w-28 transition-all duration-500",
                    i === 0 ? "scale-110" : "scale-95 opacity-60",
                    i === 0 && "-translate-x-4"
                  )}
                >
                  <div className={cn(
                    "bg-card border-2 rounded-xl p-3 shadow-sm transition-all",
                    i === 0 
                      ? "border-primary shadow-md" 
                      : "border-border"
                  )}>
                    <ChordDiagram
                      position={item.chord.positions[item.positionIndex || 0]}
                      width={80}
                      height={100}
                      leftHanded={isLeftHanded}
                      className={i === 0 ? "text-primary" : "text-muted-foreground"}
                    />
                    <div className="mt-2 text-center space-y-1">
                      <Badge 
                        variant={i === 0 ? "default" : "secondary"}
                        className="font-mono text-xs"
                      >
                        {item.chord.key}
                        {item.chord.suffix === "major" ? "" : item.chord.suffix}
                      </Badge>
                      {item.roman && (
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {item.roman}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Beat pulse */}
            {isPlaying && (
              <div 
                ref={beatRef}
                className="absolute bottom-4 right-4 flex gap-1"
              >
                {[0, 1, 2, 3].map((beat) => (
                  <div
                    key={beat}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      beat === 0 ? "bg-primary scale-125" : "bg-primary/30"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Current Chord Display */}
          {currentChord && (
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Now Playing</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{currentChord.chord.key}</span>
                  <span className="text-xl text-muted-foreground">
                    {currentChord.chord.suffix === "major" ? "" : currentChord.chord.suffix}
                  </span>
                </div>
                {currentChord.roman && (
                  <Badge variant="outline" className="mt-2 font-mono">
                    {currentChord.roman}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleStop}
              disabled={!isReady}
            >
              <Square className="h-5 w-5" />
            </Button>
            
            <Button
              size="lg"
              onClick={handlePlay}
              disabled={!isReady}
              className="w-20"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFretboard(!showFretboard)}
            >
              <Guitar className="h-4 w-4 mr-2" />
              {showFretboard ? "Hide" : "Show"} Fretboard
            </Button>
          </div>

          {/* Tempo and Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tempo</span>
                <span className="font-mono">{tempo} BPM</span>
              </div>
              <Slider
                value={[tempo]}
                onValueChange={([v]) => setTempo(v)}
                min={40}
                max={180}
                step={5}
                disabled={isPlaying}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Volume</span>
                <Volume2 className="h-4 w-4" />
              </div>
              <Slider
                value={[volume * 100]}
                onValueChange={([v]) => setVolume(v / 100)}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fretboard View */}
      {showFretboard && currentChord && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Guitar className="h-4 w-4" />
              Fretboard Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="relative">
                <ChordDiagram
                  position={currentChord.chord.positions[currentChord.positionIndex || 0]}
                  width={200}
                  height={240}
                  leftHanded={isLeftHanded}
                  className="text-primary"
                />
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-full rounded-xl border-4 border-primary/50 animate-ping" />
                  </div>
                )}
              </div>
            </div>
            
            {/* String indicators with animation */}
            <div className="mt-4 flex justify-center gap-2">
              {["E", "A", "D", "G", "B", "e"].map((string, i) => (
                <div
                  key={string}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-all",
                    isPlaying && i === (activeIndex % 6)
                      ? "bg-primary text-primary-foreground animate-bounce"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {string}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress indicator */}
      <div className="flex gap-1 h-1">
        {chords.map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-all",
              i === activeIndex 
                ? "bg-primary" 
                : i < activeIndex 
                  ? "bg-primary/40" 
                  : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}
