"use client";

import { ChordDiagram } from "@/tools/components/chord-diagram";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const DEMO_POSITION = {
  frets: [0, 2, 2, 1, 0, -1],
  fingers: [0, 2, 3, 1, 0, 0],
  baseFret: 1,
  barres: [],
  midi: [40, 45, 50, 55, 59, 0],
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Chord Diagram</CardTitle>
            <CardDescription>
              Visual representation of guitar chord fingerings
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChordDiagram
              position={DEMO_POSITION}
              width={200}
              height={240}
              className="text-foreground"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}