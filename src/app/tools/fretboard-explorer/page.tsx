"use client";

import FretboardExplorer from "@/tools/components/fretboard-explorer";
import Providers from "@/tools/providers";

export default function Page() {
  return (
    <Providers>
      <FretboardExplorer />
    </Providers>
  );
}