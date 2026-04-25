"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronLeft, Play, Pause, CheckCircle2, Clock, Target, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getExerciseById, warmUpExercises, type WarmUpExercise } from "@/data/warm-up-exercises"
import { useMetronome } from "@/hooks/useMetronome"
import { MetronomeControl } from "@/components/warm-up/MetronomeControl"
import { SimpleFretboard, ChordFretboard } from "@/components/warm-up/SimpleFretboard"
import { chords, type ChordData } from "@/data/guitar/chords"
import { cn } from "@/lib/utils"

export default function ExercisePage() {
  const params = useParams()
  const id = params?.id as string

  const exercise = getExerciseById(id)
  
  const { isPlaying, isReady, currentBeat, bpm, start, stop, setBpm } = useMetronome(
    exercise?.targetBpm || 60
  )

  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [sessionTime, setSessionTime] = useState(0)
  const [isSessionActive, setIsSessionActive] = useState(false)

  // Load progress
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem(`warmup_progress_${id}`)
      if (savedProgress) {
        try {
          const { completed, time } = JSON.parse(savedProgress)
          setCompletedSteps(completed || [])
          setSessionTime(time || 0)
        } catch (e) {
          console.error("Failed to parse saved progress", e)
        }
      }
    }
  }, [id])

  // Save progress
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`warmup_progress_${id}`, JSON.stringify({
        completed: completedSteps,
        time: sessionTime
      }))
    }
  }, [id, completedSteps, sessionTime])

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isSessionActive])

  if (!exercise) {
    return (
      <div className="min-h-full p-4 text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Exercise Not Found</h1>
        <Link href="/warm-up">
          <Button variant="outline">Back to Warm-Up</Button>
        </Link>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => {
      if (prev.includes(stepIndex)) return prev
      return [...prev, stepIndex]
    })
    if (stepIndex < exercise.steps.length - 1) {
      setCurrentStep(stepIndex + 1)
    }
  }

  const getChordData = (chordName: string): ChordData | undefined => {
    return chords[chordName as keyof typeof chords]
  }

  return (
    <div className="min-h-full pb-20">
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
        <div className="flex items-center justify-between">
          <Link href="/warm-up">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold truncate flex-1 text-center px-2">
            {exercise.title}
          </h1>
          <div className="w-10" />
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {exercise.duration}
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {exercise.difficulty}
          </div>
          {exercise.targetBpm && (
            <Badge variant="outline" className="bg-white/20 border-0">
              {exercise.targetBpm} BPM
            </Badge>
          )}
        </div>
      </header>

      {/* Progress */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {completedSteps.length} / {exercise.steps.length} steps
          </span>
        </div>
        <Progress value={(completedSteps.length / exercise.steps.length) * 100} />
      </div>

      {/* Metronome */}
      <div className="p-4 border-b">
        <MetronomeControl
          bpm={bpm}
          isPlaying={isPlaying}
          currentBeat={currentBeat}
          onBpmChange={setBpm}
          onStart={start}
          onStop={stop}
        />
      </div>

      {/* Session Timer */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold font-mono">{formatTime(sessionTime)}</div>
          <Button
            variant={isSessionActive ? "destructive" : "default"}
            onClick={() => setIsSessionActive(!isSessionActive)}
          >
            {isSessionActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" /> Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" /> Start
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Steps */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Steps</h2>
        
        <div className="space-y-3">
          {exercise.steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index)
            const isCurrent = currentStep === index

            return (
              <Card 
                key={index}
                className={cn(
                  "cursor-pointer transition-all",
                  isCompleted && "border-green-500 bg-green-50 dark:bg-green-950",
                  isCurrent && "border-primary ring-2 ring-primary/20"
                )}
                onClick={() => handleStepComplete(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      isCompleted 
                        ? "bg-green-500 text-white" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{step.step}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{step.instruction}</p>
                      {step.tip && (
                        <p className="text-sm text-muted-foreground mt-1">
                          💡 {step.tip}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Tips */}
      {exercise.tips && exercise.tips.length > 0 && (
        <div className="p-4">
          <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-yellow-800 dark:text-yellow-200">
                    • {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fretboard Visual (for applicable exercises) */}
      {(exercise.id === "finger-independence" || exercise.id === "chromatic-warmup") && (
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fretboard Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleFretboard
                highlightedFret={1}
                highlightedStrings={[0, 1, 2, 3, 4, 5]}
                startFret={1}
                frets={4}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chord Diagrams (for chord exercises) */}
      {exercise.chords && exercise.chords.length > 0 && (
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chord Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {exercise.chords.map((chordName) => {
                  const chord = getChordData(chordName)
                  if (!chord) return null
                  
                  return (
                    <div key={chordName} className="text-center">
                      <div className="font-medium mb-2">{chordName}</div>
                      <ChordFretboard
                        positions={chord.fingers.map(f => ({
                          string: f.string,
                          fret: f.fret,
                          finger: f.finger
                        }))}
                        openStrings={chord.openStrings}
                        muteStrings={chord.muteStrings}
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center p-2 text-muted-foreground">
            <Play className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/warm-up" className="flex flex-col items-center p-2 text-primary">
            <ChevronLeft className="w-6 h-6" />
            <span className="text-xs mt-1">Back</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}