"use client";

import ChordExplorer from "@/tools/components/chord-explorer";
import Providers from "@/tools/providers";

export default function Page() {
  return (
    <Providers>
      <ChordExplorer />
    </Providers>
  );
}