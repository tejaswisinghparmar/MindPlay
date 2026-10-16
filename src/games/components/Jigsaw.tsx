import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { record, shuffle } from '../gameUtils';

export default function Jigsaw() {
  const [order, setOrder] = useState(() => shuffle(Array.from({ length: 9 }, (_, i) => i))),
    [selected, setSelected] = useState<number | null>(null),
    [moves, setMoves] = useState(0),
    [done, setDone] = useState(false);
  function click(i: number) {
    if (selected === null) {
      setSelected(i);
      return;
    }
    const a = [...order];
    [a[i], a[selected]] = [a[selected], a[i]];
    setOrder(a);
    setSelected(null);
    setMoves((m) => m + 1);
    if (a.every((v, j) => v === j)) {
      setDone(true);
      record('jigsaw', Math.max(0, 100 - moves), `${moves + 1} moves`);
    }
  }
  return (
    <div className="mini-game">
      <div className="game-stat">
        <span>Moves</span>
        <b>{moves}</b>
      </div>
      <h2>{done ? 'Picture complete!' : 'Put the picture together.'}</h2>
      <p>Choose two tiles to swap their positions. Complete the numbered grid.</p>
      <div className="jigsaw-grid">
        {order.map((v, i) => (
          <button
            key={i}
            className={`${selected === i ? 'selected' : ''} ${v === i ? 'in-place' : ''}`}
            onClick={() => click(i)}
          >
            <span>{v + 1}</span>
            <i style={{ backgroundPosition: `${(v % 3) * 50}% ${Math.floor(v / 3) * 50}%` }} />
          </button>
        ))}
      </div>
      <button
        className="button button-dark"
        onClick={() => {
          setOrder(shuffle(Array.from({ length: 9 }, (_, i) => i)));
          setSelected(null);
          setMoves(0);
          setDone(false);
        }}
      >
        <RotateCcw size={15} /> Shuffle puzzle
      </button>
    </div>
  );
}
