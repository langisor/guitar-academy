# Guitar Academy

Next.js 16.2.3 + React 19.2.4 + Tailwind CSS 4 + TypeScript 5

## Developer Commands

```bash
pnpm dev      # Start dev server (localhost:3000)
pnpm build    # Production build (includes typecheck)
pnpm start    # Start production server
pnpm lint     # Run ESLint
pnpm seed     # Seed database (tsx src/db/seed.ts)
```

## Architecture

- `src/app/` - Next.js App Router pages
- `src/components/guitar/` - Fretboard, ChordDiagram, InteractiveFretboard, StrummingPattern
- `src/content/` - MDX lesson files (world-1 through world-10)
- `src/data/` - JSON static data (chords.json, songs.json, strumming.json, guitar/)
- `src/hooks/` - useGuitarEngine (Tone.js), useProgress, useSongs, useLevels, useLeftHandMode
- `src/repositories/` - Dual implementation: `json/` (static) and `sqlite/` (persisted)
- `src/stores/` - Zustand stores for client state
- `src/tools/` - Interactive tools (chord-explorer, fretboard-explorer, metronome-trainer, term-search)

## Key Patterns

- Route params use `[id]` folders (e.g., `src/app/level/[id]/page.tsx`)
- MDX files in `src/content/guitar/world-N/level-XXX.mdx` are lesson content
- Repository pattern with interfaces in `src/repositories/interfaces/`
- Audio via Tone.js: `useGuitarEngine` hook loads guitar samples
- Left-hand mode toggle via `useLeftHandMode` hook
- UI components in `src/components/ui/` (Button, Card, Badge, Progress)
- Interactive tools in `src/tools/` (chord-explorer, fretboard-explorer, metronome-trainer, term-search)

## Testing

No test framework. Manual verification via browser.

## Gotchas

- Next.js 16 breaking changes from v14/15
- ESLint uses flat config (`eslint.config.mjs`)
- Tailwind CSS v4 (no `tailwind.config.js`, uses CSS variables)
- Uses `pnpm` exclusively (no npm/yarn/bun)
- No separate typecheck script (build includes it)