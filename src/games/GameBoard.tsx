import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { GameInfo } from '../lib/games';
import GuessNumber from './components/GuessNumber';
import TicTacToe from './components/TicTacToe';
import Twenty48 from './components/Twenty48';
import Memory from './components/Memory';
import MathGame from './components/MathGame';
import Reaction from './components/Reaction';
import PingPong from './components/PingPong';
import Snake from './components/Snake';
import WordGuess from './components/WordGuess';
import Sudoku from './components/Sudoku';
import Flappy from './components/Flappy';
import SpaceDodger from './components/SpaceDodger';
import Jigsaw from './components/Jigsaw';
import ChessLite from './components/ChessLite';

export default function GameBoard({ game }: { game: GameInfo }) {
  const [key, setKey] = useState(0);

  return (
    <div className="game-board-wrap">
      <div className="game-board-top">
        <div>
          <span className="eyebrow">READY WHEN YOU ARE</span>
          <p>Take your time. Have fun.</p>
        </div>
        <button className="soft-button" onClick={() => setKey((current) => current + 1)}>
          <RotateCcw size={15} /> Restart
        </button>
      </div>
      <div className="game-board" key={key}>
        {game.id === 'guess-number' ? (
          <GuessNumber id={game.id} />
        ) : game.id === 'tic-tac-toe' ? (
          <TicTacToe />
        ) : game.id === '2048' ? (
          <Twenty48 />
        ) : game.id === 'memory' ? (
          <Memory />
        ) : game.id === 'math' ? (
          <MathGame />
        ) : game.id === 'reaction' ? (
          <Reaction />
        ) : game.id === 'ping-pong' ? (
          <PingPong />
        ) : game.id === 'snake' ? (
          <Snake />
        ) : game.id === 'word-guess' ? (
          <WordGuess />
        ) : game.id === 'sudoku' ? (
          <Sudoku />
        ) : game.id === 'flappy' ? (
          <Flappy />
        ) : game.id === 'space-dodger' ? (
          <SpaceDodger />
        ) : game.id === 'jigsaw' ? (
          <Jigsaw />
        ) : (
          <ChessLite />
        )}
      </div>
    </div>
  );
}
