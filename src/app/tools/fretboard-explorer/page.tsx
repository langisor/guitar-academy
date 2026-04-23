"use client";

import FretboardExplorer from "@/tools/components/fretboard-explorer";
import Providers from "@/tools/providers";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { HelpCircle, X } from "lucide-react";

const FRETBOARD_CONTENT = (
  <>
    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">What is the Fretboard?</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        The fretboard is the long neck of the guitar with metal strips (frets) that 
        divide it into semitone intervals. Understanding the fretboard is essential 
        for becoming a complete guitarist - it allows you to play anywhere on the 
        neck, improvise solos, and understand music theory on the instrument.
      </p>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">String Names & Tuning</h3>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Standard tuning (low to high):</p>
        <div className="flex justify-center gap-2 my-3">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center font-bold text-lg">E</div>
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-lg">A</div>
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center font-bold text-lg">D</div>
          <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center font-bold text-lg">G</div>
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center font-bold text-lg">B</div>
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center font-bold text-lg">e</div>
        </div>
        <p>Memory trick: <strong>Elephants</strong> And <strong>Donkeys</strong> Grow <strong>Big</strong> <strong>Ears</strong></p>
        <p>From thickest to thinnest string: E A D G B e</p>
      </div>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Fret Numbering</h3>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Frets are numbered from the headstock (1, 2, 3...) toward the body.</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Fret 0</strong> = open string (no finger pressed)</li>
          <li><strong>Fret 1</strong> = first metal strip from the nut</li>
          <li><strong>12th fret</strong> = octave (same note as open string)</li>
          <li><strong>Natural notes</strong> = A B C D E F G (7 notes)</li>
          <li><strong>Sharps/Flats</strong> = the 5 notes between (A#, C#, D#, F#, G#)</li>
        </ul>
      </div>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Note Pattern: The Chromatic Scale</h3>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Every fret is one semitone (half-step). The pattern:</p>
        <p className="font-mono bg-muted p-2 rounded">
          A A# B C C# D D# E F F# G G# (back to A)
        </p>
        <p>Notice: No sharps between B-C and E-F</p>
      </div>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Understanding Voicings</h3>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>A "voicing" is a specific way to play a chord on the fretboard. The same chord can be played in many positions:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Open position</strong> = uses open strings (frets 0-3)</li>
          <li><strong>Barre chords</strong> = one finger bars multiple strings</li>
          <li><strong>Movable shapes</strong> = same pattern, different root</li>
          <li><strong>Drop voicings</strong> = altered bass notes</li>
        </ul>
      </div>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">How to Use This Tool</h3>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
        <li>Select a chord key and type from the dropdowns</li>
        <li>Choose a fretboard region (open, 5th, 9th, 12th position)</li>
        <li>View all available voicings on the fretboard</li>
        <li>Compare two voicings side by side</li>
        <li>See voice leading between different positions</li>
        <li>Click any position to see the chord diagram</li>
      </ul>
    </section>
  </>
);

export default function Page() {
  return (
    <Providers>
      <Drawer direction="top">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/50 shadow-sm px-4 py-3 flex items-center justify-between">
          <div />
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 hover:bg-primary/10 hover:border-primary/30 transition-colors">
              <HelpCircle className="h-4 w-4" />
              What's Fretboard
            </Button>
          </DrawerTrigger>
        </div>
        <DrawerContent className="h-[85vh]">
          <DrawerHeader className="text-left border-b">
            <DrawerTitle>The Guitar Fretboard Explained</DrawerTitle>
            <DrawerDescription>
              Learn about the fretboard, string tuning, fret numbering, and chord voicings
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-6 overflow-y-auto h-[calc(85vh-140px)]">
            {FRETBOARD_CONTENT}
          </div>
          <DrawerFooter className="border-t">
            <DrawerClose asChild>
              <Button variant="outline">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
        <FretboardExplorer />
      </Drawer>
    </Providers>
  );
}