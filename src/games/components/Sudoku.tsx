import { useState } from 'react';
import { Check, RotateCcw, Sparkles } from 'lucide-react';
import { record } from '../gameUtils';

type SudokuGame = {
  puzzle: number[];
  solution: number[];
};

const SIZE = 9;
const BOX_SIZE = 3;
const EMPTY = 0;
const TARGET_EMPTY_CELLS = 42;

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

function getCandidates(board: number[], index: number): number[] {
  return shuffle(
    Array.from({ length: SIZE }, (_, i) => i + 1),
  ).filter((num) => isValidMove(board, index, num));
}

function isValidMove(
  board: number[],
  index: number,
  num: number,
): boolean {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;

  // Check the row and column.
  for (let i = 0; i < SIZE; i++) {
    if (i !== col && board[row * SIZE + i] === num) {
      return false;
    }

    if (i !== row && board[i * SIZE + col] === num) {
      return false;
    }
  }

  // Check the 3x3 box.
  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      const cellIndex = r * SIZE + c;

      if (cellIndex !== index && board[cellIndex] === num) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Find the next empty cell with the fewest valid candidates.
 * This makes the backtracking solver significantly more efficient.
 */
function findBestEmptyCell(
  board: number[],
): { index: number; candidates: number[] } | null {
  let best: { index: number; candidates: number[] } | null = null;

  for (let i = 0; i < board.length; i++) {
    if (board[i] !== EMPTY) continue;

    const candidates: number[] = [];

    for (let num = 1; num <= SIZE; num++) {
      if (isValidMove(board, i, num)) {
        candidates.push(num);
      }
    }

    if (candidates.length === 0) {
      return { index: i, candidates: [] };
    }

    if (!best || candidates.length < best.candidates.length) {
      best = { index: i, candidates };

      if (candidates.length === 1) break;
    }
  }

  return best;
}

/**
 * Count solutions up to a limit.
 * Stopping at two is enough to determine whether a puzzle
 * has exactly one solution.
 */
function countSolutions(board: number[], limit = 2): number {
  const next = findBestEmptyCell(board);

  if (!next) return 1;
  if (next.candidates.length === 0) return 0;

  let count = 0;

  for (const num of next.candidates) {
    board[next.index] = num;
    count += countSolutions(board, limit - count);
    board[next.index] = EMPTY;

    if (count >= limit) return count;
  }

  return count;
}

/**
 * Generate a complete valid solution by randomly rearranging
 * a standard Sudoku pattern's digits, rows, and columns.
 */
function generateSolution(): number[] {
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const bands = shuffle([0, 1, 2]);
  const stacks = shuffle([0, 1, 2]);

  const rows = bands.flatMap((band) =>
    shuffle([0, 1, 2]).map((row) => band * 3 + row),
  );

  const cols = stacks.flatMap((stack) =>
    shuffle([0, 1, 2]).map((col) => stack * 3 + col),
  );

  return rows.flatMap((row) =>
    cols.map((col) => {
      const pattern = (row * 3 + Math.floor(row / 3) + col) % SIZE;
      return digits[pattern];
    }),
  );
}

/**
 * Generate a randomized puzzle while preserving a unique solution.
 */
function createPuzzle(): SudokuGame {
  const solution = generateSolution();
  const puzzle = [...solution];
  const positions = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, i) => i),
  );

  let emptyCells = 0;

  for (const index of positions) {
    if (emptyCells >= TARGET_EMPTY_CELLS) break;

    const original = puzzle[index];
    puzzle[index] = EMPTY;

    // Keep this removal only if the solution remains unique.
    if (countSolutions([...puzzle]) === 1) {
      emptyCells++;
    } else {
      puzzle[index] = original;
    }
  }

  return { puzzle, solution };
}

function isSolved(board: number[], solution: number[]): boolean {
  if (board.length !== SIZE * SIZE || board.includes(EMPTY)) {
    return false;
  }

  // Check every row and column.
  for (let i = 0; i < SIZE; i++) {
    const row = board.slice(i * SIZE, i * SIZE + SIZE);
    const col = Array.from(
      { length: SIZE },
      (_, r) => board[r * SIZE + i],
    );

    if (new Set(row).size !== SIZE) return false;
    if (new Set(col).size !== SIZE) return false;
  }

  // Check all nine 3x3 boxes.
  for (let boxRow = 0; boxRow < SIZE; boxRow += BOX_SIZE) {
    for (let boxCol = 0; boxCol < SIZE; boxCol += BOX_SIZE) {
      const box: number[] = [];

      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          box.push(board[(boxRow + r) * SIZE + boxCol + c]);
        }
      }

      if (new Set(box).size !== SIZE) return false;
    }
  }

  // Require the exact solution generated for this puzzle.
  return board.every((value, index) => value === solution[index]);
}

export default function Sudoku() {
  const [game, setGame] = useState<SudokuGame>(() => createPuzzle());
  const [vals, setVals] = useState<number[]>(() => [...game.puzzle]);
  const [sel, setSel] = useState<number>(-1);
  const [msg, setMsg] = useState(
    'Select an empty cell, then choose a number.',
  );
  const [hasWon, setHasWon] = useState(false);
  const [mistakes, setMistakes] = useState<number[]>([]);

  const { puzzle, solution } = game;

  function put(num: number) {
    if (sel < 0 || puzzle[sel] !== EMPTY || hasWon) return;

    const next = [...vals];
    next[sel] = EMPTY;

    if (!isValidMove(next, sel, num)) {
      setMsg('That number conflicts with its row, column, or box.');
      setMistakes((current) => [...new Set([...current, sel])]);
      return;
    }

    next[sel] = num;
    setVals(next);
    setMistakes((current) => current.filter((i) => i !== sel));

    if (isSolved(next, solution)) {
      setHasWon(true);
      setMsg('Puzzle solved! Excellent work.');
      record('sudoku', 1, 'Puzzle solved');
      return;
    }

    if (next.every((value) => value !== EMPTY)) {
      setMsg('Grid filled, but the solution is incorrect.');
    } else if (num !== solution[sel]) {
      setMsg('Valid placement, but that number is not the solution.');
    } else {
      setMsg('Correct! Keep going.');
    }
  }

  function eraseSelected() {
    if (sel < 0 || puzzle[sel] !== EMPTY || hasWon) return;

    setVals((current) =>
      current.map((value, index) => (index === sel ? EMPTY : value)),
    );
    setMistakes((current) => current.filter((i) => i !== sel));
    setMsg('Cell cleared.');
  }

  function resetPuzzle() {
    setVals([...puzzle]);
    setSel(-1);
    setHasWon(false);
    setMistakes([]);
    setMsg('Puzzle reset. Give it another try.');
  }

  function newPuzzle() {
    const nextGame = createPuzzle();

    setGame(nextGame);
    setVals([...nextGame.puzzle]);
    setSel(-1);
    setHasWon(false);
    setMistakes([]);
    setMsg('New puzzle ready. Find your flow.');
  }

  const selectedValue = sel >= 0 ? vals[sel] : EMPTY;

  return (
    <div className="mini-game">
      <h2>Find your flow.</h2>

      <p aria-live="polite">{msg}</p>

      <div className="sudoku-grid">
        {vals.map((value, index) => {
          const isFixed = puzzle[index] !== EMPTY;
          const row = Math.floor(index / SIZE);
          const col = index % SIZE;

          return (
            <button
              key={index}
              type="button"
              aria-label={`Row ${row + 1}, column ${col + 1}: ${
                value || 'empty'
              }${isFixed ? ', fixed' : ''}`}
              aria-pressed={sel === index}
              onClick={() => setSel(index)}
              className={[
                sel === index ? 'selected' : '',
                isFixed ? 'fixed' : '',
                mistakes.includes(index) ? 'mistake' : '',
                sel >= 0 &&
                vals[sel] !== EMPTY &&
                value === vals[sel]
                  ? 'same-number'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                borderRight:
                  col === 2 || col === 5
                    ? '2px solid var(--line-strong)'
                    : undefined,
                borderBottom:
                  row === 2 || row === 5
                    ? '2px solid var(--line-strong)'
                    : undefined,
              }}
            >
              {value || ''}
            </button>
          );
        })}
      </div>

      <div className="sudoku-numbers">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => put(num)}
            disabled={hasWon || sel < 0 || puzzle[sel] !== EMPTY}
            aria-label={`Enter ${num}`}
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          onClick={eraseSelected}
          disabled={hasWon || sel < 0 || puzzle[sel] !== EMPTY}
          aria-label="Erase selected cell"
        >
          ⌫
        </button>
      </div>

      {hasWon && (
        <p className="sudoku-success" role="status">
          <Check size={16} /> Sudoku completed!
        </p>
      )}

      <button
        type="button"
        className="soft-button"
        onClick={resetPuzzle}
      >
        <RotateCcw size={15} /> Reset puzzle
      </button>

      <button
        type="button"
        className="soft-button"
        onClick={newPuzzle}
      >
        <Sparkles size={15} /> New puzzle
      </button>
    </div>
  );
}
