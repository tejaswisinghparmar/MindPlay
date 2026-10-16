import { useState } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { record } from '../gameUtils';

export default function Sudoku() {
  const puzzle = [
    5, 3, 0, 0, 7, 0, 0, 0, 0, 6, 0, 0, 1, 9, 5, 0, 0, 0, 0, 9, 8, 0, 0, 0, 0, 6, 0, 8, 0, 0, 0, 6,
    0, 0, 0, 3, 4, 0, 0, 8, 0, 3, 0, 0, 1, 7, 0, 0, 0, 2, 0, 0, 0, 6, 0, 6, 0, 0, 0, 0, 2, 8, 0, 0,
    0, 0, 4, 1, 9, 0, 0, 5, 0, 0, 0, 0, 8, 0, 0, 7, 9,
  ];
  const [vals, setVals] = useState(puzzle),
    [sel, setSel] = useState(0),
    [msg, setMsg] = useState('Select an empty cell, then choose a number.');
  function put(n: number) {
    if (puzzle[sel]) return;
    const v = [...vals];
    v[sel] = n;
    setVals(v);
    if (v.every(Boolean)) {
      setMsg('Grid filled! Check each row, column and box.');
      if (v.every((x, i) => x === puzzle[i] || x > 0)) record('sudoku', 1, 'Grid filled');
    }
  }
  return (
    <div className="mini-game">
      <h2>Find your flow.</h2>
      <p>{msg}</p>
      <div className="sudoku-grid">
        {vals.map((v, i) => (
          <button
            key={i}
            onClick={() => setSel(i)}
            className={`${sel === i ? 'selected' : ''} ${puzzle[i] ? 'fixed' : ''}`}
            style={{
              borderRight: i % 9 === 2 || i % 9 === 5 ? '2px solid var(--line-strong)' : undefined,
              borderBottom:
                Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5
                  ? '2px solid var(--line-strong)'
                  : undefined,
            }}
          >
            {v || ''}
          </button>
        ))}
      </div>
      <div className="sudoku-numbers">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} onClick={() => put(n)}>
            {n}
          </button>
        ))}
        <button
          onClick={() => {
            if (!puzzle[sel]) setVals((v) => v.map((x, i) => (i === sel ? 0 : x)));
          }}
        >
          ⌫
        </button>
      </div>
      <button
        className="soft-button"
        onClick={() => {
          setVals(puzzle);
          setMsg('Select an empty cell, then choose a number.');
        }}
      >
        <RotateCcw size={15} /> Reset puzzle
      </button>
    </div>
  );
}
