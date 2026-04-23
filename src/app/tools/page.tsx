"use client";

import Link from "next/link";
import { 
  Music, 
  Guitar, 
  Timer, 
  Search, 
  LayoutGrid,
  ListMusic,
  MusicIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TOOLS = [
  {
    slug: "chord-explorer",
    title: "Chord Explorer",
    description: "Discover guitar chords across all keys and variations",
    icon: Music,
  },
  {
    slug: "fretboard-explorer",
    title: "Fretboard Explorer",
    description: "Explore chord voicings across the entire fretboard",
    icon: Guitar,
  },
  {
    slug: "metronome-trainer",
    title: "Metronome Trainer",
    description: "Practice timing and rhythm with customizable metronome",
    icon: Timer,
  },
  {
    slug: "term-search",
    title: "Term Search",
    description: "Search and explore music terminology",
    icon: Search,
  },
  {
    slug: "chord-diagram",
    title: "Chord Diagram",
    description: "View chord fingerings and positions",
    icon: LayoutGrid,
  },
  {
    slug: "progression-builder",
    title: "Progression Builder",
    description: "Build and analyze chord progressions",
    icon: ListMusic,
  },
  {
    slug: "tuner",
    title: "Guitar Tuner",
    description: "Tune your guitar with precision pitch detection",
    icon: MusicIcon,
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Guitar Tools</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Interactive tools to help you learn and practice guitar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="block">
                <Card className="h-full border-none shadow-sm hover:shadow-md transition-all hover:border-primary/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{tool.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}