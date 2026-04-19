"use client";

import { useState, useMemo } from "react";
import { useTerms } from "../hooks/use-terms";
import { Term, TermCategory } from "../types/terms.types";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { SearchIcon, BookOpenIcon } from "lucide-react";

interface TermSearchProps {
  onSelect?: (term: Term) => void;
  placeholder?: string;
  className?: string;
}

export function TermSearch({
  onSelect,
  placeholder = "Search music terms...",
  className,
}: TermSearchProps) {
  const { data: termsData, isLoading } = useTerms();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!termsData || !query.trim()) return termsData?.categories ?? [];

    const q = query.toLowerCase();
    return termsData.categories
      .map((category: TermCategory) => ({
        ...category,
        terms: category.terms.filter((term: Term) =>
          term.term.toLowerCase().includes(q)
        ),
      }))
      .filter((category: TermCategory) => category.terms.length > 0);
  }, [termsData, query]);

  const handleSelect = (term: Term) => {
    onSelect?.(term);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <Button
        variant="outline"
        className={className}
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="mr-2 h-4 w-4" />
        {placeholder}
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Music Terms">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Loading terms...</CommandEmpty>
            ) : filteredCategories.length === 0 ? (
              <CommandEmpty>No terms found.</CommandEmpty>
            ) : (
              filteredCategories.map((category: TermCategory) => (
                <CommandGroup key={category.name} heading={category.name}>
                  {category.terms.map((term: Term) => (
                    <CommandItem
                      key={term.term}
                      onSelect={() => handleSelect(term)}
                      className="flex flex-col items-start gap-1"
                    >
                      <span className="font-medium">{term.term}</span>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {term.definition}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

interface InlineTermSearchProps {
  onSelect?: (term: Term) => void;
  placeholder?: string;
  className?: string;
}

export function InlineTermSearch({
  onSelect,
  placeholder = "Search terms...",
  className,
}: InlineTermSearchProps) {
  const { data: termsData, isLoading } = useTerms();
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!termsData || !query.trim()) return [];

    const q = query.toLowerCase();
    return termsData.categories
      .map((category: TermCategory) => ({
        ...category,
        terms: category.terms.filter((term: Term) =>
          term.term.toLowerCase().includes(q)
        ),
      }))
      .filter((category: TermCategory) => category.terms.length > 0);
  }, [termsData, query]);

  const handleSelect = (term: Term) => {
    onSelect?.(term);
    setQuery("");
  };

  return (
    <Command className={className}>
      <CommandInput
        placeholder={placeholder}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading ? (
          <CommandEmpty>Loading terms...</CommandEmpty>
        ) : query.trim() === "" ? (
          <CommandEmpty>Type to search for music terms...</CommandEmpty>
        ) : filteredCategories.length === 0 ? (
          <CommandEmpty>No terms found.</CommandEmpty>
        ) : (
          filteredCategories.map((category: TermCategory) => (
            <CommandGroup key={category.name} heading={category.name}>
              {category.terms.map((term: Term) => (
                <CommandItem
                  key={term.term}
                  onSelect={() => handleSelect(term)}
                  className="flex flex-col items-start gap-1"
                >
                  <span className="font-medium">{term.term}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {term.definition}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))
        )}
      </CommandList>
    </Command>
  );
}

interface TermGlossaryProps {
  className?: string;
}

export function TermGlossary({ className }: TermGlossaryProps) {
  const { data: termsData, isLoading } = useTerms();

  if (isLoading) {
    return (
      <div className={className}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-6 w-32 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!termsData) {
    return (
      <div className={className}>
        <p className="text-muted-foreground">Failed to load terms.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-6">
        <BookOpenIcon className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Music Terms Glossary</h2>
      </div>
      <div className="space-y-8">
        {termsData.categories.map((category: TermCategory) => (
          <div key={category.name}>
            <h3 className="text-lg font-medium mb-3 text-muted-foreground">
              {category.name}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.terms.map((term: Term) => (
                <div
                  key={term.term}
                  className="rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium mb-1">{term.term}</p>
                  <p className="text-sm text-muted-foreground">
                    {term.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
