"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Check, X, Zap, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChordDiagram } from "@/components/guitar/ChordDiagram";
import { StrummingPattern } from "@/components/guitar/StrummingPattern";
import { Fretboard } from "@/components/guitar/Fretboard";
import { useLanguage } from "@/hooks/useLanguage";
import { useProgressStore } from "@/stores/progress";
import { Level } from "@/repositories";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { QuestionComponent } from "@/components/mdx/QuestionComponent";

import Image from "next/image";

// Safe Image wrapper: next-mdx-remote can drop numeric JSX props ({500}),
// so we provide fallback dimensions to satisfy next/image requirements.
const MdxImage = ({
  src,
  alt,
  width,
  height,
  ...props
}: {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  [key: string]: unknown;
}) => (
  <Image
    src={src || ""}
    alt={alt || ""}
    width={Number(width) || 800}
    height={Number(height) || 600}
    style={{ maxWidth: "100%", height: "auto" }}
    {...(props as object)}
  />
);

// Define components for MDX
const mdxComponents = {
  ChordDiagram,
  StrummingPattern,
  Fretboard,
  Badge,
  Card,
  CardContent,
  Image: MdxImage,
  QuestionComponent,
  // You can add more components here
};

interface LevelClientProps {
  level: Level;
  mdxSource?: MDXRemoteSerializeResult;
  frontmatter?: any;
}

const chordFingerings: Record<string, number[]> = {
  'C': [0, 3, 2, 0, 1, 0],
  'G': [3, 2, 0, 0, 0, 3],
  'D': [-1, -1, 0, 2, 3, 2],
  'Em': [0, 2, 2, 0, 0, 0],
  'Am': [0, 1, 2, 2, 0, 0],
  'E': [0, 2, 2, 1, 0, 0],
  'A': [0, 2, 2, 2, 0, 0],
  'F': [1, 3, 3, 2, 1, 1],
};

export default function LevelClient({ level, mdxSource, frontmatter }: LevelClientProps) {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { completeLevel, addXP, updateDailyPractice } = useProgressStore();

  const levelType = frontmatter?.type || level.difficulty === 'hard' ? 'quiz' : 'chord';
  const chordName = frontmatter?.chord || (levelType === 'chord' ? level.title : null);

  const [showLesson, setShowLesson] = useState(true);
  const [showExercise, setShowExercise] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [practiceStartTime] = useState(Date.now());

  const handleStartExercise = () => {
    setShowLesson(false);
    setShowExercise(true);
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    // For now, if it's an MDX lesson, we might need a way to define the quiz in MDX
    // or keep using the exercises table in DB. 
    // This is a simplified check.
    const correct = true; 
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      addXP(10);
      updateDailyPractice(1);
    }
  };

  const handleContinue = () => {
    if (isCorrect) {
      completeLevel(level.id);
      addXP(50);

      const practiceTime = Math.floor((Date.now() - practiceStartTime) / 60000);
      updateDailyPractice(practiceTime);
    }

    const nextLevelId = level.id + 1;
    router.push(`/world/${level.world_id}`);
  };

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <Link href={`/world/${level.world_id}`}>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
              <ChevronLeft className={`w-6 h-6 ${isRTL ? "rotate-180" : ""}`} />
            </Button>
          </Link>
          <div className="text-center">
            <span className="text-sm opacity-80">{t.worlds.level} {level.order_index}</span>
            <h1 className="font-bold">{level.title}</h1>
          </div>
          <div className="flex items-center gap-1 text-yellow-300">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">+{level.xp_reward} XP</span>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4">
        {showLesson && (
          <div className="animate-fade-in">
            <Card className="mb-4">
              <CardContent className="p-6 prose dark:prose-invert max-w-none">
                {mdxSource ? (
                  <MDXRemote {...mdxSource} components={mdxComponents} />
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary">Lesson</Badge>
                      <span className="text-sm text-muted-foreground">Learn the concept</span>
                    </div>
                    <p className="text-lg leading-relaxed">{level.description}</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Button
              className="w-full"
              size="lg"
              onClick={handleStartExercise}
            >
              Start Exercise
            </Button>
          </div>
        )}

        {showExercise && (
          <div className="animate-fade-in">
            <Card className="mb-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="default">Exercise</Badge>
                  <span className="text-sm text-muted-foreground">Practice</span>
                </div>

                <div className="text-center">
                  <p className="text-lg mb-6">
                    {levelType === 'chord' && chordName 
                      ? `Practice the ${chordName} chord` 
                      : "Complete the lesson to earn XP!"}
                  </p>
                  
                  {levelType === 'chord' && chordName && (
                    <div className="flex justify-center mb-6">
                      <ChordDiagram
                        chordName={chordName}
                        fingers={chordFingerings[chordName] || []}
                        size="lg"
                      />
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => handleAnswer("correct")}
                  >
                    {levelType === 'chord' ? "I've practiced it!" : "I've finished the lesson!"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showResult && (
          <div className="animate-fade-in">
            <Card className={`mb-4 ${isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isCorrect ? "bg-green-500" : "bg-red-500"} text-white`}>
                  {isCorrect ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? t.exercises.correct : t.exercises.incorrect}
                </h2>
                {isCorrect && (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Zap className="w-5 h-5" />
                    <span>+10 XP</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={handleContinue}>
              {t.common.continue}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
