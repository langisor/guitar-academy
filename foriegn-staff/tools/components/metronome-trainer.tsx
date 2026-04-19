"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Volume2, VolumeX, Timer, Zap, Target } from "lucide-react";

const subdivisionMap = {
  quarter: ["1", "2", "3", "4"],
  eighth: ["1", "&", "2", "&", "3", "&", "4", "&"],
  sixteenth: [
    "1", "e", "&", "a",
    "2", "e", "&", "a",
    "3", "e", "&", "a",
    "4", "e", "&", "a",
  ],
};

type Subdivision = "quarter" | "eighth" | "sixteenth";
type TrainingMode = "standard" | "auto-tempo" | "random-mute";

export default function MetronomeTrainer() {
  // Core state
  const [bpm, setBpm] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [subdivision, setSubdivision] = useState<Subdivision>("quarter");
  const [currentStep, setCurrentStep] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Training modes
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("standard");
  
  // Classic mute mode
  const [muteMode, setMuteMode] = useState(false);
  const [barsOn, setBarsOn] = useState(2);
  const [barsOff, setBarsOff] = useState(1);
  const [currentBar, setCurrentBar] = useState(0);
  const [isMutedPhase, setIsMutedPhase] = useState(false);

  // Auto tempo mode
  const [autoTempoEnabled, setAutoTempoEnabled] = useState(false);
  const [targetBpm, setTargetBpm] = useState(120);
  const [incrementBpm, setIncrementBpm] = useState(5);
  const [barsPerTempo, setBarsPerTempo] = useState(4);

  // Random mute challenge mode
  const [randomMuteEnabled, setRandomMuteEnabled] = useState(false);
  const [randomMuteProbability, setRandomMuteProbability] = useState(0.3);
  const [randomMuteBarsMin, setRandomMuteBarsMin] = useState(1);
  const [randomMuteBarsMax, setRandomMuteBarsMax] = useState(3);
  const [nextMuteBar, setNextMuteBar] = useState<number | null>(null);
  const [muteDurationBars, setMuteDurationBars] = useState(1);
  const [isRandomMuted, setIsRandomMuted] = useState(false);

  // Tap tempo
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const schedulerTimerRef = useRef<number | null>(null);
  const schedulerRef = useRef<(() => void) | null>(null);
  const lookahead = 25; // ms
  const scheduleAheadTime = 0.1; // s

  const steps = subdivisionMap[subdivision];

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("metronome-settings");
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setBpm(settings.bpm ?? 80);
        setSubdivision(settings.subdivision ?? "quarter");
        setVolume(settings.volume ?? 0.5);
        setMuteMode(settings.muteMode ?? false);
        setBarsOn(settings.barsOn ?? 2);
        setBarsOff(settings.barsOff ?? 1);
        setTrainingMode(settings.trainingMode ?? "standard");
        setAutoTempoEnabled(settings.autoTempoEnabled ?? false);
        setTargetBpm(settings.targetBpm ?? 120);
        setIncrementBpm(settings.incrementBpm ?? 5);
        setBarsPerTempo(settings.barsPerTempo ?? 4);
        setRandomMuteEnabled(settings.randomMuteEnabled ?? false);
        setRandomMuteProbability(settings.randomMuteProbability ?? 0.3);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      bpm,
      subdivision,
      volume,
      muteMode,
      barsOn,
      barsOff,
      trainingMode,
      autoTempoEnabled,
      targetBpm,
      incrementBpm,
      barsPerTempo,
      randomMuteEnabled,
      randomMuteProbability,
    };
    localStorage.setItem("metronome-settings", JSON.stringify(settings));
  }, [bpm, subdivision, volume, muteMode, barsOn, barsOff, trainingMode, 
      autoTempoEnabled, targetBpm, incrementBpm, barsPerTempo, 
      randomMuteEnabled, randomMuteProbability]);

  const getBeatDuration = useCallback(() => {
    const beatSec = 60 / bpm;
    switch (subdivision) {
      case "quarter":
        return beatSec;
      case "eighth":
        return beatSec / 2;
      case "sixteenth":
        return beatSec / 4;
      default:
        return beatSec;
    }
  }, [bpm, subdivision]);

  const playClick = useCallback((isDownbeat: boolean, time: number) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = isDownbeat ? 1200 : 800;
    gain.gain.value = isMuted ? 0 : volume * 0.3;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }, [volume, isMuted]);

  const shouldPlaySound = useCallback((stepIndex: number) => {
    // Check classic mute mode
    if (muteMode && isMutedPhase) return false;
    // Check random mute mode
    if (randomMuteEnabled && isRandomMuted) return false;
    return true;
  }, [muteMode, isMutedPhase, randomMuteEnabled, isRandomMuted]);

  const handleBarComplete = useCallback(() => {
    setCurrentBar((prevBar) => {
      const nextBar = prevBar + 1;

      // Classic mute mode logic
      if (muteMode) {
        const cycleLength = barsOn + barsOff;
        const cyclePos = nextBar % cycleLength;
        const muted = cyclePos >= barsOn;
        setIsMutedPhase(muted);
      }

      // Auto tempo mode logic
      if (autoTempoEnabled && nextBar > 0 && nextBar % barsPerTempo === 0) {
        setBpm((prevBpm) => {
          const newBpm = Math.min(prevBpm + incrementBpm, targetBpm);
          return newBpm;
        });
      }

      // Random mute challenge logic
      if (randomMuteEnabled) {
        if (isRandomMuted) {
          // Check if we should end the mute
          if (nextMuteBar !== null && nextBar >= nextMuteBar + muteDurationBars) {
            setIsRandomMuted(false);
            // Schedule next potential mute
            const nextMute = nextBar + Math.floor(Math.random() * (randomMuteBarsMax - randomMuteBarsMin + 1)) + randomMuteBarsMin;
            setNextMuteBar(nextMute);
          }
        } else if (nextMuteBar !== null && nextBar >= nextMuteBar) {
          // Start a mute
          if (Math.random() < randomMuteProbability) {
            setIsRandomMuted(true);
            const duration = Math.floor(Math.random() * 2) + 1; // 1-2 bars
            setMuteDurationBars(duration);
          } else {
            // Reschedule
            const nextMute = nextBar + Math.floor(Math.random() * (randomMuteBarsMax - randomMuteBarsMin + 1)) + randomMuteBarsMin;
            setNextMuteBar(nextMute);
          }
        }
      }

      return nextBar;
    });
  }, [muteMode, barsOn, barsOff, autoTempoEnabled, barsPerTempo, incrementBpm, targetBpm, 
      randomMuteEnabled, nextMuteBar, isRandomMuted, randomMuteBarsMin, randomMuteBarsMax, randomMuteProbability]);

  const scheduler = useCallback(() => {
    const beatDuration = getBeatDuration();

    while (nextNoteTimeRef.current < audioCtxRef.current!.currentTime + scheduleAheadTime) {
      const isDownbeat = currentStep === 0;

      if (shouldPlaySound(currentStep)) {
        playClick(isDownbeat, nextNoteTimeRef.current);
      }

      // Advance time
      nextNoteTimeRef.current += beatDuration;

      // Update visual step immediately
      setCurrentStep((prev) => {
        const next = (prev + 1) % steps.length;
        if (next === 0) {
          // Completed a bar
          handleBarComplete();
        }
        return next;
      });
    }
  }, [currentStep, steps.length, getBeatDuration, playClick, shouldPlaySound, handleBarComplete]);

  // Keep scheduler ref up to date
  useEffect(() => {
    schedulerRef.current = scheduler;
  }, [scheduler]);

  useEffect(() => {
    if (isPlaying) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume audio context if suspended
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05;

      const runScheduler = () => {
        schedulerRef.current?.();
        schedulerTimerRef.current = window.setTimeout(runScheduler, lookahead);
      };

      runScheduler();
    } else {
      if (schedulerTimerRef.current) {
        clearTimeout(schedulerTimerRef.current);
        schedulerTimerRef.current = null;
      }
    }

    return () => {
      if (schedulerTimerRef.current) {
        clearTimeout(schedulerTimerRef.current);
      }
    };
  }, [isPlaying]);

  // Reset step when subdivision changes
  useEffect(() => {
    setCurrentStep(0);
    setCurrentBar(0);
    setIsMutedPhase(false);
    setIsRandomMuted(false);
    setNextMuteBar(Math.floor(Math.random() * (randomMuteBarsMax - randomMuteBarsMin + 1)) + randomMuteBarsMin);
  }, [subdivision, randomMuteBarsMin, randomMuteBarsMax]);

  // Initialize random mute
  useEffect(() => {
    if (randomMuteEnabled && nextMuteBar === null) {
      setNextMuteBar(Math.floor(Math.random() * (randomMuteBarsMax - randomMuteBarsMin + 1)) + randomMuteBarsMin);
    }
  }, [randomMuteEnabled, nextMuteBar, randomMuteBarsMin, randomMuteBarsMax]);

  const handleTapTempo = () => {
    const now = Date.now();
    setTapTimes((prev) => {
      const newTimes = [...prev, now].slice(-5);
      if (newTimes.length >= 2) {
        const intervals = [];
        for (let i = 1; i < newTimes.length; i++) {
          intervals.push(newTimes[i] - newTimes[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const newBpm = Math.round(60000 / avgInterval);
        setBpm(Math.max(40, Math.min(200, newBpm)));
      }
      return newTimes;
    });
  };

  const togglePlay = () => {
    if (!isPlaying) {
      // Reset counters when starting
      setCurrentStep(0);
      setCurrentBar(0);
      setIsMutedPhase(false);
      setIsRandomMuted(false);
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrainingModeChange = (mode: TrainingMode) => {
    setTrainingMode(mode);
    setAutoTempoEnabled(mode === "auto-tempo");
    setRandomMuteEnabled(mode === "random-mute");
    setMuteMode(mode === "standard" && muteMode);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Metronome Trainer</h1>
        <p className="text-muted-foreground">
          Precision timing practice with structured training modes
        </p>
      </div>

      {/* Training Mode Tabs */}
      <Tabs 
        value={trainingMode} 
        onValueChange={(v) => handleTrainingModeChange(v as TrainingMode)}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="standard" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Standard
          </TabsTrigger>
          <TabsTrigger value="auto-tempo" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Auto Tempo
          </TabsTrigger>
          <TabsTrigger value="random-mute" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Challenge
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Classic Mute Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="mute-mode">Enable Mute Training</Label>
                <Switch
                  id="mute-mode"
                  checked={muteMode}
                  onCheckedChange={(checked) => {
                    setMuteMode(checked);
                    setCurrentBar(0);
                    setIsMutedPhase(false);
                  }}
                />
              </div>
              
              {muteMode && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bars Playing</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setBarsOn(Math.max(1, barsOn - 1))}
                      >
                        -
                      </Button>
                      <span className="font-mono text-lg w-8 text-center">{barsOn}</span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setBarsOn(barsOn + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bars Muted</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setBarsOff(Math.max(1, barsOff - 1))}
                      >
                        -
                      </Button>
                      <span className="font-mono text-lg w-8 text-center">{barsOff}</span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setBarsOff(barsOff + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                Train your internal clock by playing along, then continuing during silent bars.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto-tempo" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progressive Speed Training</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target BPM</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setTargetBpm(Math.max(bpm + 5, targetBpm - 5))}
                    >
                      -
                    </Button>
                    <span className="font-mono text-lg w-10 text-center">{targetBpm}</span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setTargetBpm(Math.min(200, targetBpm + 5))}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Increment (BPM)</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setIncrementBpm(Math.max(1, incrementBpm - 1))}
                    >
                      -
                    </Button>
                    <span className="font-mono text-lg w-8 text-center">+{incrementBpm}</span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setIncrementBpm(Math.min(20, incrementBpm + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Bars Before Increase</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setBarsPerTempo(Math.max(1, barsPerTempo - 1))}
                  >
                    -
                  </Button>
                  <span className="font-mono text-lg w-8 text-center">{barsPerTempo}</span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setBarsPerTempo(Math.min(16, barsPerTempo + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Automatically increases tempo every {barsPerTempo} bars until reaching {targetBpm} BPM.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="random-mute" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Random Mute Challenge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mute Probability: {Math.round(randomMuteProbability * 100)}%</Label>
                <Slider
                  value={[randomMuteProbability * 100]}
                  onValueChange={([v]) => setRandomMuteProbability(v / 100)}
                  min={10}
                  max={80}
                  step={5}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Gap (bars)</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setRandomMuteBarsMin(Math.max(1, randomMuteBarsMin - 1))}
                    >
                      -
                    </Button>
                    <span className="font-mono text-lg w-8 text-center">{randomMuteBarsMin}</span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setRandomMuteBarsMin(Math.min(randomMuteBarsMax, randomMuteBarsMin + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Max Gap (bars)</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setRandomMuteBarsMax(Math.max(randomMuteBarsMin, randomMuteBarsMax - 1))}
                    >
                      -
                    </Button>
                    <span className="font-mono text-lg w-8 text-center">{randomMuteBarsMax}</span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setRandomMuteBarsMax(Math.min(8, randomMuteBarsMax + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Unpredictable silent sections to test your internal timing. Stay in the pocket!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Visual Beat Display */}
      <Card className="mb-6">
        <CardContent className="py-8">
          <div className="flex justify-center gap-2 flex-wrap">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`w-12 h-12 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-75
                  ${i === currentStep 
                    ? "bg-primary text-primary-foreground scale-110 shadow-lg" 
                    : "bg-muted text-muted-foreground"
                  }`}
              >
                {s}
              </div>
            ))}
          </div>
          
          {/* Status Indicators */}
          <div className="flex justify-center gap-4 mt-4">
            {(muteMode || isRandomMuted) && (
              <div className={`flex items-center gap-2 text-sm font-medium ${
                (muteMode && isMutedPhase) || isRandomMuted 
                  ? "text-destructive" 
                  : "text-green-600"
              }`}>
                {(muteMode && isMutedPhase) || isRandomMuted ? (
                  <>
                    <VolumeX className="h-4 w-4" />
                    Muted — Keep Time!
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    Click Active
                  </>
                )}
              </div>
            )}
            
            {autoTempoEnabled && (
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                <Zap className="h-4 w-4" />
                Auto Tempo: {bpm} → {targetBpm} BPM
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Controls */}
      <Card className="mb-6">
        <CardContent className="py-6 space-y-6">
          {/* BPM Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Tempo</Label>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-bold">{bpm}</span>
                <span className="text-muted-foreground">BPM</span>
              </div>
            </div>
            <Slider
              value={[bpm]}
              onValueChange={([v]) => setBpm(v)}
              min={40}
              max={200}
              step={1}
            />
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={handleTapTempo}>
                Tap Tempo
              </Button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Volume</Label>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={([v]) => {
                setVolume(v / 100);
                setIsMuted(v === 0);
              }}
              min={0}
              max={100}
              step={5}
            />
          </div>

          {/* Subdivision Select */}
          <div className="space-y-2">
            <Label>Subdivision</Label>
            <Select
              value={subdivision}
              onValueChange={(v) => setSubdivision(v as Subdivision)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarter">Quarter Notes (1 2 3 4)</SelectItem>
                <SelectItem value="eighth">Eighth Notes (1 & 2 & 3 & 4 &)</SelectItem>
                <SelectItem value="sixteenth">Sixteenth Notes (1 e & a 2 e & a...)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Play Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={togglePlay}
          className="w-full max-w-xs h-14 text-lg"
        >
          {isPlaying ? (
            <>
              <Pause className="mr-2 h-5 w-5" />
              Stop
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              Start
            </>
          )}
        </Button>
      </div>

      {/* Tips */}
      <div className="mt-8 text-center text-sm text-muted-foreground space-y-1">
        <p>Practice counting subdivisions out loud while following the visual.</p>
        <p>Mute modes train your internal clock — resist the urge to speed up during silence!</p>
      </div>
    </div>
  );
}
