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
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Guitar Tools
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interactive tools to help you learn and practice guitar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="block group">
                <Card className="h-full border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-semibold">{tool.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm leading-relaxed">
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