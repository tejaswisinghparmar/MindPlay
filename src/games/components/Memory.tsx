import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { record, shuffle } from '../gameUtils';

export default function Memory() {
  const vals = ['✦', '◈', '●', '▲', '◆', '✿'];
  const [deck, setDeck] = useState(() => shuffle([...vals, ...vals].map((v, i) => ({ v, id: i })))),
    [open, setOpen] = useState<number[]>([]),
    [matched, setMatched] = useState<number[]>([]),
    [moves, setMoves] = useState(0);
  function flip(i: number) {
    if (open.length === 2 || open.includes(i) || matched.includes(i)) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      if (deck[next[0]].v === deck[next[1]].v) {
        setMatched((m) => [...m, ...next]);
        setOpen([]);
        if (matched.length + 2 === deck.length)
          record('memory', Math.max(0, 100 - moves), `${moves + 1} moves`);
      } else setTimeout(() => setOpen([]), 650);
    }
  }
  return (
    <div className="mini-game">
      <div className="game-stat">
        <span>Moves</span>
        <b>{moves}</b>
        <span>Pairs</span>
        <b>{matched.length / 2}/6</b>
      </div>
      <h2>Find the matching pairs.</h2>
      <p>Remember what you see, then find its partner.</p>
      <div className="memory-grid">
        {deck.map((d, i) => (
          <button
            key={d.id}
            className={open.includes(i) || matched.includes(i) ? 'flipped' : ''}
            onClick={() => flip(i)}
          >
            {open.includes(i) || matched.includes(i) ? d.v : '?'}
          </button>
        ))}
      </div>
      <button
        className="button button-dark"
        onClick={() => {
          setDeck(shuffle([...vals, ...vals].map((v, i) => ({ v, id: i }))));
          setOpen([]);
          setMatched([]);
          setMoves(0);
        }}
      >
        <RotateCcw size={15} /> Shuffle cards
      </button>
    </div>
  );
}
