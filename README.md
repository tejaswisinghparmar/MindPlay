# MindPlay

A React + TypeScript + Vite mini-games site with a calm, premium interface.

## Run locally

```bash
npm install
npm run dev
```

Build for production with `npm run build`.

## What's improved in this revision

- Interactive original SVG anime-inspired mascot in the homepage hero. Hovering animates the character and speech bubble; clicking cycles friendly messages; the Surprise Me controls navigate to a random game. Reduced-motion preferences are respected.
- Word Guess selects a random five-letter answer from the included 1,000-word list, checks guesses against that list, handles repeated letters more accurately, prevents submissions after completion, and avoids repeating the immediately previous answer when possible.
- Chess now uses `chess.js` for legal moves, check/checkmate/draw states, castling, en passant and queen promotion rather than allowing arbitrary piece movement.
- Game code has been reorganized into more readable multi-line components where updated, with clearer names and comments.
- Existing page/card styling outside the hero has been preserved; new CSS is scoped to the hero mascot.

## Notes

This is a gameplay improvement pass, not a claim that every game has undergone exhaustive QA. Some mini-games still need dedicated edge-case tests and balancing. Scores and activity remain in local browser storage.
# MindPlay
