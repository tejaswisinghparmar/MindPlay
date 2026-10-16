import { useState, useEffect } from 'react';
import { Play, Pause, ArrowLeft, ArrowRight } from 'lucide-react';
import { rand, record } from '../gameUtils';

export default function SpaceDodger() {
  const [x, setX] = useState(50),
    [rocks, setRocks] = useState([
      { x: 22, y: 10 },
      { x: 75, y: 40 },
      { x: 40, y: 70 },
    ]),
    [score, setScore] = useState(0),
    [running, setRunning] = useState(false),
    [over, setOver] = useState(false);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') setX((x) => Math.max(5, x - 5));
      if (e.key === 'ArrowRight' || e.key === 'd') setX((x) => Math.min(95, x + 5));
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, []);
  useEffect(() => {
    if (!running || over) return;
    const t = setInterval(() => {
      setRocks((r) =>
        r
          .map((o) => ({ ...o, y: o.y + 3 }))
          .map((o) => (o.y > 100 ? { x: 5 + rand(90), y: -10 } : o)),
      );
      setScore((s) => s + 1);
      const hit = rocks.some((o) => o.y > 80 && o.y < 95 && Math.abs(o.x - x) < 8);
      if (hit) {
        setOver(true);
        setRunning(false);
        record('space-dodger', score, `${score} survived`);
      }
    }, 150);
    return () => clearInterval(t);
  }, [running, over, rocks, x, score]);
  return (
    <div className="mini-game">
      <h2>{over ? 'Mission over.' : running ? 'Dodge incoming!' : 'Ready for lift-off?'}</h2>
      <p>Move left and right with arrow keys or A / D.</p>
      <div className="space-field" tabIndex={0}>
        <div className="space-score">{score}</div>
        {rocks.map((o, i) => (
          <span key={i} className="asteroid" style={{ left: `${o.x}%`, top: `${o.y}%` }}>
            ✦
          </span>
        ))}
        <span className="ship" style={{ left: `${x}%` }}>
          ▲
        </span>
        <div className="space-touch">
          <button onClick={() => setX((v) => Math.max(5, v - 8))}>
            <ArrowLeft />
          </button>
          <button onClick={() => setX((v) => Math.min(95, v + 8))}>
            <ArrowRight />
          </button>
        </div>
      </div>
      <button
        className="button button-dark"
        onClick={() => {
          if (over) {
            setRocks([
              { x: 22, y: 10 },
              { x: 75, y: 40 },
              { x: 40, y: 70 },
            ]);
            setScore(0);
            setOver(false);
          }
          setRunning((v) => !v);
        }}
      >
        {running ? <Pause size={15} /> : <Play size={15} />}{' '}
        {running ? 'Pause' : over ? 'Play again' : 'Start'}
      </button>
    </div>
  );
}
