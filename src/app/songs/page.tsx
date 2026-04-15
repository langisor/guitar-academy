"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Play, Music, Clock, Star, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/useLanguage";
import { useProgressStore } from "@/stores/progress";

const songs = [
  { 
    id: 1, 
    title: "Knockin' on Heaven's Door", 
    artist: "Bob Dylan", 
    chords: ["G", "D", "Am", "C"],
    difficulty: "easy",
    tempo: 70,
    capo: 0,
    unlocked: true
  },
  { 
    id: 2, 
    title: "Wonderwall", 
    artist: "Oasis", 
    chords: ["Em", "G", "D", "A"],
    difficulty: "easy",
    tempo: 85,
    capo: 2,
    unlocked: true
  },
  { 
    id: 3, 
    title: "Horse With No Name", 
    artist: "America", 
    chords: ["Em", "D6/9"],
    difficulty: "easy",
    tempo: 75,
    capo: 0,
    unlocked: true
  },
  { 
    id: 4, 
    title: "Let Her Go", 
    artist: "Passenger", 
    chords: ["Am", "G", "C", "F"],
    difficulty: "medium",
    tempo: 90,
    capo: 0,
    unlocked: false
  },
  { 
    id: 5, 
    title: "Hotel California", 
    artist: "Eagles", 
    chords: ["Bm", "F#", "A", "E", "G", "D", "Em", "F#m"],
    difficulty: "hard",
    tempo: 80,
    capo: 0,
    unlocked: false
  },
  { 
    id: 6, 
    title: "Let It Be", 
    artist: "The Beatles", 
    chords: ["C", "G", "Am", "F"],
    difficulty: "easy",
    tempo: 75,
    capo: 0,
    unlocked: true
  },
  { 
    id: 7, 
    title: "Wish You Were Here", 
    artist: "Pink Floyd", 
    chords: ["Am", "G", "C", "F"],
    difficulty: "medium",
    tempo: 60,
    capo: 1,
    unlocked: true
  },
  { 
    id: 8, 
    title: "Take Me Home", 
    artist: "John Denver", 
    chords: ["G", "Em", "C", "D"],
    difficulty: "easy",
    tempo: 65,
    capo: 0,
    unlocked: true
  },
];

const difficultyColors = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  hard: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function SongsPage() {
  const { t, isRTL } = useLanguage();
  const { levelsCompleted } = useProgressStore();
  const [selectedSong, setSelectedSong] = useState<typeof songs[0] | null>(null);

  const unlockedSongs = songs.filter(s => s.unlocked || levelsCompleted.length >= 20);

  return (
    <div className="min-h-full pb-20">
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ChevronLeft className={`w-6 h-6 ${isRTL ? "rotate-180" : ""}`} />
            </Button>
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Music className="w-6 h-6" />
            {t.songs.songs}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-4 space-y-3">
        {unlockedSongs.map((song) => (
          <Card 
            key={song.id}
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setSelectedSong(song)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  <Music className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold">{song.title}</h3>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={difficultyColors[song.difficulty as keyof typeof difficultyColors]}>
                      {song.difficulty}
                    </Badge>
                    {song.capo > 0 && (
                      <Badge variant="secondary">Capo {song.capo}</Badge>
                    )}
                  </div>
                </div>
                
                <Button size="icon" variant="ghost">
                  <Play className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                {song.chords.map((chord, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 bg-secondary rounded text-sm font-medium"
                  >
                    {chord}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {!selectedSong && songs.filter(s => !unlockedSongs.includes(s)).map((song) => (
          <Card key={song.id} className="opacity-60">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-400 flex items-center justify-center text-white">
                  <Lock className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold">{song.title}</h3>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete more levels to unlock
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSong && (
        <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto flex items-center justify-center text-white mb-4">
                  <Music className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold">{selectedSong.title}</h2>
                <p className="text-muted-foreground">{selectedSong.artist}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className={`inline-block px-3 py-1 rounded ${difficultyColors[selectedSong.difficulty as keyof typeof difficultyColors]}`}>
                    {selectedSong.difficulty}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.songs.difficulty}</p>
                </div>
                <div className="text-center">
                  <div className="font-bold">{selectedSong.tempo} BPM</div>
                  <p className="text-xs text-muted-foreground">{t.songs.tempo}</p>
                </div>
                <div className="text-center">
                  <div className="font-bold">{selectedSong.capo > 0 ? `Capo ${selectedSong.capo}` : "-"}</div>
                  <p className="text-xs text-muted-foreground">{t.songs.capo}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Chords:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSong.chords.map((chord, i) => (
                    <span 
                      key={i}
                      className="px-3 py-2 bg-primary/10 rounded-lg font-bold"
                    >
                      {chord}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedSong(null)}
                >
                  Close
                </Button>
                <Button className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  {t.songs.play}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
