"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import GuitarTuner from "@/tools/components/guitar-tunar";
import { MusicIcon } from "lucide-react";

export default function TunerPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <MusicIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Guitar Tuner</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Tune your guitar with precision using our advanced pitch detection. 
            Play a string and follow the visual and audio feedback.
          </p>
        </div>
        
        <Card className="border border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="w-full max-w-md mx-auto">
              <GuitarTuner />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
