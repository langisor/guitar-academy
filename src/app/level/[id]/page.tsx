"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, Check, X, Zap, Volume2, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChordDiagram } from "@/components/guitar/ChordDiagram";
import { StrummingPattern } from "@/components/guitar/StrummingPattern";
import { Fretboard } from "@/components/guitar/Fretboard";
import { useLanguage } from "@/hooks/useLanguage";
import { useProgressStore } from "@/stores/progress";

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

const levelContent: Record<number, {
  title: string
  lesson: string
  type: "chord" | "strumming" | "fretboard" | "transition" | "quiz"
  chord?: string
  pattern?: string
  tempo?: number
  question?: string
  options?: string[]
  correctAnswer?: string
}> = {
  1: { title: "Guitar Parts", lesson: "Learn the essential parts of your guitar: the headstock, tuning pegs, nut, frets, soundhole, and bridge. Each part plays a crucial role in producing sound.", type: "chord" },
  2: { title: "Holding the Guitar", lesson: "Sit with good posture and hold the guitar close to your body. Rest it on your right leg (or left if you're left-handed).", type: "chord" },
  3: { title: "Tuning Basics", lesson: "Standard tuning from low to high: E-A-D-G-B-e. Use a tuner to ensure each string is perfectly in tune.", type: "fretboard" },
  4: { title: "String Names", lesson: "The six strings are (thickest to thinnest): E, A, D, G, B, e. Remember: 'Eddie Ate Dynamite, Good Bye Eddie'", type: "quiz", question: "Which string is the thinnest (highest pitched)?", options: ["E", "A", "B", "e"], correctAnswer: "e" },
  5: { title: "Quiz Time", lesson: "Let's test what you've learned! Complete this quiz to earn your stars.", type: "quiz", question: "What is the lowest note on a standard tuned guitar?", options: ["E", "A", "D", "G"], correctAnswer: "E" },
  6: { title: "G Major", lesson: "The G chord uses 3 fingers: index on low E (3rd fret), middle on A (2nd fret), ring on D (3rd fret). The two high strings are open.", type: "chord", chord: "G" },
  7: { title: "C Major", lesson: "C chord: index on B (1st fret), middle on D (2nd fret), ring on A (3rd fret). Two open strings.", type: "chord", chord: "C" },
  8: { title: "D Major", lesson: "D chord is a triangle shape: index on G (2nd fret), middle on B (3rd fret), ring on D (2nd fret). Three open strings.", type: "chord", chord: "D" },
  9: { title: "E Minor", lesson: "Em is one of the easiest chords: index on G (2nd fret), middle on A (2nd fret). Two open strings.", type: "chord", chord: "Em" },
  10: { title: "Quiz Time", lesson: "Let's check your chord knowledge!", type: "quiz", question: "Which chord has fingers on frets 2-2 on strings A and D?", options: ["Em", "G", "C", "D"], correctAnswer: "Em" },
  11: { title: "G to C", lesson: "Practice transitioning from G to C. Keep your fingers in their shapes and move them together.", type: "transition", chord: "G" },
  12: { title: "C to D", lesson: "Transition from C to D. Notice how similar the finger positions are - just move your ring finger.", type: "transition", chord: "C" },
  13: { title: "D to Em", lesson: "D to Em is an easy transition. Remove your middle and ring fingers from D to form Em.", type: "transition", chord: "D" },
  14: { title: "Em to Am", lesson: "Em to Am: Add your pinky to the D string (2nd fret) while keeping your other fingers.", type: "transition", chord: "Em" },
  15: { title: "Quiz Time", lesson: "Test your chord transition skills!", type: "quiz", question: "Which chord transition requires the smallest hand movement?", options: ["G to C", "D to Em", "Am to E", "F to Bm"], correctAnswer: "D to Em" },
  16: { title: "Down Strum", lesson: "A basic down strum means picking all strings in a downward motion. Practice keeping a steady rhythm.", type: "strumming", pattern: "DDDD", tempo: 80 },
  17: { title: "Down-Up Pattern", lesson: "Alternate between down and up strums. This is the foundation of most strumming patterns.", type: "strumming", pattern: "DUDU", tempo: 90 },
  18: { title: "Country Pattern", lesson: "The classic country pattern: down on the beat, up on the '&'. D-D-U-D-U-D", type: "strumming", pattern: "DDUDUD", tempo: 100 },
  19: { title: "Pop Pattern", lesson: "Pop music often uses: down on 1, up on 2-and, down on 3-and, up on 4. D-U-DU-D-U", type: "strumming", pattern: "DUDUDU", tempo: 110 },
  20: { title: "Quiz Time", lesson: "Test your strumming knowledge!", type: "quiz", question: "What does 'D' typically represent in strumming patterns?", options: ["Down strum", "Down-up strum", "Double strum", "Dampened strum"], correctAnswer: "Down strum" },
};

export default function LevelPage() {
  const params = useParams();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { completeLevel, addXP, updateDailyPractice } = useProgressStore();
  
  const levelId = parseInt(params.id as string) || 1;
  const content = levelContent[levelId] || levelContent[1];
  
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
    const correct = content.correctAnswer ? answer === content.correctAnswer : true;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      addXP(10);
      updateDailyPractice(1);
    }
  };

  const handleContinue = () => {
    if (isCorrect) {
      completeLevel(levelId);
      addXP(50);
      
      const practiceTime = Math.floor((Date.now() - practiceStartTime) / 60000);
      updateDailyPractice(practiceTime);
    }
    
    const nextLevelId = levelId + 1;
    if (nextLevelId <= 50) {
      router.push(`/level/${nextLevelId}`);
    } else {
      router.push(`/world/${Math.ceil(nextLevelId / 5)}`);
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <Link href={`/world/${Math.ceil(levelId / 5)}`}>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
              <ChevronLeft className={`w-6 h-6 ${isRTL ? "rotate-180" : ""}`} />
            </Button>
          </Link>
          <div className="text-center">
            <span className="text-sm opacity-80">{t.worlds.level} {levelId}</span>
            <h1 className="font-bold">{content.title}</h1>
          </div>
          <div className="flex items-center gap-1 text-yellow-300">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">+50 XP</span>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4">
        {showLesson && (
          <div className="animate-fade-in">
            <Card className="mb-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">Lesson</Badge>
                  <span className="text-sm text-muted-foreground">Learn the concept</span>
                </div>
                <p className="text-lg leading-relaxed">{content.lesson}</p>
              </CardContent>
            </Card>

            {content.type === "chord" && content.chord && (
              <div className="flex justify-center mb-4">
                <ChordDiagram 
                  chordName={content.chord} 
                  fingers={chordFingerings[content.chord] || []}
                  size="lg"
                />
              </div>
            )}

            {content.type === "strumming" && content.pattern && (
              <div className="flex justify-center mb-4">
                <StrummingPattern 
                  pattern={content.pattern}
                  tempo={content.tempo}
                  showTempo
                  size="lg"
                />
              </div>
            )}

            {content.type === "fretboard" && (
              <div className="mb-4">
                <Fretboard showNoteNames showFretNumbers />
              </div>
            )}

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

                {content.type === "quiz" && content.question && (
                  <>
                    <h2 className="text-xl font-semibold mb-6">{content.question}</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {content.options?.map((option) => (
                        <Button
                          key={option}
                          variant={selectedAnswer === option ? "default" : "outline"}
                          className="h-16 text-lg"
                          onClick={() => handleAnswer(option)}
                          disabled={showResult}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </>
                )}

                {(content.type === "chord" || content.type === "transition") && content.chord && (
                  <div className="text-center">
                    <p className="text-lg mb-6">Practice the {content.chord} chord</p>
                    <div className="flex justify-center mb-6">
                      <ChordDiagram 
                        chordName={content.chord} 
                        fingers={chordFingerings[content.chord] || []}
                        size="lg"
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleAnswer("correct")}
                    >
                      I've practiced it!
                    </Button>
                  </div>
                )}

                {content.type === "strumming" && content.pattern && (
                  <div className="text-center">
                    <p className="text-lg mb-6">Practice the strumming pattern</p>
                    <div className="flex justify-center mb-6">
                      <StrummingPattern 
                        pattern={content.pattern}
                        tempo={content.tempo}
                        showTempo
                        size="lg"
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleAnswer("correct")}
                    >
                      I've practiced it!
                    </Button>
                  </div>
                )}
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
                    <span>+{content.correctAnswer ? 10 : 10} XP</span>
                  </div>
                )}
                {!isCorrect && content.correctAnswer && (
                  <p className="text-red-600">Correct answer: {content.correctAnswer}</p>
                )}
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={handleContinue}>
              {t.common.continue}
            </Button>

            {!isCorrect && (
              <Button 
                className="w-full mt-2" 
                variant="outline" 
                onClick={() => {
                  setShowResult(false);
                  setSelectedAnswer(null);
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
