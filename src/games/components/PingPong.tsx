import { useState, useEffect, useRef } from 'react';
import { RotateCcw, Play, Pause, ArrowUp, ArrowDown } from 'lucide-react';
import { record } from '../gameUtils';

export default function PingPong() {
  const canvas = useRef<HTMLCanvasElement>(null),
    [running, setRunning] = useState(false),
    [scores, setScores] = useState([0, 0]),
    [mode, setMode] = useState('ai'),
    [finished, setFinished] = useState(false);
  const game = useRef({
    x: 300,
    y: 180,
    vx: 4,
    vy: 2,
    p: 150,
    ai: 150,
    playerScore: 0,
    aiScore: 0,
    keys: new Set<string>(),
  });
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d') as CanvasRenderingContext2D;
    let raf = 0;
    const w = 600,
      h = 360;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle =
        getComputedStyle(document.documentElement).getPropertyValue('--board').trim() || '#eef2fa';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(90,120,180,.35)';
      ctx.setLineDash([8, 9]);
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      ctx.setLineDash([]);
      const g = game.current;
      ctx.fillStyle = '#4385ff';
      ctx.beginPath();
      ctx.roundRect(18, g.p, 10, 62, 5);
      ctx.fill();
      ctx.fillStyle = '#9b8aff';
      ctx.beginPath();
      ctx.roundRect(w - 28, g.ai, 10, 62, 5);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(30,60,100,.2)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (running && !finished) {
        if (g.keys.has('ArrowUp') || g.keys.has('w')) g.p -= 5;
        if (g.keys.has('ArrowDown') || g.keys.has('s')) g.p += 5;
        g.p = Math.max(0, Math.min(h - 62, g.p));
        if (mode === 'ai') g.ai += (g.y - (g.ai + 31)) * 0.075;
        else {
          if (g.keys.has('i')) g.ai -= 5;
          if (g.keys.has('k')) g.ai += 5;
        }
        g.ai = Math.max(0, Math.min(h - 62, g.ai));
        g.x += g.vx;
        g.y += g.vy;
        if (g.y < 8 || g.y > h - 8) g.vy *= -1;
        if (g.x < 36 && g.y > g.p - 8 && g.y < g.p + 70) g.vx = Math.abs(g.vx) * 1.04;
        if (g.x > w - 36 && g.y > g.ai - 8 && g.y < g.ai + 70) g.vx = -Math.abs(g.vx) * 1.04;
        if (g.x < 0 || g.x > w) {
          const left = g.x < 0;
          const next = [scores[0] + (left ? 0 : 1), scores[1] + (left ? 1 : 0)];
          setScores(next);
          g.playerScore = next[0];
          g.aiScore = next[1];
          if (Math.max(...next) >= 7) {
            setFinished(true);
            setRunning(false);
            record('ping-pong', left ? next[1] : next[0], left ? 'AI wins' : 'Player wins');
          }
          g.x = w / 2;
          g.y = h / 2;
          g.vx = (left ? -1 : 1) * 4;
          g.vy = Math.random() * 4 - 2;
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [running, mode, finished, scores]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
        game.current.keys.add(e.key);
        if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
      },
      up = (e: KeyboardEvent) => game.current.keys.delete(e.key);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);
  function reset() {
    game.current = {
      ...game.current,
      x: 300,
      y: 180,
      vx: 4,
      vy: 2,
      p: 150,
      ai: 150,
      playerScore: 0,
      aiScore: 0,
    };
    setScores([0, 0]);
    setFinished(false);
    setRunning(false);
  }
  return (
    <div className="mini-game ping-game">
      <div className="game-stat">
        <span>You</span>
        <b>{scores[0]}</b>
        <span>{mode === 'ai' ? 'AI' : 'Player 2'}</span>
        <b>{scores[1]}</b>
      </div>
      <h2>
        {finished
          ? scores[0] > scores[1]
            ? 'You win the match!'
            : 'Match complete!'
          : 'First to 7 wins.'}
      </h2>
      <p>Move with ↑ / ↓ or W / S. Player two uses I / K.</p>
      <canvas ref={canvas} width="600" height="360" className="ping-canvas" />
      <div className="pong-controls">
        <label>
          Opponent{' '}
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              reset();
            }}
          >
            <option value="ai">Play vs AI</option>
            <option value="local">Two players</option>
          </select>
        </label>
        <button
          className="button button-dark"
          onClick={() => (finished ? reset() : setRunning((v) => !v))}
        >
          {running ? <Pause size={15} /> : <Play size={15} />}{' '}
          {running ? 'Pause' : finished ? 'New match' : 'Start rally'}
        </button>
        <button className="soft-button" onClick={reset}>
          <RotateCcw size={15} /> Reset
        </button>
      </div>
    </div>
  );
}
