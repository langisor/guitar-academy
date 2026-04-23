"use client";

import { TermSearch } from "@/tools/components/term-search";
import Providers from "@/tools/providers";

export default function Page() {
  return (
    <Providers>
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Term Search</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search and explore music terminology to deepen your understanding of guitar concepts
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
            <TermSearch />
          </div>
        </div>
      </div>
    </Providers>
  );
}