import { useState } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import { rand, record } from '../gameUtils';

export default function GuessNumber({ id }: { id: string }) {
  const [target, setTarget] = useState(() => 1 + rand(6)),
    [tries, setTries] = useState(0),
    [msg, setMsg] = useState('Choose a number from 1 to 6.'),
    [done, setDone] = useState(false);
  function guess(n: number) {
    if (done) return;
    const t = tries + 1;
    setTries(t);
    if (n === target) {
      setMsg(`You got it in ${t} ${t === 1 ? 'try' : 'tries'}!`);
      setDone(true);
      record(id, Math.max(0, 7 - t), `${t} tries`);
    } else setMsg(n < target ? 'A little higher. Try again.' : 'A little lower. Try again.');
  }
  return (
    <div className="mini-game">
      <div className="game-stat">
        <span>Attempts</span>
        <b>{tries}</b>
      </div>
      <h2>{done ? 'Nicely done!' : 'What’s the number?'}</h2>
      <p>{msg}</p>
      <div className="number-choices">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button key={n} onClick={() => guess(n)} disabled={done}>
            {n}
          </button>
        ))}
      </div>
      {done && (
        <button
          className="button button-dark"
          onClick={() => {
            setTarget(1 + rand(6));
            setTries(0);
            setDone(false);
            setMsg('Choose a number from 1 to 6.');
          }}
        >
          Play again <RotateCcw size={15} />
        </button>
      )}
    </div>
  );
}
