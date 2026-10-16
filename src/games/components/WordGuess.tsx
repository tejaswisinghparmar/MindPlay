import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { WORD_LIST } from '../wordlist';
import { rand, record } from '../gameUtils';

export default function WordGuess() {
  const pickWord = () => WORD_LIST[rand(WORD_LIST.length)];

  const [answer, setAnswer] = useState<string>(() => pickWord());

  const [guess, setGuess] = useState('');

  const [rows, setRows] = useState<string[]>([]);

  const [done, setDone] = useState(false);

  const [msg, setMsg] = useState('Six tries. One five-letter word.');

  function submit() {
    if (guess.length !== 5) {
      setMsg('Enter a five-letter word.');

      return;
    }

    const word = guess.toUpperCase();

    if (!WORD_LIST.some((entry) => entry === word)) {
      setMsg('That word is not in this simple-English list. Try another.');

      return;
    }

    const next = [...rows, word];

    setRows(next);

    setGuess('');

    if (word === answer) {
      setDone(true);

      setMsg('You found the word!');

      record('word-guess', 7 - next.length, `${next.length} tries`);
    } else if (next.length >= 6) {
      setDone(true);

      setMsg(`The word was ${answer}. Better luck next round!`);

      record('word-guess', 0, 'Not solved');
    } else {
      setMsg('Not quite. Green is correct, yellow is in the word.');
    }
  }

  function tileStatuses(word: string) {
    const statuses = Array(5).fill('absent');

    const remaining: Record<string, number> = {};

    for (let index = 0; index < 5; index += 1) {
      if (word[index] === answer[index]) {
        statuses[index] = 'correct';
      } else {
        remaining[answer[index]] = (remaining[answer[index]] || 0) + 1;
      }
    }

    for (let index = 0; index < 5; index += 1) {
      if (statuses[index] === 'correct') continue;

      if (remaining[word[index]] > 0) {
        statuses[index] = 'present';

        remaining[word[index]] -= 1;
      }
    }

    return statuses;
  }

  function newRound() {
    setAnswer((current) => {
      if (WORD_LIST.length < 2) return pickWord();

      let next = pickWord();

      while (next === current) next = pickWord();

      return next;
    });

    setGuess('');

    setRows([]);

    setDone(false);

    setMsg('Six tries. One five-letter word.');
  }

  return (
    <div className="mini-game">
      <h2>{done ? 'Round complete' : 'Guess the hidden word.'}</h2>
      <p>{msg}</p>
      <div className="word-rows">
        {Array.from({ length: 6 }, (_, row) => (
          <div key={row} className="word-row">
            {Array.from({ length: 5 }, (_, col) => {
              const value = rows[row]?.[col] || (row === rows.length ? guess[col] || '' : '');

              const statuses = rows[row] ? tileStatuses(rows[row]) : [];

              return (
                <span className={statuses[col] || ''} key={col}>
                  {value}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      {!done && (
        <form
          className="word-form"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <input
            aria-label="Five-letter guess"
            autoComplete="off"
            value={guess}
            onChange={(event) =>
              setGuess(
                event.target.value
                  .replace(/[^a-z]/gi, '')
                  .slice(0, 5)
                  .toUpperCase(),
              )
            }
            maxLength={5}
            placeholder="TYPE WORD"
          />
          <button className="button button-dark" type="submit">
            Submit
          </button>
        </form>
      )}
      <button className="soft-button" onClick={newRound}>
        <RotateCcw size={15} /> New round
      </button>
    </div>
  );
}
