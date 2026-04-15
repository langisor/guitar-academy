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

export type LevelType = "chord" | "strumming" | "fretboard" | "transition" | "quiz" | "song" | "riff" | "technique" | "barre" | "special_quiz";

export interface LevelContent {
  title: string
  lesson: string
  type: LevelType
  chord?: string
  pattern?: string
  tempo?: number
  question?: string
  options?: string[]
  correctAnswer?: string
  targetBpm?: number
  chords?: string[]
  progression?: string
  recommendedStrumming?: string
  difficulty?: "easy" | "medium" | "hard"
}

export const levelContent: Record<number, LevelContent> = {
  1: { title: "Parts of the Guitar", lesson: "Learn the essential parts of your guitar: the headstock, tuning pegs, nut, frets, soundhole, and bridge. Each part plays a crucial role in producing sound.", type: "chord" },
  2: { title: "Proper Posture", lesson: "Sit with good posture and hold the guitar close to your body. Rest it on your right leg (or left if you're left-handed).", type: "chord" },
  3: { title: "Tuning Basics", lesson: "Standard tuning is E-A-D-G-B-e. We use tuners to measure 'pitch.' If a note is too high, it's 'sharp'; too low is 'flat.'", type: "fretboard", question: "What is the correct tuning for the 4th string?", options: ["E", "A", "D", "G"], correctAnswer: "D" },
  4: { title: "String Names & Numbers", lesson: "Strings are numbered 1 (high e) to 6 (low E). Remember: Eddie Ate Dynamite, Good Bye Eddie.", type: "quiz", question: "Which string is the thinnest?", options: ["E", "A", "B", "e"], correctAnswer: "e" },
  5: { title: "Beginner Basics Boss", lesson: "Review of posture, parts, and strings.", type: "quiz", question: "Which part holds the strings at the bottom?", options: ["Headstock", "Nut", "Bridge", "Fretboard"], correctAnswer: "Bridge" },
  6: { title: "G Major", lesson: "The G chord uses 3 fingers: index on low E (3rd fret), middle on A (2nd fret), ring on D (3rd fret). The two high strings are open.", type: "chord", chord: "G" },
  7: { title: "C Major", lesson: "C is a 'stretchy' chord. Keep your thumb behind the neck for leverage. Avoid muting the open G string.", type: "chord", chord: "C" },
  8: { title: "D Major", lesson: "The 'Triangle.' Only strum the top 4 strings.", type: "chord", chord: "D" },
  9: { title: "E Minor", lesson: "The easiest chord. Just two fingers on the 2nd fret.", type: "chord", chord: "Em" },
  10: { title: "Open Chords Quiz", lesson: "Identify shapes and finger placements for G, C, D, and Em.", type: "quiz", question: "Which chord has fingers on frets 2-2 on strings A and D?", options: ["Em", "G", "C", "D"], correctAnswer: "Em" },
  11: { title: "G → C", lesson: "Use the middle finger as a 'pivot' guide. Keep your fingers in their shapes and move them together.", type: "transition", chord: "G", targetBpm: 60, chords: ["G", "C"] },
  12: { title: "C → D", lesson: "Focus on the ring finger sliding/positioning. Notice how similar the finger positions are.", type: "transition", chord: "C", targetBpm: 60, chords: ["C", "D"] },
  13: { title: "D → Em", lesson: "Remove your middle and ring fingers from D to form Em.", type: "transition", chord: "D", targetBpm: 70, chords: ["D", "Em"] },
  14: { title: "Em → Am", lesson: "Am is just Em moved down one string set with an added index finger.", type: "transition", chord: "Em", targetBpm: 70, chords: ["Em", "Am"] },
  15: { title: "Transition Quiz", lesson: "Test your chord transition skills!", type: "quiz", question: "Which transition uses the least movement?", options: ["G to C", "D to Em", "Am to E", "F to Bm"], correctAnswer: "D to Em" },
  16: { title: "Down Strum", lesson: "Consistent 1/4 note downbeats. Practice keeping a steady rhythm.", type: "strumming", pattern: "DDDD", tempo: 80 },
  17: { title: "Down-Up Pattern", lesson: "1/8 note subdivisions. Alternate between down and up strums.", type: "strumming", pattern: "DUDU", tempo: 90 },
  18: { title: "Country/Folk Pattern", lesson: "The 'Boom-Chicka' rhythm. D-D-U-D-U-D", type: "strumming", pattern: "DDUDUD", tempo: 100 },
  19: { title: "Pop Pattern", lesson: "Constant motion with accents. Down on 1, up on 2-and, down on 3-and, up on 4.", type: "strumming", pattern: "DUDUDU", tempo: 110 },
  20: { title: "Strumming Quiz", lesson: "Test your strumming knowledge!", type: "quiz", question: "What does 'D' typically represent in strumming patterns?", options: ["Down strum", "Down-up strum", "Double strum", "Dampened strum"], correctAnswer: "Down strum" },
  21: { title: "Let It Be", lesson: "The Beatles song with C, G, Am, F (simplified to Em). A classic for beginners.", type: "song", chord: "C", progression: "C - G - Am - Em", recommendedStrumming: "D-D-U-D-U-D" },
  22: { title: "A Horse with No Name", lesson: "America's hit. The ultimate 2-chord song using Em and D.", type: "song", chord: "Em", progression: "Em - D", recommendedStrumming: "D-U-D-U-D-U" },
  23: { title: "Wonderwall", lesson: "Oasis classic with Em, G, D, Am progression.", type: "song", chord: "Em", progression: "Em - G - D - Am", recommendedStrumming: "D-D-U-D-U-D" },
  24: { title: "Knockin' on Heaven's Door", lesson: "Bob Dylan's epic. G, D, Am / G, D, C.", type: "song", chord: "G", progression: "G - D - Am", recommendedStrumming: "D-D-U-D-U-D" },
  25: { title: "Song Challenge Boss", lesson: "Match progressions to the correct song.", type: "quiz", question: "Which song uses Em - D progression?", options: ["Let It Be", "A Horse with No Name", "Wonderwall", "Knockin' on Heaven's Door"], correctAnswer: "A Horse with No Name" },
  26: { title: "F Major Barre", lesson: "Using the index finger as a 'nut.' The index bars all 6 strings while other fingers form the shape.", type: "barre", chord: "F" },
  27: { title: "B Minor Barre", lesson: "Playing minor chords from the 5th string root. The A-shape moved up.", type: "barre", chord: "Bm" },
  28: { title: "D Minor Barre", lesson: "The D-shape moved up the neck. Challenging but essential.", type: "barre", chord: "Dm" },
  29: { title: "Moving the Shapes", lesson: "Moving F shape to fret 3 (G) and fret 5 (A). Learn to transpose barre chords.", type: "barre", chord: "G", targetBpm: 80 },
  30: { title: "Barre Chord Quiz", lesson: "Test your barre chord knowledge!", type: "quiz", question: "What fret is the A-shape barre chord at root A?", options: ["3rd fret", "5th fret", "7th fret", "12th fret"], correctAnswer: "5th fret" },
  31: { title: "Note Names", lesson: "The chromatic scale and natural half-steps (B-C, E-F). All 12 notes.", type: "fretboard" },
  32: { title: "Minor Pentatonic Pattern 1", lesson: "The 'Box' shape for soloing. The foundation of rock and blues soloing.", type: "riff", chord: "A", pattern: "X-0-2-2-0-0" },
  33: { title: "Interval Shapes", lesson: "Octaves and Power Chords (Roots and 5ths). Essential for rhythm guitar.", type: "fretboard", pattern: "X-X-0-2-3-2" },
  34: { title: "Triads", lesson: "Small 3-string shapes on strings 1, 2, and 3. Major, minor, diminished, augmented.", type: "fretboard" },
  35: { title: "Fretboard Quiz", lesson: "Test your fretboard knowledge!", type: "quiz", question: "What is the 5th fret note on the A string?", options: ["C", "D", "E", "F"], correctAnswer: "D" },
  36: { title: "Smoke on the Water", lesson: "The iconic Deep Purple riff. Simple power chord pattern.", type: "riff", chord: "G", progression: "G5 - A5 - D5", pattern: "-3---3---5", tempo: 120 },
  37: { title: "Seven Nation Army", lesson: "The White Stripes. Single-note riff that goes low to high.", type: "riff", chord: "G", progression: "G - G - G", pattern: "3-3-3-3-0-3", tempo: 116 },
  38: { title: "Iron Man", lesson: "Black Sabbath. The menacing opening riff.", type: "riff", chord: "E", pattern: "0-2-2-0-2-0", tempo: 104 },
  39: { title: "Back in Black", lesson: "AC/DC. A little more advanced with palm muting.", type: "riff", chord: "A", pattern: "X-0-2-2-2-0", tempo: 120 },
  40: { title: "Riff Challenge Boss", lesson: "Master the iconic rock riffs!", type: "quiz", question: "Which song uses primarily G5 power chords?", options: ["Smoke on the Water", "Seven Nation Army", "Iron Man", "Back in Black"], correctAnswer: "Smoke on the Water" },
  41: { title: "Travis Picking", lesson: "The fingerpicking style popularized by Merle Travis. Thumb plays bass, fingers play melody.", type: "technique", chord: "G", pattern: "T-1-2-3", tempo: 80 },
  42: { title: "Hammer-ons", lesson: "Pluck the string and 'hammer' your finger down to create a note without picking again.", type: "technique", pattern: "H", tempo: 90 },
  43: { title: "Pull-offs", lesson: "Pull your finger off the string to sound the lower note. The reverse of hammer-ons.", type: "technique", pattern: "P", tempo: 90 },
  44: { title: "Slides", lesson: "Slide from one note to another. Creates a smooth, connected sound.", type: "technique", pattern: "/", tempo: 100 },
  45: { title: "Technique Quiz", lesson: "Test your technique knowledge!", type: "quiz", question: "Which technique involves plucking a string with your finger as you lift it?", options: ["Hammer-on", "Pull-off", "Slide", "Bend"], correctAnswer: "Pull-off" },
  46: { title: "Syncopated Rhythms", lesson: "Off-beat accents and rest strokes. Essential for groovy playing.", type: "strumming", pattern: "D-U-d-U", tempo: 110 },
  47: { title: "Jazz Chords", lesson: "7ths & 9ths. Cmaj7, Dm7, G7, Am7 shapes.", type: "chord", chord: "Cmaj7" },
  48: { title: "Modal Interchange", lesson: "Borrowing chords from parallel modes. Mix major and minor palette.", type: "chord", chord: "Db" },
  49: { title: "Performance Mindset", lesson: "Stage presence, audience connection, and preparing for live performance.", type: "quiz", question: "What is the most important aspect of live performance?", options: ["Speed", "Showmanship", "Consistent practice", "Playing loud"], correctAnswer: "Consistent practice" },
  50: { title: "Graduation Level", lesson: "Comprehensive review and Master certification. You've come a long way!", type: "special_quiz", question: "Are you ready to call yourself a guitarist?", options: ["Yes!", "Absolutely!", "Definitely!", "Let's go!"], correctAnswer: "Yes!" },
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
