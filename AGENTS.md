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
- `src/app/world/[id]/` - World pages
- `src/app/level/[id]/` - Level pages (lesson content)
- `src/app/songs/` - Songs browser
- `src/app/practice/` - Practice mode
- `src/app/tools/` - Interactive tools
- `src/components/guitar/` - Fretboard, ChordDiagram, InteractiveFretboard, StrummingPattern
- `src/components/ui/` - Shadcn UI components
- `src/content/guitar/world-N/level-XXX.mdx` - MDX lesson files
- `src/data/` - JSON static data (chords, songs, strumming patterns)
- `src/hooks/` - useGuitarEngine (Tone.js), useProgress, useSongs, useLevels, useLeftHandMode
- `src/repositories/` - Dual implementation: `json/` (static) and `sqlite/` (persisted)
- `src/stores/` - Zustand stores
- `src/tools/` - Interactive tools (chord-explorer, fretboard-explorer, metronome-trainer, term-search)

## Key Patterns

- Audio via Tone.js: `useGuitarEngine` hook loads guitar samples
- Left-hand mode toggle via `useLeftHandMode` hook
- Route params use `[id]` folders
- Repository pattern with interfaces in `src/repositories/interfaces/`

## Styling

- Tailwind CSS v4: no `tailwind.config.js`, theme defined in `src/app/globals.css` using CSS variables
- CSS imports: `@import "tailwindcss"`, `@import "tw-animate-css"`, `@plugin "@tailwindcss/typography"`, `@import "shadcn/tailwind.css"`

## Testing

No test framework. Manual verification via browser.