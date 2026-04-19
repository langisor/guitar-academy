"use client";

import { useState, useEffect } from "react";
import { ChordDiagram } from "./chord-diagram";
import {
  useChordKeys,
  useChordSuffixes,
  useChordRQ,
} from "@/chords/hooks/use-chord";
import { ChordKey, ChordSuffix } from "@/chords/types/chords.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Music, Grid3x3, Fingerprint, Volume2, Play } from "lucide-react";
import { useAudioPlayback } from "@/chords/hooks/use-audio";
import { useLeftHanded } from "@/chords/providers/left-handed-provider";
import { cn } from "@/lib/utils";

export default function ChordExplorer() {
  const { data: keys = [] } = useChordKeys();
  const { data: suffixes = [] } = useChordSuffixes();

  const [selectedKey, setSelectedKey] = useState<ChordKey>("C");
  const [selectedSuffix, setSelectedSuffix] = useState<ChordSuffix>("major");
  const [positionIndex, setPositionIndex] = useState(0);

  const { data: chord } = useChordRQ(selectedKey, selectedSuffix);
  const { playChord, preloadChord, isReady, setVolume, volume } = useAudioPlayback();
  const { isLeftHanded } = useLeftHanded();

  const positions = chord?.positions ?? [];
  const active = positions[positionIndex];

  const chordName = `${selectedKey}${selectedSuffix === "major" ? "" : selectedSuffix}`;
  
  // Preload chord when selection changes
  useEffect(() => {
    if (chord && isReady) {
      preloadChord(chord, positionIndex);
    }
  }, [chord, positionIndex, isReady, preloadChord]);
  
  const handlePlayChord = () => {
    if (active && isReady) {
      playChord(active, 2);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Chord Explorer</h1>
              <p className="text-sm text-muted-foreground">
                Discover guitar chords across all keys and variations
              </p>
            </div>
          </div>
        </div>

        {/* Controls Card */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Chord Selection
            </CardTitle>
            <CardDescription>
              Choose a key and chord type to view finger positions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Key Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground min-w-[3rem]">Key</span>
              <Select
                value={selectedKey}
                onValueChange={(value) => {
                  setSelectedKey(value as ChordKey);
                  setPositionIndex(0);
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {keys.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="font-mono text-lg px-3 py-1">
                {chordName}
              </Badge>
              
              {active && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handlePlayChord}
                  disabled={!isReady}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Play
                </Button>
              )}
            </div>

            <Separator />

            {/* Suffix Selector */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Type</span>
              {/* Volume Control */}
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                className="w-24 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2 pb-3">
                  {suffixes.map((s) => (
                    <Button
                      key={s}
                      variant={selectedSuffix === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedSuffix(s);
                        setPositionIndex(0);
                      }}
                      className={cn(
                        "shrink-0 transition-all",
                        selectedSuffix === s && "shadow-sm"
                      )}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Positions Grid */}
        {positions.length > 0 && (
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Fingerprint className="h-4 w-4" />
                Finger Positions
              </CardTitle>
              <CardDescription>
                {positions.length} position{positions.length !== 1 ? "s" : ""} available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {positions.map((pos, i) => (
                  <button
                    key={i}
                    onClick={() => setPositionIndex(i)}
                    className={cn(
                      "group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                      positionIndex === i
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <ChordDiagram
                      position={pos}
                      width={120}
                      height={140}
                      leftHanded={isLeftHanded}
                      className={cn(
                        "transition-all",
                        positionIndex === i ? "text-primary" : "text-foreground"
                      )}
                    />
                    <span className={cn(
                      "text-xs font-medium",
                      positionIndex === i ? "text-primary" : "text-muted-foreground"
                    )}>
                      Position {i + 1}
                    </span>
                    {positionIndex === i && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Position Detail */}
        {active && (
          <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                {chordName} — Position {positionIndex + 1} Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Base Fret</p>
                  <p className="text-2xl font-semibold">{active.baseFret}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Strings</p>
                  <p className="text-sm font-medium">
                    {active.frets.filter(f => f !== -1).length} played
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Barres</p>
                  <p className="text-sm font-medium">
                    {active.barres?.length ? active.barres.join(", ") : "None"}
                  </p>
                </div>
                {active.capo && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Capo</p>
                    <p className="text-sm font-medium text-primary">Required</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
