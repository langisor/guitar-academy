"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Flame, Trophy, Music, Settings, Play, Star, 
  ChevronRight, Zap, Target, Lock, Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { useProgressStore } from "@/stores/progress";

const worlds = [
  { id: 1, title: "Beginner Basics", icon: "🎸", levels: 5, color: "from-green-400 to-green-600" },
  { id: 2, title: "Open Chords", icon: "🎵", levels: 5, color: "from-emerald-400 to-emerald-600" },
  { id: 3, title: "Chord Transitions", icon: "🔄", levels: 5, color: "from-teal-400 to-teal-600" },
  { id: 4, title: "Strumming Patterns", icon: "🌊", levels: 5, color: "from-cyan-400 to-cyan-600" },
  { id: 5, title: "First Songs", icon: "🎤", levels: 5, color: "from-blue-400 to-blue-600" },
  { id: 6, title: "Barre Chords", icon: "💪", levels: 5, color: "from-indigo-400 to-indigo-600" },
  { id: 7, title: "Fretboard Mastery", icon: "🎯", levels: 5, color: "from-violet-400 to-violet-600" },
  { id: 8, title: "Rock Riffs", icon: "🔥", levels: 5, color: "from-purple-400 to-purple-600" },
  { id: 9, title: "Advanced Techniques", icon: "⚡", levels: 5, color: "from-pink-400 to-pink-600" },
  { id: 10, title: "Master Guitarist", icon: "👑", levels: 5, color: "from-amber-400 to-amber-600" },
];

export default function HomePage() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { xp, streak, levelsCompleted, dailyPracticeMinutes, dailyGoalMinutes, currentLevelId } = useProgressStore();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const completedWorlds = Math.floor(levelsCompleted.length / 5);
  const dailyProgress = (dailyPracticeMinutes / dailyGoalMinutes) * 100;

  return (
    <div className={`min-h-full pb-20 ${isDarkMode ? "dark" : ""}`}>
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <header className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.common.appName}</h1>
            <p className="text-sm text-white/80">{t.home.welcome}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Wrench className="w-4 h-4 mr-1.5" />
                Tools
              </Button>
            </Link>
             <Link href="https://guitar-helper-steel.vercel.app" target="_blank">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Wrench className="w-4 h-4 mr-1.5" />
                Guitar Helper
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            >
              <span className="text-sm font-medium">{language === "en" ? "ع" : "EN"}</span>
            </Button>
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-4 grid grid-cols-3 gap-3">
          <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
            <Flame className="w-6 h-6 mx-auto mb-1 text-orange-300" />
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-xs text-white/80">{t.home.streak}</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
            <Zap className="w-6 h-6 mx-auto mb-1 text-yellow-300" />
            <div className="text-2xl font-bold">{xp}</div>
            <div className="text-xs text-white/80">{t.home.totalXP}</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
            <div className="text-2xl font-bold">{levelsCompleted.length}</div>
            <div className="text-xs text-white/80">{t.home.levelsCompleted}</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-400">{t.home.dailyPractice}</span>
              </div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                {dailyPracticeMinutes}/{dailyGoalMinutes} min
              </span>
            </div>
            <Progress 
              value={dailyProgress} 
              className="h-2 bg-green-200 dark:bg-green-800"
            />
          </CardContent>
        </Card>

        {currentLevelId && currentLevelId <= 200 && (
          <Card className="mb-6 border-2 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{t.home.continueLearning}</span>
                <Badge variant="success">Level {currentLevelId}</Badge>
              </div>
              <Link href={`/level/${currentLevelId}`}>
                <Button className="w-full" size="lg">
                  <Play className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {t.common.continue}
                  <ChevronRight className={`w-4 h-4 ${isRTL ? "mr-auto ml-2 rotate-180" : "ml-auto mr-2"}`} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          {t.worlds.world} Map
        </h2>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-purple-500 to-pink-500 rounded-full transform -translate-x-1/2" />
          
          <div className="space-y-4">
            {worlds.map((world, index) => {
              const isUnlocked = index === 0 || levelsCompleted.length >= (index - 1) * 5;
              const isCompleted = levelsCompleted.length >= index * 5;
              
              return (
                <Link 
                  key={world.id} 
                  href={isUnlocked ? `/world/${world.id}` : "#"}
                  className={`block ${!isUnlocked ? "pointer-events-none opacity-60" : ""}`}
                >
                  <Card className={`relative overflow-hidden transition-transform hover:scale-[1.02] ${isCompleted ? "border-green-500" : ""}`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${world.color} opacity-10`} />
                    <CardContent className="p-4 relative">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${world.color} flex items-center justify-center text-2xl shadow-lg`}>
                          {isCompleted ? "✓" : world.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{t.worlds.world} {world.id}</h3>
                            <span className="text-sm text-muted-foreground">- {world.title}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{world.levels} levels</span>
                            {isCompleted && (
                              <Badge variant="success" className="text-xs">✓ {t.worlds.completed}</Badge>
                            )}
                            {!isUnlocked && (
                              <Badge variant="secondary" className="text-xs">
                                <Lock className="w-3 h-3 mr-1" />
                                {t.worlds.locked}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isUnlocked && (
                          <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRTL ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center p-2 text-primary">
            <Music className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/songs" className="flex flex-col items-center p-2 text-muted-foreground">
            <Play className="w-6 h-6" />
            <span className="text-xs mt-1">{t.songs.songs}</span>
          </Link>
          <Link href="/practice" className="flex flex-col items-center p-2 text-muted-foreground">
            <Target className="w-6 h-6" />
            <span className="text-xs mt-1">{t.home.dailyPractice}</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center p-2 text-muted-foreground">
            <Trophy className="w-6 h-6" />
            <span className="text-xs mt-1">{t.common.profile}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
