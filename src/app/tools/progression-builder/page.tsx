"use client";

import ProgressionBuilder from "@/tools/components/progression-builder";
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

const PROGRESSION_CONTENT = (
  <>
    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">What is a Chord Progression?</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        A chord progression is a sequence of chords played one after another to create 
        the harmonic foundation of a song. The order and combination of chords create 
        the emotional feel and direction of the music. Most popular songs use just a 
        handful of common progressions.
      </p>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Roman Numerals</h3>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Chords are labeled with Roman numerals based on their position in the scale:</p>
        <div className="grid grid-cols-7 gap-1 mt-2 text-center">
          <div className="p-1 bg-muted rounded text-xs"><strong>I</strong><br/>1</div>
          <div className="p-1 bg-muted rounded text-xs"><strong>ii</strong><br/>2m</div>
          <div className="p-1 bg-muted rounded text-xs"><strong>iii</strong><br/>3m</div>
          <div className="p-1 bg-muted rounded text-xs"><strong>IV</strong><br/>4</div>
          <div className="p-1 bg-muted rounded text-xs"><strong>V</strong><br/>5</div>
          <div className="p-1 bg-muted rounded text-xs"><strong>vi</strong><br/>6m</div>
          <div className="p-1 bg-muted rounded text-xs"><strong>vii°</strong><br/>7dim</div>
        </div>
        <p className="mt-2">Uppercase = Major | Lowercase = Minor | ° = Diminished</p>
      </div>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Common Progressions</h3>
      <div className="space-y-3 text-sm">
        <div className="p-3 bg-muted rounded">
          <strong className="text-foreground">I - IV - V</strong>
          <p className="text-muted-foreground text-xs">The most basic progression. Works in any key. Example in C: C - F - G</p>
        </div>
        <div className="p-3 bg-muted rounded">
          <strong className="text-foreground">I - V - vi - IV</strong>
          <p className="text-muted-foreground text-xs"> Incredibly common in pop music. Example in C: C - G - Am - F</p>
        </div>
        <div className="p-3 bg-muted rounded">
          <strong className="text-foreground">ii - V - I</strong>
          <p className="text-muted-foreground text-xs">The jazz standard. Creates strong resolution. Example in C: Dm - G - C</p>
        </div>
        <div className="p-3 bg-muted rounded">
          <strong className="text-foreground">I - vi - IV - V</strong>
          <p className="text-muted-foreground text-xs">50s doo-wop progression. Example in G: G - Em - C - D</p>
        </div>
        <div className="p-3 bg-muted rounded">
          <strong className="text-foreground">I - IV - I - V</strong>
          <p className="text-muted-foreground text-xs">Simple rock progression. Example in E: E - A - E - B</p>
        </div>
      </div>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Functional Harmony</h3>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Chords have different roles in a progression:</p>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
            <strong>Tonic (I)</strong>
            <p className="text-xs">Home, rest. Gives feeling of completion.</p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
            <strong>Subdominant (IV)</strong>
            <p className="text-xs">Move away from home. Creates tension.</p>
          </div>
          <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded">
            <strong>Dominant (V)</strong>
            <p className="text-xs">Strong pull back to tonic. Creates urgency.</p>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">How to Use This Tool</h3>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
        <li>Select a key (like C, G, A) from the dropdown</li>
        <li>Choose major or minor mode</li>
        <li>Enter Roman numerals (e.g., "I-IV-V" or "i-bVII-IV")</li>
        <li>View the generated chord diagrams</li>
        <li>Play the progression with the Guitar Hero mode</li>
        <li>Get suggestions for substitutions and variations</li>
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
              What's Progression
            </Button>
          </DrawerTrigger>
        </div>
        <DrawerContent className="h-[85vh]">
          <DrawerHeader className="text-left border-b">
            <DrawerTitle>Chord Progressions Explained</DrawerTitle>
            <DrawerDescription>
              Learn about chord progressions, Roman numerals, and common patterns
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-6 overflow-y-auto h-[calc(85vh-140px)]">
            {PROGRESSION_CONTENT}
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
        <ProgressionBuilder />
      </Drawer>
    </Providers>
  );
}