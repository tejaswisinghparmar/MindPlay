import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { record, winner } from '../gameUtils';

export default function TicTacToe() {
  const [board, setBoard] = useState<string[]>(Array(9).fill('')),
    [turn, setTurn] = useState('X');
  const win = winner(board);
  function play(i: number) {
    if (board[i] || win) return;
    const b = [...board];
    b[i] = turn;
    setBoard(b);
    setTurn(turn === 'X' ? 'O' : 'X');
    if (winner(b)) {
      record('tic-tac-toe', 1, `${turn} wins`);
    } else if (b.every(Boolean)) record('tic-tac-toe', 0, 'Draw');
  }
  return (
    <div className="mini-game">
      <h2>{win ? `${win} wins!` : board.every(Boolean) ? 'It’s a draw!' : `${turn}’s turn`}</h2>
      <p>Take turns choosing a square.</p>
      <div className="ttt-grid">
        {board.map((v, i) => (
          <button key={i} onClick={() => play(i)} className={v ? 'marked' : ''}>
            {v}
          </button>
        ))}
      </div>
      <button
        className="button button-dark"
        onClick={() => {
          setBoard(Array(9).fill(''));
          setTurn('X');
        }}
      >
        <RotateCcw size={15} /> New round
      </button>
    </div>
  );
}
