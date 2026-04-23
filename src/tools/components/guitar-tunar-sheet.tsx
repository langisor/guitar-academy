"use client";

import { useState } from "react";
import GuitarTuner from "./guitar-tunar";
import { Button } from "@/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MusicIcon } from "lucide-react";

export default function GuitarTunerSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          className="gap-2 bg-background border-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
        >
          <MusicIcon className="h-5 w-5" />
          <span className="font-medium">Guitar Tuner</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] sm:h-[85vh] md:max-w-2xl md:mx-auto md:rounded-t-2xl bg-background border-t"
        showCloseButton={true}
      >
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="text-2xl font-bold  flex items-center gap-2">
            <MusicIcon className="h-6 w-6 text-primary" />
            Guitar Tuner
          </SheetTitle>
          <SheetDescription className="">
            Tune your guitar with precision using our advanced pitch detection. 
            Play a string and follow the visual and audio feedback.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto pb-6">
          <div className="w-full max-w-md mx-auto">
            <GuitarTuner />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
