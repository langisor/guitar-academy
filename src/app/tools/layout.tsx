"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Music, 
  Guitar, 
  Timer, 
  Search, 
  LayoutGrid,
  ListMusic,
  MusicIcon,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TOOLS = [
  { slug: "chord-explorer", title: "Chord Explorer", icon: Music },
  { slug: "fretboard-explorer", title: "Fretboard Explorer", icon: Guitar },
  { slug: "metronome-trainer", title: "Metronome", icon: Timer },
  { slug: "term-search", title: "Term Search", icon: Search },
  { slug: "chord-diagram", title: "Chord Diagram", icon: LayoutGrid },
  { slug: "progression-builder", title: "Progression", icon: ListMusic },
  { slug: "tuner", title: "Guitar Tuner", icon: MusicIcon },
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRoot = pathname === "/tools";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="flex items-center gap-1 p-3 overflow-x-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="shrink-0 hover:bg-primary/10">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="w-px h-6 bg-border shrink-0 mx-2" />
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = pathname === `/tools/${tool.slug}`;
            return (
              <Link key={tool.slug} href={`/tools/${tool.slug}`}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`shrink-0 gap-1.5 transition-all hover:bg-primary/10 ${isActive ? "bg-primary text-primary-foreground shadow-sm" : ""}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tool.title}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Page Content */}
      <main className="animate-fade-in">{children}</main>
    </div>
  );
}