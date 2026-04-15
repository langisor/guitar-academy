"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Play, Pause, RefreshCw, Target, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/useLanguage";
import { useProgressStore } from "@/stores/progress";

const practiceExercises = [
  { id: 1, name: "Finger Warm-up", duration: 120, type: "technique" },
  { id: 2, name: "Chord Transitions", duration: 180, type: "chords" },
  { id: 3, name: "Strumming Practice", duration: 150, type: "rhythm" },
  { id: 4, name: "Scale Exercise", duration: 120, type: "scales" },
  { id: 5, name: "Free Play", duration: 300, type: "creative" },
];

export default function PracticePage() {
  const { t, isRTL } = useLanguage();
  const { dailyPracticeMinutes, dailyGoalMinutes, updateDailyPractice, updateStreak } = useProgressStore();
  
  const [isPracticing, setIsPracticing] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<typeof practiceExercises[0] | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPracticing) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        setTotalElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPracticing]);

  useEffect(() => {
    if (totalElapsed > 0 && totalElapsed % 60 === 0) {
      updateDailyPractice(1);
    }
  }, [totalElapsed, updateDailyPractice]);

  const handleStartPractice = (exercise: typeof practiceExercises[0]) => {
    setCurrentExercise(exercise);
    setElapsedSeconds(0);
    setIsPracticing(true);
  };

  const handleStopPractice = () => {
    if (elapsedSeconds > 0) {
      updateDailyPractice(Math.ceil(elapsedSeconds / 60));
    }
    updateStreak();
    setIsPracticing(false);
    setCurrentExercise(null);
    setElapsedSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const dailyProgress = (dailyPracticeMinutes / dailyGoalMinutes) * 100;
  const goalReached = dailyProgress >= 100;

  return (
    <div className="min-h-full pb-20">
      <header className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ChevronLeft className={`w-6 h-6 ${isRTL ? "rotate-180" : ""}`} />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{t.home.dailyPractice}</h1>
          <div className="w-10" />
        </div>

        <div className="text-center mb-4">
          <div className="text-4xl font-bold mb-2">
            {dailyPracticeMinutes} / {dailyGoalMinutes} min
          </div>
          <Progress 
            value={dailyProgress} 
            className="h-3 bg-white/30"
            indicatorClassName={goalReached ? "bg-yellow-400" : "bg-white"}
          />
          {goalReached && (
            <p className="mt-2 text-yellow-200">🎉 Daily goal reached!</p>
          )}
        </div>
      </header>

      {isPracticing && currentExercise ? (
        <div className="p-4 animate-fade-in">
          <Card className="border-2 border-primary">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
                {isPracticing ? (
                  <Play className="w-10 h-10 text-primary-foreground" />
                ) : (
                  <Pause className="w-10 h-10 text-primary-foreground" />
                )}
              </div>
              
              <h2 className="text-xl font-bold mb-2">{currentExercise.name}</h2>
              
              <div className="text-5xl font-bold font-mono my-6">
                {formatTime(elapsedSeconds)}
              </div>
              
              <div className="flex justify-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleStopPractice}
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Stop
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setElapsedSeconds(0)}
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                Session XP: +{Math.floor(elapsedSeconds / 6)} XP
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Practice Exercises
            </h2>

            <div className="space-y-3">
              {practiceExercises.map((exercise) => (
                <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <Play className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{exercise.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {exercise.duration / 60} minutes • {exercise.type}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleStartPractice(exercise)}
                      >
                        Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Stats
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.floor(totalElapsed / 60)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    This Session (min)
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.floor(dailyPracticeMinutes)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Today's Total (min)
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center p-2 text-muted-foreground">
            <Target className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/songs" className="flex flex-col items-center p-2 text-muted-foreground">
            <Play className="w-6 h-6" />
            <span className="text-xs mt-1">{t.songs.songs}</span>
          </Link>
          <Link href="/practice" className="flex flex-col items-center p-2 text-primary">
            <Target className="w-6 h-6" />
            <span className="text-xs mt-1">{t.home.dailyPractice}</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center p-2 text-muted-foreground">
            <Zap className="w-6 h-6" />
            <span className="text-xs mt-1">{t.common.profile}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
