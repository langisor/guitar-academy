"use client";

import { TermSearch } from "@/tools/components/term-search";
import Providers from "@/tools/providers";

export default function Page() {
  return (
    <Providers>
      <TermSearch />
    </Providers>
  );
}