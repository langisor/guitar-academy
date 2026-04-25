"use client";

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
import { Level } from "@/repositories";

interface WorldClientProps {
  worldId: number;
  worldTitle: string;
  levels: Level[];
}

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

export default function WorldClient({ worldId, worldTitle, levels }: WorldClientProps) {
  const { t, isRTL } = useLanguage();
  const { levelsCompleted, setCurrentLevel } = useProgressStore();
  
  const prevWorldId = worldId > 1 ? worldId - 1 : null;
  const nextWorldId = worldId < 10 ? worldId + 1 : null;
  
  const completedLevelsInWorld = levels.filter(l => 
    levelsCompleted.includes(l.id)
  ).length;
  const progress = (completedLevelsInWorld / levels.length) * 100;

  const handleStartLevel = (levelId: number) => {
    setCurrentLevel(levelId);
  };

  return (
    <div className="min-h-full pb-20">
      <header className={`bg-gradient-to-r ${worldColors[worldId] || "from-primary to-primary-foreground"} text-white p-4`}>
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
          <h2 className="text-2xl font-bold mb-2">{worldTitle}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-white/80">
            <span>{completedLevelsInWorld}/{levels.length} {t.home.levelsCompleted}</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 mt-3 bg-white/30"
          />
        </div>
      </header>

      <div className="p-4 space-y-3">
        {levels.map((level, index) => {
          const isCompleted = levelsCompleted.includes(level.id);
          const isUnlocked = index === 0 || levelsCompleted.includes(levels[index - 1].id);
          const stars = isCompleted ? 3 : 0;
          const isLesson = level.content_path?.endsWith('.mdx') || level.difficulty !== 'hard'; // Simple heuristic or based on type
          
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
                        isLesson ? <Music className="w-5 h-5" /> : <Star className="w-5 h-5" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t.worlds.level} {index + 1}</span>
                        {!isLesson && (
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
