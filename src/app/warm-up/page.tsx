"use client"

import Link from "next/link"
import { ChevronLeft, Play, Flame, Clock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { warmUpExercises, getExercisesBySection } from "@/data/warm-up-exercises"

const sectionTitles = {
  1: "Essential Warm-Up",
  2: "Chord Mastery",
  3: "Rhythm & Timing"
}

const sectionDescriptions = {
  1: "Prepare your fingers for playing and prevent injury",
  2: "Build speed, accuracy, and muscle memory for chord changes",
  3: "Develop rock-solid timing and rhythm"
}

export default function WarmUpPage() {
  return (
    <div className="min-h-full pb-20">
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Warm-Up</h1>
          <div className="w-10" />
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5" />
            <span className="font-semibold">Practice Exercises</span>
          </div>
          <p className="text-sm text-white/80">
            Build strength, accuracy, and timing with structured exercises
          </p>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {[1, 2, 3].map((section) => {
          const exercises = getExercisesBySection(section as 1 | 2 | 3)
          
          return (
            <div key={section}>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                  Section {section}
                </Badge>
                <h2 className="text-lg font-semibold">
                  {sectionTitles[section as 1 | 2 | 3]}
                </h2>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {sectionDescriptions[section as 1 | 2 | 3]}
              </p>

              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <Link key={exercise.id} href={`/warm-up/${exercise.id}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                              <Play className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{exercise.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {exercise.duration}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {exercise.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-primary">
                            <Zap className="w-5 h-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center p-2 text-muted-foreground">
            <Play className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/songs" className="flex flex-col items-center p-2 text-muted-foreground">
            <Play className="w-6 h-6" />
            <span className="text-xs mt-1">Songs</span>
          </Link>
          <Link href="/warm-up" className="flex flex-col items-center p-2 text-primary">
            <Flame className="w-6 h-6" />
            <span className="text-xs mt-1">Warm-Up</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center p-2 text-muted-foreground">
            <Zap className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}