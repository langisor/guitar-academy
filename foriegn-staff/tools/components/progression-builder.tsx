"use client";

import { useState, useEffect } from "react";
import { ChordKey } from "../types/chords.types";
import { ScaleMode, ChordProgression, ProgressionStep, SuggestionResult } from "../types/progression.types";
import {
  useGenerateFromString,
  useChordSuggestions,
  useCommonProgressions,
  useGenerateCommonProgression,
  useHarmonizedScale,
  useSecondaryDominants,
  useBorrowedChords,
} from "../hooks/use-progression";
import { ChordDiagram } from "./chord-diagram";
import { useLeftHanded } from "@/chords/providers/left-handed-provider";
import { useAudioPlayback } from "../hooks/use-audio";
import GuitarHeroMode from "./guitar-hero-mode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Music,
  ArrowRight,
  Lightbulb,
  RotateCcw,
  ChevronRight,
  Sparkles,
  BookOpen,
  Zap,
  Play,
  Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const KEYS: ChordKey[] = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const MODES: { value: ScaleMode; label: string }[] = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Natural Minor" },
  { value: "harmonicMinor", label: "Harmonic Minor" },
  { value: "dorian", label: "Dorian" },
  { value: "mixolydian", label: "Mixolydian" },
];

const ROMAN_BUTTONS = [
  { numeral: "I", display: "I", type: "major" },
  { numeral: "ii", display: "ii", type: "minor" },
  { numeral: "iii", display: "iii", type: "minor" },
  { numeral: "IV", display: "IV", type: "major" },
  { numeral: "V", display: "V", type: "major" },
  { numeral: "vi", display: "vi", type: "minor" },
  { numeral: "vii°", display: "vii°", type: "dim" },
];

export default function ProgressionBuilder() {
  const [selectedKey, setSelectedKey] = useState<ChordKey>("C");
  const [selectedMode, setSelectedMode] = useState<ScaleMode>("major");
  const { isLeftHanded } = useLeftHanded();
  const [progression, setProgression] = useState<ChordProgression | null>(null);
  const [numeralInput, setNumeralInput] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showGuitarHero, setShowGuitarHero] = useState(false);
  
  const { preloadChord, isReady } = useAudioPlayback();

  const generateMutation = useGenerateFromString();
  const commonProgressions = useCommonProgressions();
  const generateCommon = useGenerateCommonProgression();

  const currentSteps = progression?.steps || [];
  const { data: suggestions = [] } = useChordSuggestions(
    selectedKey,
    selectedMode,
    currentSteps,
    showSuggestions ? 5 : 0
  );

  const { data: scaleHarmony = [] } = useHarmonizedScale(selectedKey, selectedMode);
  const { data: secondaryDominants = [] } = useSecondaryDominants(selectedKey, selectedMode);
  const { data: borrowedChords = [] } = useBorrowedChords(selectedKey, selectedMode);

  const handleAddNumeral = async (numeral: string) => {
    const newNumerals = numeralInput ? `${numeralInput} ${numeral}` : numeral;
    setNumeralInput(newNumerals);

    const result = await generateMutation.mutateAsync({
      key: selectedKey,
      mode: selectedMode,
      input: newNumerals,
    });

    if (result) {
      setProgression(result);
    }
  };

  const handleLoadCommon = async (name: string) => {
    const result = await generateCommon.mutateAsync({
      key: selectedKey,
      mode: selectedMode,
      progressionName: name,
    });

    if (result) {
      setProgression(result);
      setNumeralInput(result.steps.map((s) => s.roman.display).join(" "));
    }
  };

  const handleClear = () => {
    setProgression(null);
    setNumeralInput("");
    setShowGuitarHero(false);
  };
  
  // Preload chords when progression changes
  useEffect(() => {
    if (progression && isReady) {
      progression.steps.forEach(step => {
        if (step.chord) {
          preloadChord(step.chord, step.positionIndex);
        }
      });
    }
  }, [progression, isReady, preloadChord]);

  const handleSuggestionClick = async (suggestion: SuggestionResult) => {
    const newStep = suggestion.step;
    const newSteps = [...currentSteps, newStep];

    const newInput = newSteps.map((s) => s.roman.display).join(" ");
    setNumeralInput(newInput);

    const result = await generateMutation.mutateAsync({
      key: selectedKey,
      mode: selectedMode,
      input: newInput,
    });

    if (result) {
      setProgression(result);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Chord Progression Builder</h1>
              <p className="text-sm text-muted-foreground">
                Build progressions with Roman numerals, explore secondary dominants and borrowed chords
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Key & Mode Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Key</span>
                <Select
                  value={selectedKey}
                  onValueChange={(v) => setSelectedKey(v as ChordKey)}
                >
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
                <span className="text-sm font-medium text-muted-foreground">Mode</span>
                <Select
                  value={selectedMode}
                  onValueChange={(v) => setSelectedMode(v as ScaleMode)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={handleClear}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            
            {progression && progression.steps.length > 0 && (
              <Button 
                variant="secondary" 
                onClick={() => setShowGuitarHero(!showGuitarHero)}
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                {showGuitarHero ? "Hide" : "Guitar Hero"} Mode
              </Button>
            )}
            </div>

            <Separator />

            {/* Roman Numeral Builder */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground">
                Scale Degrees (Click to add)
              </span>
              <div className="flex flex-wrap gap-2">
                {ROMAN_BUTTONS.map((btn) => (
                  <Button
                    key={btn.numeral}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddNumeral(btn.numeral)}
                    className={cn(
                      "font-mono",
                      btn.type === "major" && "border-primary/30",
                      btn.type === "minor" && "border-muted",
                      btn.type === "dim" && "border-destructive/30"
                    )}
                  >
                    {btn.display}
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Input Display */}
            {numeralInput && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Current:</span>
                <span className="font-mono font-medium">{numeralInput}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Common Progressions */}
        {commonProgressions.data && (
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Common Progressions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2 pb-3">
                  {commonProgressions.data.map((prog) => (
                    <Button
                      key={prog.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadCommon(prog.name)}
                      className="shrink-0"
                    >
                      {prog.name}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Scale Harmony Reference */}
        {scaleHarmony.length > 0 && (
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">
                {selectedKey} {selectedMode} Scale Harmony
              </CardTitle>
              <CardDescription>Diatonic chords in this key</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {scaleHarmony.map((chord) => (
                  <button
                    key={chord.degree}
                    onClick={() => handleAddNumeral(chord.roman)}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <span className="font-mono font-medium">{chord.roman}</span>
                    <span className="text-xs text-muted-foreground">
                      {chord.key}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Progression */}
        {progression && progression.steps.length > 0 && (
          <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Current Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                {progression.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <button className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-primary bg-primary/5">
                        {step.chord && (
                          <ChordDiagram
                            position={step.chord.positions[step.positionIndex]}
                            width={100}
                            height={120}
                            leftHanded={isLeftHanded}
                            className="text-primary"
                          />
                        )}
                        <div className="flex flex-col items-center">
                          <Badge variant="default" className="font-mono">
                            {step.roman.display}
                          </Badge>
                          <span className="text-xs text-muted-foreground mt-1">
                            {step.chord?.key} {step.chord?.suffix}
                          </span>
                        </div>
                      </button>
                    </div>
                    {index < progression.steps.length - 1 && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guitar Hero Mode */}
        {showGuitarHero && progression && progression.steps.length > 0 && (
          <GuitarHeroMode
            chords={progression.steps.map(step => ({
              chord: step.chord!,
              positionIndex: step.positionIndex,
              roman: step.roman.display,
            }))}
            title={`${selectedKey} ${selectedMode} - ${progression.name || "Progression"}`}
          />
        )}

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Suggested Next Chords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={suggestion.step.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:bg-accent text-left",
                      idx === 0
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    {suggestion.step.chord && (
                      <ChordDiagram
                        position={suggestion.step.chord.positions[suggestion.step.positionIndex]}
                        width={90}
                        height={110}
                        leftHanded={isLeftHanded}
                        className={idx === 0 ? "text-primary" : "text-foreground"}
                      />
                    )}
                    <div className="flex flex-col items-center w-full">
                      <Badge
                        variant={idx === 0 ? "default" : "secondary"}
                        className="font-mono"
                      >
                        {suggestion.step.roman.display}
                      </Badge>
                      <div className="flex gap-1 mt-2 flex-wrap justify-center">
                        {suggestion.reasons.slice(0, 2).map((reason, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advanced Harmony */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Secondary Dominants */}
          {secondaryDominants.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Secondary Dominants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {secondaryDominants.map((sd) => (
                    <Button
                      key={sd.display}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddNumeral(sd.display)}
                      className="text-xs"
                    >
                      {sd.display} → {sd.resolutionKey}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Borrowed Chords */}
          {borrowedChords.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Borrowed Chords (Modal Interchange)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {borrowedChords.map((bc) => (
                    <Button
                      key={bc.roman}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddNumeral(bc.roman)}
                      className="text-xs"
                    >
                      {bc.roman} ({bc.sourceMode})
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
