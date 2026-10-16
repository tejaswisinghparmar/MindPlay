import { useState, useEffect } from 'react';
import { RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { addTile, newBoard, record } from '../gameUtils';

export default function Twenty48() {
  const [board, setBoard] = useState(() => newBoard()),
    [score, setScore] = useState(0),
    [over, setOver] = useState(false);
  function move(dir: string) {
    if (over) return;
    let b = board.map((r) => [...r]),
      gain = 0;
    for (let line = 0; line < 4; line++) {
      let coords = Array.from({ length: 4 }, (_, i) =>
        dir === 'left'
          ? [line, i]
          : dir === 'right'
            ? [line, 3 - i]
            : dir === 'up'
              ? [i, line]
              : [3 - i, line],
      );
      let vals = coords.map(([r, c]) => b[r][c]).filter(Boolean);
      for (let i = 0; i < vals.length - 1; i++)
        if (vals[i] === vals[i + 1]) {
          vals[i] *= 2;
          gain += vals[i];
          vals.splice(i + 1, 1);
        }
      vals = [...vals, ...Array(4 - vals.length).fill(0)];
      coords.forEach(([r, c], i) => (b[r][c] = vals[i]));
    }
    if (JSON.stringify(b) !== JSON.stringify(board)) {
      b = addTile(b);
      setBoard(b);
      setScore((s) => s + gain);
      if (
        !b.some((r) => r.includes(0)) &&
        !b.some((r, i) =>
          r.some((v, j) => (i < 3 && b[i + 1][j] === v) || (j < 3 && r[j + 1] === v)),
        )
      ) {
        setOver(true);
        record('2048', score + gain, `${score + gain} points`);
      }
    }
  }
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const m: Record<string, string> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      };
      if (m[e.key]) {
        e.preventDefault();
        move(m[e.key]);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  });
  return (
    <div className="mini-game">
      <div className="game-stat">
        <span>Score</span>
        <b>{score}</b>
      </div>
      <h2>Make it to 2048.</h2>
      <p>Use your arrow keys or the controls below to slide the tiles.</p>
      <div className="tile-board">
        {board.flat().map((v, i) => (
          <div className={`tile tile-${Math.min(v, 2048)}`} key={i}>
            {v || ''}
          </div>
        ))}
      </div>
      <div className="dpad-controls">
        <button onClick={() => move('up')}>
          <ArrowUp />
        </button>
        <div>
          <button onClick={() => move('left')}>
            <ArrowLeft />
          </button>
          <button onClick={() => move('down')}>
            <ArrowDown />
          </button>
          <button onClick={() => move('right')}>
            <ArrowRight />
          </button>
        </div>
      </div>
      {over && <p className="success-message">No more moves. Score: {score}</p>}
      <button
        className="button button-dark"
        onClick={() => {
          setBoard(newBoard());
          setScore(0);
          setOver(false);
        }}
      >
        <RotateCcw size={15} /> New game
      </button>
    </div>
  );
}
