"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, ChevronRight, Lock, Check, Play,
  Music, Star, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/useLanguage";
import { useProgressStore } from "@/stores/progress";

const worldData: Record<number, { title: string; levels: { id: number; title: string; isLesson: boolean }[] }> = {
  1: { 
    title: "Beginner Basics", 
    levels: [
      { id: 1, title: "Guitar Parts", isLesson: true },
      { id: 2, title: "Holding the Guitar", isLesson: true },
      { id: 3, title: "Tuning Basics", isLesson: true },
      { id: 4, title: "String Names", isLesson: true },
      { id: 5, title: "Quiz Time", isLesson: false },
    ]
  },
  2: { 
    title: "Open Chords", 
    levels: [
      { id: 6, title: "G Major", isLesson: true },
      { id: 7, title: "C Major", isLesson: true },
      { id: 8, title: "D Major", isLesson: true },
      { id: 9, title: "E Minor", isLesson: true },
      { id: 10, title: "Quiz Time", isLesson: false },
    ]
  },
  3: { 
    title: "Chord Transitions", 
    levels: [
      { id: 11, title: "G to C", isLesson: true },
      { id: 12, title: "C to D", isLesson: true },
      { id: 13, title: "D to Em", isLesson: true },
      { id: 14, title: "Em to Am", isLesson: true },
      { id: 15, title: "Quiz Time", isLesson: false },
    ]
  },
  4: { 
    title: "Strumming Patterns", 
    levels: [
      { id: 16, title: "Down Strum", isLesson: true },
      { id: 17, title: "Down-Up Pattern", isLesson: true },
      { id: 18, title: "Country Pattern", isLesson: true },
      { id: 19, title: "Pop Pattern", isLesson: true },
      { id: 20, title: "Quiz Time", isLesson: false },
    ]
  },
  5: { 
    title: "First Songs", 
    levels: [
      { id: 21, title: "Let It Be Intro", isLesson: true },
      { id: 22, title: "Horse With No Name", isLesson: true },
      { id: 23, title: "Wonderwall", isLesson: true },
      { id: 24, title: "Knockin Heaven's Door", isLesson: true },
      { id: 25, title: "Song Challenge", isLesson: false },
    ]
  },
  6: { 
    title: "Barre Chords", 
    levels: [
      { id: 26, title: "F Major Barre", isLesson: true },
      { id: 27, title: "Bm Barre", isLesson: true },
      { id: 28, title: "Dm Barre", isLesson: true },
      { id: 29, title: "Fm Barre", isLesson: true },
      { id: 30, title: "Quiz Time", isLesson: false },
    ]
  },
  7: { 
    title: "Fretboard Mastery", 
    levels: [
      { id: 31, title: "Note Names", isLesson: true },
      { id: 32, title: "Scale Patterns", isLesson: true },
      { id: 33, title: "Interval Shapes", isLesson: true },
      { id: 34, title: "Triads", isLesson: true },
      { id: 35, title: "Quiz Time", isLesson: false },
    ]
  },
  8: { 
    title: "Rock Riffs", 
    levels: [
      { id: 36, title: "Smoke on Water", isLesson: true },
      { id: 37, title: "Seven Nation Army", isLesson: true },
      { id: 38, title: "Iron Man", isLesson: true },
      { id: 39, title: "Back in Black", isLesson: true },
      { id: 40, title: "Riff Challenge", isLesson: false },
    ]
  },
  9: { 
    title: "Advanced Techniques", 
    levels: [
      { id: 41, title: "Fingerpicking", isLesson: true },
      { id: 42, title: "Hammer-ons", isLesson: true },
      { id: 43, title: "Pull-offs", isLesson: true },
      { id: 44, title: "Slides", isLesson: true },
      { id: 45, title: "Quiz Time", isLesson: false },
    ]
  },
  10: { 
    title: "Master Guitarist", 
    levels: [
      { id: 46, title: "Advanced Rhythm", isLesson: true },
      { id: 47, title: "Jazz Chords", isLesson: true },
      { id: 48, title: "Modal Interchange", isLesson: true },
      { id: 49, title: "Live Performance", isLesson: true },
      { id: 50, title: "Final Challenge", isLesson: false },
    ]
  },
};

const worldColors: Record<number, string> = {
  1: "from-green-400 to-green-600",
  2: "from-emerald-400 to-emerald-600",
  3: "from-teal-400 to-teal-600",
  4: "from-cyan-400 to-cyan-600",
  5: "from-blue-400 to-blue-600",
  6: "from-indigo-400 to-indigo-600",
  7: "from-violet-400 to-violet-600",
  8: "from-purple-400 to-purple-600",
  9: "from-pink-400 to-pink-600",
  10: "from-amber-400 to-amber-600",
};

export default function WorldPage() {
  const params = useParams();
  const { t, isRTL } = useLanguage();
  const { levelsCompleted, setCurrentLevel } = useProgressStore();
  
  const worldId = parseInt(params.id as string) || 1;
  const world = worldData[worldId] || worldData[1];
  const prevWorldId = worldId > 1 ? worldId - 1 : null;
  const nextWorldId = worldId < 10 ? worldId + 1 : null;
  
  const completedLevelsInWorld = world.levels.filter(l => 
    levelsCompleted.includes(l.id)
  ).length;
  const progress = (completedLevelsInWorld / world.levels.length) * 100;

  const handleStartLevel = (levelId: number) => {
    setCurrentLevel(levelId);
  };

  return (
    <div className="min-h-full pb-20">
      <header className={`bg-gradient-to-r ${worldColors[worldId]} text-white p-4`}>
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ChevronLeft className={`w-6 h-6 ${isRTL ? "rotate-180" : ""}`} />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{t.worlds.world} {worldId}</h1>
          <div className="w-10" />
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{world.title}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-white/80">
            <span>{completedLevelsInWorld}/{world.levels.length} {t.home.levelsCompleted}</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 mt-3 bg-white/30"
            indicatorClassName="bg-white"
          />
        </div>
      </header>

      <div className="p-4 space-y-3">
        {world.levels.map((level, index) => {
          const isCompleted = levelsCompleted.includes(level.id);
          const isUnlocked = index === 0 || levelsCompleted.includes(world.levels[index - 1].id);
          const stars = isCompleted ? 3 : 0;
          
          return (
            <Link 
              key={level.id}
              href={isUnlocked ? `/level/${level.id}` : "#"}
              onClick={() => isUnlocked && handleStartLevel(level.id)}
              className={`block ${!isUnlocked ? "pointer-events-none" : ""}`}
            >
              <Card className={`overflow-hidden transition-all ${!isUnlocked ? "opacity-60" : "hover:shadow-lg"}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold
                      ${isCompleted 
                        ? "bg-green-500" 
                        : isUnlocked 
                          ? "bg-primary" 
                          : "bg-gray-400"
                      }
                    `}>
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : isUnlocked ? (
                        level.isLesson ? <Music className="w-5 h-5" /> : <Star className="w-5 h-5" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t.worlds.level} {index + 1}</span>
                        {!level.isLesson && (
                          <Badge variant="warning" className="text-xs">⭐</Badge>
                        )}
                      </div>
                      <h3 className="font-medium">{level.title}</h3>
                      
                      {isCompleted && (
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-4 h-4 ${s <= stars ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {isUnlocked && (
                      <Button size="sm" variant={isCompleted ? "outline" : "default"}>
                        {isCompleted ? t.common.continue : t.common.start}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 flex justify-between">
        {prevWorldId ? (
          <Link href={`/world/${prevWorldId}`}>
            <Button variant="outline" size="sm">
              <ChevronLeft className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`} />
              {t.worlds.world} {prevWorldId}
            </Button>
          </Link>
        ) : <div />}
        
        {nextWorldId && (
          <Link href={`/world/${nextWorldId}`}>
            <Button variant="outline" size="sm">
              {t.worlds.world} {nextWorldId}
              <ChevronRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
