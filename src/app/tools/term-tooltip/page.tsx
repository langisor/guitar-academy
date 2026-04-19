"use client";

import { TermDefinition } from "@/tools/components/term-tooltip";
import Providers from "@/tools/providers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SAMPLE_TERMS = ["chord", "scale", "arpeggio", "fret", "intonation"];

export default function Page() {
  return (
    <Providers>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Term Tooltip</CardTitle>
              <CardDescription>
                Hover over terms to see their definitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Try hovering on these guitar terms:
              </p>
              <div className="flex flex-wrap gap-3">
                {SAMPLE_TERMS.map((term) => (
                  <TermDefinition key={term} term={term} className="text-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Providers>
  );
}