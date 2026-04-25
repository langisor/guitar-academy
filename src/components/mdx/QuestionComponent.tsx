"use client";

import { useState, useEffect } from "react";
import { Check, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProgressStore } from "@/stores/progress";
import { getExerciseDetails } from "@/app/actions/exercise";
import { Exercise } from "@/repositories/interfaces/types";

interface QuestionComponentProps {
  exerciseId?: number;
  question?: string;
  options?: string[] | string;
  correctAnswer?: string;
  xpReward?: number;
  onCorrect?: () => void;
}

export function QuestionComponent({
  exerciseId,
  question: propQuestion,
  options: propOptions,
  correctAnswer: propCorrectAnswer,
  xpReward: propXpReward = 10,
  onCorrect,
}: QuestionComponentProps) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(!!exerciseId);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { addXP, updateDailyPractice } = useProgressStore();

  useEffect(() => {
    async function loadExercise() {
      if (exerciseId) {
        setIsLoading(true);
        try {
          const data = await getExerciseDetails(exerciseId);
          setExercise(data);
        } catch (error) {
          console.error("Failed to load exercise:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadExercise();
  }, [exerciseId]);

  const displayQuestion = exercise?.question || propQuestion;
  
  let displayOptions: string[] = [];
  if (exercise?.options) {
    try {
      displayOptions = JSON.parse(exercise.options);
    } catch (e) {
      if (typeof exercise.options === 'string') {
        displayOptions = exercise.options.split(',').map(o => o.trim());
      }
    }
  } else if (propOptions) {
    displayOptions = Array.isArray(propOptions) 
      ? propOptions 
      : (typeof propOptions === 'string' ? propOptions.split(',').map(o => o.trim()) : []);
  }

  const correctOption = exercise?.correct_answer || propCorrectAnswer;
  const xpAmount = exercise?.xp_reward || propXpReward;

  const handleSelect = (option: string) => {
    if (!isSubmitted) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    
    setIsSubmitted(true);
    
    const isCorrect = selectedOption === correctOption;
    if (isCorrect) {
      addXP(xpAmount);
      updateDailyPractice(1);
      
      // Call parent handler if provided
      if (onCorrect) {
        onCorrect();
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="my-6">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!displayQuestion || !displayOptions.length) {
    return null;
  }

  const isCorrect = isSubmitted && selectedOption === correctOption;
  const isWrong = isSubmitted && selectedOption !== correctOption;

  return (
    <Card className="my-6 shadow-md border-primary/10">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-lg flex justify-between items-start">
          <span>{displayQuestion}</span>
          <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded text-sm shrink-0">
            <Zap className="w-4 h-4 fill-current" />
            <span>{xpAmount} XP</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {displayOptions.map((option, index) => {
            let buttonVariant: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link" = "outline";
            let buttonClass = "justify-start h-auto py-3 px-4 text-left font-normal transition-all duration-200 hover:bg-primary/5 hover:text-primary";
            
            if (isSubmitted) {
              if (option === correctOption) {
                buttonVariant = "default";
                buttonClass = "justify-start h-auto py-3 px-4 text-left font-medium bg-green-500 hover:bg-green-600 text-white border-green-500";
              } else if (option === selectedOption) {
                buttonVariant = "destructive";
                buttonClass = "justify-start h-auto py-3 px-4 text-left font-medium line-through";
              } else {
                buttonClass = "justify-start h-auto py-3 px-4 text-left font-normal opacity-50";
              }
            } else if (selectedOption === option) {
              buttonVariant = "default";
              buttonClass = "justify-start h-auto py-3 px-4 text-left font-medium ring-2 ring-primary ring-offset-1";
            }

            return (
              <Button
                key={index}
                variant={buttonVariant}
                className={buttonClass}
                onClick={() => handleSelect(option)}
                disabled={isSubmitted}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option}</span>
                  {isSubmitted && option === correctOption && <Check className="w-5 h-5 ml-2" />}
                  {isSubmitted && option === selectedOption && option !== correctOption && <X className="w-5 h-5 ml-2" />}
                </div>
              </Button>
            );
          })}
        </div>

        {!isSubmitted && (
          <Button 
            className="w-full mt-4" 
            size="lg" 
            onClick={handleSubmit}
            disabled={!selectedOption}
          >
            Check Answer
          </Button>
        )}

        {isSubmitted && (
          <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
            isCorrect ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300" : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
          }`}>
            <div className={`mt-0.5 rounded-full p-1 ${
              isCorrect ? "bg-green-200 dark:bg-green-800" : "bg-red-200 dark:bg-red-800"
            }`}>
              {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-semibold">{isCorrect ? "Correct!" : "Not quite right."}</p>
              <p className="text-sm mt-1">
                {isCorrect 
                  ? `Great job! You earned ${xpAmount} XP.` 
                  : `The correct answer was: ${correctOption}`
                }
              </p>
              {!isCorrect && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 bg-white/50 hover:bg-white dark:bg-black/50 dark:hover:bg-black"
                  onClick={() => {
                    setIsSubmitted(false);
                    setSelectedOption(null);
                  }}
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
