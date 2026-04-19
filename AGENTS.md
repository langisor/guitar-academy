# Guitar Academy

Next.js 16.2.3 + React 19.2.4 + Tailwind CSS 4 + TypeScript 5

## Developer Commands

```bash
pnpm dev      # Start dev server (localhost:3000)
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint    # Run ESLint
pnpm seed     # Seed database (tsx src/db/seed.ts)
```

## Architecture

- `src/app/` - Next.js App Router pages
- `src/components/guitar/` - Fretboard, ChordDiagram, InteractiveFretboard, StrummingPattern
- `src/content/` - MDX lesson files (world-1 through world-10)
- `src/data/` - JSON static data (chords.json, songs.json, strumming.json)
- `src/hooks/` - useGuitarEngine (Tone.js), useProgress, useSongs, useLevels
- `src/repositories/` - Dual implementation: `json/` (static) and `sqlite/` (persisted)
- `src/stores/` - Zustand stores for client state

## Key Patterns

- Route params use `[id]` folders (e.g., `src/app/level/[id]/page.tsx`)
- MDX files in `src/content/guitar/world-N/level-XXX.mdx` are lesson content
- Repository pattern: `ISongRepository`, `IProgressRepository` interfaces in `src/repositories/interfaces/`
- Audio via Tone.js: `useGuitarEngine` hook loads guitar samples
- Left-hand mode toggle via `useLeftHandMode` hook
- UI components in `src/components/ui/` (Button, Card, Badge, Progress)

## Testing

No test framework configured. Manual verification via `pnpm dev` and browser.

## Gotchas

- Next.js 16 has breaking changes from v14/15; check `node_modules/next/dist/docs/` if unsure
- ESLint uses flat config (`eslint.config.mjs`)
- Tailwind CSS v4 (different from v3 config)
- Uses `pnpm` exclusively (check `pnpm-lock.yaml`)