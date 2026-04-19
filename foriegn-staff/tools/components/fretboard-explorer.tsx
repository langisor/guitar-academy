"use client";

import { useState, useMemo } from "react";
import { ChordKey, ChordPosition, ChordSuffix } from "../types/chords.types";
import { FretboardRegion, FretboardPosition } from "../types/fretboard.types";
import {
  useFretboardConfig,
  useAllVoicings,
  useVoiceLeading,
} from "../hooks/use-fretboard";
import { ChordDiagram } from "./chord-diagram";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import {
  Guitar,
  Grid3x3,
  Move,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLeftHanded } from "@/chords/providers/left-handed-provider";
import { cn } from "@/lib/utils";

const KEYS: ChordKey[] = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const SUFFIXES: ChordSuffix[] = ["major", "minor", "7", "maj7", "m7", "dim", "aug", "sus4"];

const REGIONS: FretboardRegion[] = [
  { startFret: 0, endFret: 4, startString: 0, endString: 5, name: "Open Position" },
  { startFret: 5, endFret: 8, startString: 0, endString: 5, name: "5th Position" },
  { startFret: 9, endFret: 12, startString: 0, endString: 5, name: "9th Position" },
  { startFret: 12, endFret: 15, startString: 0, endString: 5, name: "12th Position" },
];

export default function FretboardExplorer() {
  const [selectedKey, setSelectedKey] = useState<ChordKey>("C");
  const [selectedSuffix, setSelectedSuffix] = useState<string>("major");
  const [selectedRegion, setSelectedRegion] = useState<FretboardRegion>(REGIONS[0]);
  const [selectedVoicingIndex, setSelectedVoicingIndex] = useState(0);
  const [compareVoicingIndex, setCompareVoicingIndex] = useState<number | null>(null);
  const [showAllFrets, setShowAllFrets] = useState(false);
  const { isLeftHanded } = useLeftHanded();

  const { data: fretboardConfig } = useFretboardConfig(6, 24);
  const { data: voicings = [] } = useAllVoicings(
    selectedKey,
    selectedSuffix as ChordSuffix,
    showAllFrets ? 24 : 12
  );

  const selectedVoicing = voicings[selectedVoicingIndex]?.position;
  const compareVoicing = compareVoicingIndex !== null ? voicings[compareVoicingIndex]?.position : null;

  const { data: voiceLeading } = useVoiceLeading(
    selectedVoicing || null,
    compareVoicing || null
  );

  const filteredVoicings = useMemo(() => {
    if (showAllFrets) return voicings;

    return voicings.filter((v) => {
      const frets = v.position.frets.filter((f) => f >= 0);
      return frets.every(
        (f) => f >= selectedRegion.startFret && f <= selectedRegion.endFret
      );
    });
  }, [voicings, selectedRegion, showAllFrets]);

  const handleSelectVoicing = (index: number) => {
    if (selectedVoicingIndex === index) return;
    setCompareVoicingIndex(selectedVoicingIndex);
    setSelectedVoicingIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Guitar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Fretboard Explorer</h1>
              <p className="text-sm text-muted-foreground">
                Visualize all chord positions across the fretboard
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Chord Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Key</span>
                <Select value={selectedKey} onValueChange={(v) => setSelectedKey(v as ChordKey)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KEYS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Type</span>
                <Select
                  value={selectedSuffix}
                  onValueChange={setSelectedSuffix}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUFFIXES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Region</span>
                <Select
                  value={selectedRegion.name}
                  onValueChange={(v) => {
                    const region = REGIONS.find((r) => r.name === v);
                    if (region) setSelectedRegion(region);
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r.name} value={r.name}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Toggle
                pressed={showAllFrets}
                onPressedChange={setShowAllFrets}
                className="ml-auto"
              >
                <Layers className="h-4 w-4 mr-2" />
                Show All
              </Toggle>
            </div>

            <Badge variant="secondary" className="font-mono text-lg px-3 py-1">
              {selectedKey}
              {selectedSuffix === "major" ? "" : selectedSuffix}
            </Badge>
          </CardContent>
        </Card>

        {/* Fretboard Grid Visualization */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Move className="h-4 w-4" />
              Fretboard Positions ({filteredVoicings.length} found)
            </CardTitle>
            <CardDescription>
              Click a position to select, click another to compare voice leading
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredVoicings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No voicings found in this region for {selectedKey} {selectedSuffix}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredVoicings.map((voicing, idx) => {
                  const actualIndex = voicings.indexOf(voicing);
                  const isSelected = selectedVoicingIndex === actualIndex;
                  const isCompare = compareVoicingIndex === actualIndex;

                  return (
                    <button
                      key={`${actualIndex}-${voicing.position.frets.join(",")}`}
                      onClick={() => handleSelectVoicing(actualIndex)}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : isCompare
                          ? "border-secondary bg-secondary/10"
                          : "border-border bg-card hover:border-primary/30"
                      )}
                    >
                      <ChordDiagram
                        position={voicing.position}
                        width={100}
                        height={120}
                        leftHanded={isLeftHanded}
                        className={cn(
                          "transition-all",
                          isSelected ? "text-primary" : "text-foreground"
                        )}
                      />

                      <div className="flex flex-col items-center gap-1 w-full">
                        <span className="text-xs font-medium">
                          Fret {voicing.analysis.fingering.lowestFret}
                        </span>
                        <div className="flex gap-1 flex-wrap justify-center">
                          {voicing.analysis.rootPosition && (
                            <Badge variant="outline" className="text-[10px] h-4">
                              Root
                            </Badge>
                          )}
                          {voicing.analysis.fingering.difficulty === "easy" && (
                            <Badge variant="secondary" className="text-[10px] h-4">
                              Easy
                            </Badge>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
                      )}
                      {isCompare && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-secondary" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice Leading Analysis */}
        {voiceLeading && compareVoicing && (
          <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                Voice Leading Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Distance
                  </p>
                  <p className="text-2xl font-semibold">{voiceLeading.distance}</p>
                  <p className="text-xs text-muted-foreground">
                    Total fret movement
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Common Tones
                  </p>
                  <p className="text-2xl font-semibold">{voiceLeading.commonTones}</p>
                  <p className="text-xs text-muted-foreground">
                    Shared notes
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Smoothness
                  </p>
                  <p className="text-2xl font-semibold">
                    {Math.round(voiceLeading.smoothness * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Voice leading quality
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Recommended
                  </p>
                  <p className={cn(
                    "text-2xl font-semibold",
                    voiceLeading.recommended ? "text-primary" : "text-muted-foreground"
                  )}>
                    {voiceLeading.recommended ? "Yes" : "No"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For smooth transition
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fretboard Note Grid */}
        {fretboardConfig && (
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Fretboard Map</CardTitle>
              <CardDescription>
                All notes on the fretboard for reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="grid grid-cols-[auto_repeat(13,1fr)] gap-1 text-xs">
                    {/* Header - Frets */}
                    <div className="p-2"></div>
                    {Array.from({ length: 13 }, (_, i) => (
                      <div key={i} className="p-2 text-center font-mono text-muted-foreground">
                        {i}
                      </div>
                    ))}

                    {/* Strings */}
                    {fretboardConfig.notes.map((stringNotes, stringIdx) => {
                      // For left-handed, reverse the order of strings (show high e first)
                      const visualStringIdx = isLeftHanded ? 5 - stringIdx : stringIdx;
                      const reversedNotes = isLeftHanded
                        ? [...stringNotes].reverse()
                        : stringNotes;
                      return (
                      <div key={stringIdx} className="contents">
                        <div className="p-2 font-mono text-muted-foreground">
                          {["E", "A", "D", "G", "B", "e"][visualStringIdx]}
                        </div>
                        {reversedNotes.slice(0, 13).map((note, fretIdx) => {
                          const isInRegion =
                            !showAllFrets &&
                            fretIdx >= selectedRegion.startFret &&
                            fretIdx <= selectedRegion.endFret;

                          return (
                            <div
                              key={fretIdx}
                              className={cn(
                                "p-2 text-center rounded transition-colors",
                                isInRegion && "bg-primary/10 font-medium",
                                note.fret === 0 && "bg-muted font-medium"
                              )}
                            >
                              {note.note}
                            </div>
                          );
                        })}
                      </div>
                    );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
