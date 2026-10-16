import { useState, useEffect } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import { question, record } from '../gameUtils';

export default function MathGame() {
  const [q, setQ] = useState(() => question()),
    [score, setScore] = useState(0),
    [left, setLeft] = useState(30),
    [active, setActive] = useState(false),
    [done, setDone] = useState(false);
  useEffect(() => {
    if (!active || done) return;
    const t = setInterval(
      () =>
        setLeft((s) => {
          if (s <= 1) {
            clearInterval(t);
            setDone(true);
            record('math', score, `${score} correct`);
            return 0;
          }
          return s - 1;
        }),
      1000,
    );
    return () => clearInterval(t);
  }, [active, done, score]);
  function answer(n: number) {
    if (!active || done) return;
    if (n === q.a) setScore((s) => s + 1);
    setQ(question());
  }
  return (
    <div className="mini-game">
      <div className="game-stat">
        <span>Time left</span>
        <b>{left}s</b>
        <span>Score</span>
        <b>{score}</b>
      </div>
      <h2>
        {done
          ? 'Time’s up!'
          : active
            ? `${q.x} ${q.op} ${q.y} = ?`
            : 'Ready for a quick brain warm-up?'}
      </h2>
      <p>{done ? `You solved ${score} correctly.` : 'Solve as many as you can in 30 seconds.'}</p>
      {!active && !done ? (
        <button className="button button-dark" onClick={() => setActive(true)}>
          <Play size={15} /> Start challenge
        </button>
      ) : (
        <>
          <div className="answer-grid">
            {q.options.map((n) => (
              <button key={n} disabled={done} onClick={() => answer(n)}>
                {n}
              </button>
            ))}
          </div>
          {done && (
            <button
              className="button button-dark"
              onClick={() => {
                setQ(question());
                setScore(0);
                setLeft(30);
                setDone(false);
                setActive(false);
              }}
            >
              Try again <RotateCcw size={15} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
