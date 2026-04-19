"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTermByName } from "../hooks/use-terms";
import { cn } from "@/lib/utils";

interface TermTooltipProps {
  term: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function TermTooltip({
  term,
  children,
  className,
  side = "top",
}: TermTooltipProps) {
  const { data: termData, isLoading } = useTermByName(term);

  const hasDefinition = !!termData?.definition;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("cursor-help underline decoration-dotted", className)}>
            {children}
          </span>
        </TooltipTrigger>
        {hasDefinition && (
          <TooltipContent side={side} className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold">{termData.term}</p>
              <p className="text-muted-foreground">{termData.definition}</p>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

interface TermDefinitionProps {
  term: string;
  className?: string;
}

export function TermDefinition({ term, className }: TermDefinitionProps) {
  const { data: termData, isLoading, isError } = useTermByName(term);

  if (isLoading) {
    return <span className={cn("animate-pulse", className)}>{term}</span>;
  }

  if (isError || !termData) {
    return <span className={className}>{term}</span>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("cursor-help underline decoration-dotted", className)}>
            {termData.term}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-muted-foreground">{termData.definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
