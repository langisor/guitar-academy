"use client";

import ChordExplorer from "@/tools/components/chord-explorer";
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

const CHORD_CONTENT = (
  <>
    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">What is a Chord?</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        A chord is three or more notes played simultaneously (or in quick succession). 
        On guitar, this means pressing multiple strings at different frets to create 
        a harmonious sound. Chords are the building blocks of songs - they provide 
        the harmonic foundation that supports the melody.
      </p>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Types of Chords</h3>
      <div className="space-y-3 text-sm">
        <div>
          <strong className="text-foreground">Major Chords</strong>
          <p className="text-muted-foreground">Sound bright and happy. Example: C major, G major, D major</p>
        </div>
        <div>
          <strong className="text-foreground">Minor Chords</strong>
          <p className="text-muted-foreground">Sound sad or melancholic. Example: A minor, E minor, D minor</p>
        </div>
        <div>
          <strong className="text-foreground">Seventh Chords</strong>
          <p className="text-muted-foreground">Add depth and tension. Example: G7, Cmaj7, Am7</p>
        </div>
        <div>
          <strong className="text-foreground">Diminished & Augmented</strong>
          <p className="text-muted-foreground">Sound tense and unstable. Used for dramatic effect.</p>
        </div>
      </div>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">How to Read Chord Diagrams</h3>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>• <strong>Vertical lines</strong> represent guitar strings (left = low E, right = high e)</p>
        <p>• <strong>Horizontal lines</strong> represent frets (top line = nut or 1st fret)</p>
        <p>• <strong>Numbers</strong> on dots indicate which finger to use (1=index, 2=middle, 3=ring, 4=pinky)</p>
        <p>• <strong>O</strong> above a string = open string (play without pressing)</p>
        <p>• <strong>X</strong> above a string = mute the string</p>
        <p>• <strong>Barres</strong> (curved line) = one finger pressing multiple strings</p>
      </div>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">Tips for Beginners</h3>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
        <li>Start with open chords (C, G, D, Em, Am)</li>
        <li>Press strings firmly but avoid excessive tension</li>
        <li>Place your fingers close to the frets for clearer sound</li>
        <li>Practice transitioning between chords slowly</li>
        <li>Keep your thumb behind the neck, not wrapping around</li>
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
              What's Chord
            </Button>
          </DrawerTrigger>
        </div>
        <DrawerContent className="h-[85vh]">
          <DrawerHeader className="text-left border-b">
            <DrawerTitle>Guitar Chords Explained</DrawerTitle>
            <DrawerDescription>
              Learn about chords, types, and how to read chord diagrams
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-6 overflow-y-auto h-[calc(85vh-140px)]">
            {CHORD_CONTENT}
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
        <ChordExplorer />
      </Drawer>
    </Providers>
  );
}