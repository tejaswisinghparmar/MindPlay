import { useState, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { Chess } from 'chess.js';
import { record } from '../gameUtils';

export default function ChessLite() {
  const engine = useRef(new Chess());

  const [position, setPosition] = useState(engine.current.fen());

  const [selected, setSelected] = useState<string | null>(null);

  const [message, setMessage] = useState('White to move. Select a piece, then a destination.');

  const game = engine.current;

  const board = game.board();

  const glyph: Record<string, string> = {
    wk: '♔',
    wq: '♕',
    wr: '♖',
    wb: '♗',
    wn: '♘',
    wp: '♙',
    bk: '♚',
    bq: '♛',
    br: '♜',
    bb: '♝',
    bn: '♞',
    bp: '♟',
  };

  function clickSquare(square: string) {
    if (game.isGameOver()) return;

    if (!selected) {
      const piece = game.get(square as never);

      if (piece && piece.color === game.turn()) setSelected(square);

      return;
    }

    try {
      const move = game.move({ from: selected, to: square, promotion: 'q' });

      if (move) {
        setPosition(game.fen());

        setSelected(null);

        if (game.isCheckmate()) {
          setMessage(`Checkmate — ${game.turn() === 'w' ? 'Black' : 'White'} wins!`);

          record('chess', 1, `${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate`);
        } else if (game.isDraw()) {
          setMessage('Draw. Well played!');

          record('chess', 0, 'Draw');
        } else {
          setMessage(
            `${game.turn() === 'w' ? 'White' : 'Black'} to move${game.isCheck() ? ' — check!' : '.'}`,
          );
        }
      } else {
        const piece = game.get(square as never);

        setSelected(piece && piece.color === game.turn() ? square : null);
      }
    } catch {
      const piece = game.get(square as never);

      setSelected(piece && piece.color === game.turn() ? square : null);
    }
  }

  function reset() {
    game.reset();

    setPosition(game.fen());

    setSelected(null);

    setMessage('White to move. Select a piece, then a destination.');
  }

  // Referencing position forces a render after each accepted move.

  void position;

  return (
    <div className="mini-game">
      <h2>
        {game.isCheckmate() ? 'Checkmate!' : game.isDraw() ? 'Game drawn' : 'Chess, at your pace.'}
      </h2>
      <p>{message}</p>
      <div className="chess-board">
        {board.flatMap((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const square = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`;

            const key = piece ? `${piece.color}${piece.type}` : '';

            return (
              <button
                key={square}
                aria-label={`${square}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
                onClick={() => clickSquare(square)}
                className={`${(rowIndex + colIndex) % 2 ? 'dark-square' : 'light-square'} ${selected === square ? 'selected' : ''}`}
              >
                {key ? glyph[key] : ''}
              </button>
            );
          }),
        )}
      </div>
      <p className="muted-copy">
        Legal moves, check, checkmate, castling, en passant, and queen promotion are handled by the
        chess rules engine.
      </p>
      <button className="button button-dark" onClick={reset}>
        <RotateCcw size={15} /> New game
      </button>
    </div>
  );
}
