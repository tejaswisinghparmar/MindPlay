import { useState, useEffect, useRef } from 'react';
import { rand, record } from '../gameUtils';

export default function Reaction() {
  const [phase, setPhase] = useState('idle'),
    [start, setStart] = useState(0),
    [result, setResult] = useState<number | null>(null);
  const timer = useRef<any>(null);
  function begin() {
    setResult(null);
    setPhase('wait');
    timer.current = setTimeout(
      () => {
        setStart(performance.now());
        setPhase('go');
      },
      1000 + rand(2500),
    );
  }
  function hit() {
    if (phase === 'wait') {
      clearTimeout(timer.current);
      setPhase('early');
    } else if (phase === 'go') {
      const ms = Math.round(performance.now() - start);
      setResult(ms);
      setPhase('result');
      record('reaction', ms, `${ms} ms`);
    }
  }
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div className="mini-game">
      <h2>
        {phase === 'go'
          ? 'NOW!'
          : phase === 'wait'
            ? 'Wait for green…'
            : phase === 'early'
              ? 'Too soon!'
              : phase === 'result'
                ? `${result} ms`
                : 'How fast are your reflexes?'}
      </h2>
      <p>
        {phase === 'idle'
          ? 'Start, wait for the color to change, then tap as quickly as you can.'
          : phase === 'result'
            ? 'Try again to beat your time.'
            : phase === 'early'
              ? 'You jumped the gun. Try again.'
              : 'Click the field when it turns green.'}
      </p>
      <button
        className={`reaction-field ${phase === 'go' ? 'is-go' : ''} ${phase === 'wait' ? 'is-wait' : ''}`}
        onClick={phase === 'idle' || phase === 'result' || phase === 'early' ? begin : hit}
      >
        {phase === 'idle' || phase === 'result' || phase === 'early'
          ? 'Start test'
          : phase === 'go'
            ? 'TAP!'
            : 'Wait…'}
      </button>
    </div>
  );
}
