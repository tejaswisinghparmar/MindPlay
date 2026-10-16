# MindPlay

MindPlay is a browser-based collection of mini-games built with React, TypeScript, and Vite.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the development server.
- `npm run build` — run TypeScript checks and build for production.
- `npm run preview` — preview the production build locally.
- `npm run format` — format the project with Prettier.
- `npm run format:check` — check formatting without changing files.

## Source layout

```text
src/
├── games/
│   ├── components/     # One component per mini-game
│   ├── GameBoard.tsx   # Game selector and shared board wrapper
│   ├── gameUtils.ts    # Shared game and score helpers
│   └── wordlist.ts     # Word Guess vocabulary
├── lib/
│   └── games.ts        # Game metadata
├── App.tsx
├── main.tsx
└── styles.css
```

This structure separates game implementations while keeping the existing styling, game IDs, score storage, and gameplay logic in place.
