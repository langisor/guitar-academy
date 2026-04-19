"use client";

import Link from "next/link";
import { 
  ChevronLeft, Flame, Zap, Trophy, Target, Clock, 
  Star, Settings, Music
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { useProgressStore } from "@/stores/progress";

export default function ProfilePage() {
  const { t, isRTL } = useLanguage();
  const { 
    xp, streak, levelsCompleted, totalPracticeMinutes, 
    dailyPracticeMinutes, dailyGoalMinutes 
  } = useProgressStore();

  const dailyProgress = (dailyPracticeMinutes / dailyGoalMinutes) * 100;
  const completedPercentage = Math.round((levelsCompleted.length / 50) * 100);

  return (
    <div className="min-h-full pb-20">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ChevronLeft className={`w-6 h-6 ${isRTL ? "rotate-180" : ""}`} />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{t.common.profile}</h1>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="text-center mt-6 mb-4">
          <div className="w-24 h-24 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center">
            <Music className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold">Guitar Learner</h2>
          <Badge className="mt-2 bg-yellow-500">Level {Math.floor(xp / 100) + 1}</Badge>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <CardContent className="p-4">
              <Flame className="w-6 h-6 mx-auto mb-1 text-orange-500" />
              <div className="text-2xl font-bold">{streak}</div>
              <div className="text-xs text-muted-foreground">{t.home.streak}</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Zap className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
              <div className="text-2xl font-bold">{xp}</div>
              <div className="text-xs text-muted-foreground">{t.home.totalXP}</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Trophy className="w-6 h-6 mx-auto mb-1 text-purple-500" />
              <div className="text-2xl font-bold">{levelsCompleted.length}</div>
              <div className="text-xs text-muted-foreground">{t.home.levelsCompleted}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Daily Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span>{dailyPracticeMinutes} min</span>
              <span>{dailyGoalMinutes} min goal</span>
            </div>
            <Progress 
              value={dailyProgress} 
              className="h-3"
            />
            {dailyProgress >= 100 && (
              <p className="text-sm text-green-600 mt-2 font-medium">
                🎉 Daily goal achieved!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Practice Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-secondary rounded-lg">
                <div className="text-2xl font-bold">{totalPracticeMinutes}</div>
                <div className="text-xs text-muted-foreground">Total Minutes</div>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <div className="text-2xl font-bold">{Math.round(totalPracticeMinutes / 7)}</div>
                <div className="text-xs text-muted-foreground">Avg Daily</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Course Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span>{levelsCompleted.length} of 50 levels</span>
              <span>{completedPercentage}%</span>
            </div>
            <Progress value={completedPercentage} className="h-3" />
            
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 10 }, (_, i) => {
                const worldLevels = (i + 1) * 5;
                const isComplete = levelsCompleted.length >= worldLevels;
                return (
                  <div 
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      ${isComplete 
                        ? "bg-green-500 text-white" 
                        : levelsCompleted.length > i * 5 
                          ? "bg-primary/20 text-primary" 
                          : "bg-gray-200 text-gray-500"
                      }
                    `}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center p-2 text-muted-foreground">
            <Music className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/songs" className="flex flex-col items-center p-2 text-muted-foreground">
            <Star className="w-6 h-6" />
            <span className="text-xs mt-1">{t.songs.songs}</span>
          </Link>
          <Link href="/practice" className="flex flex-col items-center p-2 text-primary">
            <Target className="w-6 h-6" />
            <span className="text-xs mt-1">{t.home.dailyPractice}</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center p-2 text-primary">
            <Trophy className="w-6 h-6" />
            <span className="text-xs mt-1">{t.common.profile}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
