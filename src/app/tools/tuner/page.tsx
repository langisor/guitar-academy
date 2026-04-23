"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import GuitarTuner from "@/tools/components/guitar-tunar";
import { MusicIcon } from "lucide-react";

export default function TunerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MusicIcon className="h-6 w-6 text-primary" />
              Guitar Tuner
            </CardTitle>
            <CardDescription>
              Tune your guitar with precision using our advanced pitch detection. 
              Play a string and follow the visual and audio feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-md mx-auto">
              <GuitarTuner />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
