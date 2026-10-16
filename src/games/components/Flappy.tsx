import { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { record } from '../gameUtils';

export default function Flappy() {
  const [y, setY] = useState(50),
    [v, setV] = useState(0),
    [pipe, setPipe] = useState(85),
    [score, setScore] = useState(0),
    [running, setRunning] = useState(false),
    [over, setOver] = useState(false);
  const ref = useRef<any>({ y, v, pipe, score, running, over });
  ref.current = { y, v, pipe, score, running, over };
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (over) {
          setY(50);
          setV(-4);
          setPipe(85);
          setScore(0);
          setOver(false);
          setRunning(true);
        } else {
          setV(-4);
          setRunning(true);
        }
      }
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [over]);
  useEffect(() => {
    if (!running || over) return;
    const t = setInterval(() => {
      setV((v) => v + 0.35);
      setY((y) => {
        const ny = y + v;
        if (ny > 94 || ny < 3) {
          setOver(true);
          setRunning(false);
          record('flappy', score, `${score} gates`);
        }
        return Math.max(2, Math.min(96, ny));
      });
      setPipe((p) => {
        if (p < 0) {
          setScore((s) => s + 1);
          return 105;
        }
        return p - 2.1;
      });
    }, 35);
    return () => clearInterval(t);
  }, [running, over, v, score]);
  return (
    <div className="mini-game">
      <h2>{over ? 'Whoops!' : running ? 'Keep flying.' : 'A tiny flight of fancy.'}</h2>
      <p>Tap or press Space to flap and keep clear of the edges.</p>
      <div
        className="flappy-field"
        onClick={() => {
          if (over) {
            setY(50);
            setV(-4);
            setPipe(85);
            setScore(0);
            setOver(false);
          }
          setRunning(true);
          setV(-4);
        }}
      >
        <div className="flappy-score">{score}</div>
        <div className="bird" style={{ top: `${y}%` }}>
          ●
        </div>
        <div className="pipe pipe-top" style={{ left: `${pipe}%` }} />
        <div className="pipe pipe-bottom" style={{ left: `${pipe}%` }} />
      </div>
      <button
        className="button button-dark"
        onClick={() => {
          if (over) {
            setY(50);
            setV(0);
            setPipe(85);
            setScore(0);
            setOver(false);
          }
          setRunning((v) => !v);
        }}
      >
        {running ? <Pause size={15} /> : <Play size={15} />}{' '}
        {running ? 'Pause' : over ? 'Try again' : 'Start flight'}
      </button>
    </div>
  );
}
