"use client";

import MetronomeTrainer from "@/tools/components/metronome-trainer";
import Providers from "@/tools/providers";

export default function Page() {
  return (
    <Providers>
      <MetronomeTrainer />
    </Providers>
  );
}