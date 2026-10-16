import { useState, useEffect, useRef } from 'react';
import { Play, Pause, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { rand, record } from '../gameUtils';

export default function Snake() {
  const [snake, setSnake] = useState([
      [7, 7],
      [6, 7],
      [5, 7],
    ]),
    [food, setFood] = useState([rand(14), rand(14)]),
    [dir, setDir] = useState([1, 0]),
    [running, setRunning] = useState(false),
    [over, setOver] = useState(false),
    [score, setScore] = useState(0);
  const ref = useRef({ snake, food, dir, over });
  ref.current = { snake, food, dir, over };
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const d: Record<string, number[]> = {
        ArrowUp: [0, -1],
        w: [0, -1],
        ArrowDown: [0, 1],
        s: [0, 1],
        ArrowLeft: [-1, 0],
        a: [-1, 0],
        ArrowRight: [1, 0],
        d: [1, 0],
      };
      if (d[e.key]) {
        e.preventDefault();
        const n = d[e.key];
        if (n[0] !== -dir[0] || n[1] !== -dir[1]) setDir(n);
      }
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [dir]);
  useEffect(() => {
    if (!running || over) return;
    const t = setInterval(() => {
      const { snake, food, dir } = ref.current;
      const h = [snake[0][0] + dir[0], snake[0][1] + dir[1]],
        eat = h[0] === food[0] && h[1] === food[1];
      if (
        h[0] < 0 ||
        h[0] >= 14 ||
        h[1] < 0 ||
        h[1] >= 14 ||
        snake.some((p, i) => i > 0 && p[0] === h[0] && p[1] === h[1])
      ) {
        setOver(true);
        setRunning(false);
        record('snake', score, `${score} points`);
        return;
      }
      setSnake([h, ...snake.slice(0, eat ? snake.length : snake.length - 1)]);
      if (eat) {
        setScore((s) => s + 1);
        setFood([rand(14), rand(14)]);
      }
    }, 160);
    return () => clearInterval(t);
  }, [running, over, score]);
  return (
    <div className="mini-game">
      <div className="game-stat">
        <span>Apples</span>
        <b>{score}</b>
      </div>
      <h2>{over ? 'Game over' : running ? 'Stay sharp.' : 'Ready to slither?'}</h2>
      <p>Use arrow keys or WASD to move.</p>
      <div className="snake-board">
        {Array.from({ length: 196 }, (_, i) => {
          const x = i % 14,
            y = Math.floor(i / 14),
            si = snake.findIndex((p) => p[0] === x && p[1] === y);
          return (
            <div
              key={i}
              className={
                si === 0
                  ? 'snake-head'
                  : si > 0
                    ? 'snake-body'
                    : food[0] === x && food[1] === y
                      ? 'snake-food'
                      : ''
              }
            />
          );
        })}
      </div>
      <button
        className="button button-dark"
        onClick={() => {
          if (over) {
            setSnake([
              [7, 7],
              [6, 7],
              [5, 7],
            ]);
            setFood([rand(14), rand(14)]);
            setDir([1, 0]);
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
