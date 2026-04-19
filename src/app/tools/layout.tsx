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
  Info,
  Zap,
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
  { slug: "term-tooltip", title: "Term Tooltip", icon: Info },
  { slug: "guitar-hero-mode", title: "Guitar Hero", icon: Zap },
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRoot = pathname === "/tools";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-1 p-2 overflow-x-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="shrink-0">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="w-px h-6 bg-border shrink-0 mx-1" />
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = pathname === `/tools/${tool.slug}`;
            return (
              <Link key={tool.slug} href={`/tools/${tool.slug}`}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`shrink-0 gap-1.5 ${isActive ? "bg-secondary" : ""}`}
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
      <main>{children}</main>
    </div>
  );
}