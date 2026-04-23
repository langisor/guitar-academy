"use client";

import MetronomeTrainer from "@/tools/components/metronome-trainer";
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

const METRONOME_CONTENT = (
  <>
    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">What is a Metronome?</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        A metronome is a device or app that produces a steady pulse (click) at a 
        consistent tempo. It helps musicians develop steady timing and rhythm. 
        The term comes from Greek words meaning "measure of time." Metronomes are 
        essential tools for every musician, from beginners to professionals.
      </p>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Understanding BPM</h3>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p><strong>BPM (Beats Per Minute)</strong> measures how fast the tempo is.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>60 BPM = 1 beat per second</li>
          <li>120 BPM = 2 beats per second (common tempo)</li>
          <li>180 BPM = fast rock or metal</li>
        </ul>
        <p className="mt-2">General tempo ranges:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>40-60: Largo (slow, stately)</li>
          <li>66-76: Adagio (slow, expressive)</li>
          <li>108-120: Moderato (moderate speed)</li>
          <li>120-156: Allegro (fast, bright)</li>
          <li>168-200: Presto (very fast)</li>
        </ul>
      </div>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Time Signatures</h3>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>The top number tells how many beats per measure; the bottom tells what note gets one beat.</p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="p-2 bg-muted rounded">
            <strong>4/4</strong> (common time)
            <p className="text-xs">4 beats per measure</p>
          </div>
          <div className="p-2 bg-muted rounded">
            <strong>3/4</strong> (waltz time)
            <p className="text-xs">3 beats per measure</p>
          </div>
          <div className="p-2 bg-muted rounded">
            <strong>6/8</strong> (compound duple)
            <p className="text-xs">6 beats per measure</p>
          </div>
          <div className="p-2 bg-muted rounded">
            <strong>2/4</strong> (march time)
            <p className="text-xs">2 beats per measure</p>
          </div>
        </div>
      </div>
    </section>

    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Why Practice with a Metronome?</h3>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
        <li>Develops steady, consistent timing</li>
        <li>Helps internalize rhythm (play in time without thinking)</li>
        <li>Identifies timing weaknesses</li>
        <li>Allows gradual speed increase (start slow, build speed)</li>
        <li>Prepares you for playing with others</li>
        <li>Improves coordination between hands</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">Practice Tips</h3>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
        <li>Start at a comfortable tempo (60-80 BPM)</li>
        <li>Play perfectly at slow speed before increasing</li>
        <li>Increase tempo by 5-10 BPM increments</li>
        <li>Practice difficult sections separately</li>
        <li>Use subdivision (quarter, eighth, sixteenth notes)</li>
        <li>Practice with a metronome every day, even just 10 minutes</li>
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
              What's Metronome
            </Button>
          </DrawerTrigger>
        </div>
        <DrawerContent className="h-[85vh]">
          <DrawerHeader className="text-left border-b">
            <DrawerTitle>The Metronome Explained</DrawerTitle>
            <DrawerDescription>
              Learn about tempo, BPM, time signatures, and why metronome practice matters
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-6 overflow-y-auto h-[calc(85vh-140px)]">
            {METRONOME_CONTENT}
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
        <MetronomeTrainer />
      </Drawer>
    </Providers>
  );
}