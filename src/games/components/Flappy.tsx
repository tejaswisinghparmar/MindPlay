
import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { record } from '../gameUtils';

const BIRD_X = 22;
const BIRD_RADIUS_X = 2.5;
const BIRD_RADIUS_Y = 3;
const PIPE_WIDTH = 8;
const PIPE_SPEED = 34;
const GRAVITY = 95;
const FLAP_STRENGTH = -34;
const GAP_HEIGHT = 32;
const MIN_GAP_CENTER = 23;
const MAX_GAP_CENTER = 77;

type GameState = {
  y: number;
  velocity: number;
  pipeX: number;
  gapCenter: number;
  score: number;
  running: boolean;
  started: boolean;
  over: boolean;
  passed: boolean;
  lastFrame: number;
};

const createInitialState = (): GameState => ({
  y: 50,
  velocity: 0,
  pipeX: 85,
  gapCenter: 50,
  score: 0,
  running: false,
  started: false,
  over: false,
  passed: false,
  lastFrame: 0,
});

function randomGapCenter(): number {
  return (
    MIN_GAP_CENTER +
    Math.random() * (MAX_GAP_CENTER - MIN_GAP_CENTER)
  );
}

export default function Flappy() {
  const gameRef = useRef<GameState>(createInitialState());
  const animationRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  const [y, setY] = useState(50);
  const [pipeX, setPipeX] = useState(85);
  const [gapCenter, setGapCenter] = useState(50);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);

  // Synchronize rendered state with the game simulation.
  const syncDisplay = useCallback(() => {
    const game = gameRef.current;

    setY(game.y);
    setPipeX(game.pipeX);
    setGapCenter(game.gapCenter);
    setScore(game.score);
    setRunning(game.running);
    setStarted(game.started);
    setOver(game.over);
  }, []);

  const finishGame = useCallback(() => {
    const game = gameRef.current;

    if (game.over) return;

    game.running = false;
    game.over = true;

    if (!finishedRef.current) {
      finishedRef.current = true;
      record('flappy', game.score, `${game.score} gates`);
    }

    syncDisplay();
  }, [syncDisplay]);

  const resetGame = useCallback((startImmediately = true) => {
    const game = gameRef.current;

    Object.assign(game, {
      ...createInitialState(),
      gapCenter: randomGapCenter(),
      running: startImmediately,
      started: startImmediately,
      velocity: startImmediately ? FLAP_STRENGTH : 0,
      lastFrame: 0,
    });

    finishedRef.current = false;
    syncDisplay();
  }, [syncDisplay]);

  const flap = useCallback(() => {
    const game = gameRef.current;

    if (game.over) {
      resetGame(true);
      return;
    }

    if (!game.running) {
      game.running = true;
      game.started = true;
    }

    game.velocity = FLAP_STRENGTH;
    syncDisplay();
  }, [resetGame, syncDisplay]);

  const toggleFlight = useCallback(() => {
    const game = gameRef.current;

    if (game.over) {
      resetGame(true);
      return;
    }

    if (!game.started) {
      resetGame(true);
      return;
    }

    game.running = !game.running;
    game.lastFrame = 0;

    syncDisplay();
  }, [resetGame, syncDisplay]);

  // Keyboard controls.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat) return;

      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return;
      }

      event.preventDefault();
      flap();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [flap]);

  // Stable animation loop with frame-rate-independent physics.
  useEffect(() => {
    let animationId = 0;

    const update = (timestamp: number) => {
      const game = gameRef.current;

      if (!game.running || game.over) {
        game.lastFrame = 0;
        animationId = requestAnimationFrame(update);
        return;
      }

      if (game.lastFrame === 0) {
        game.lastFrame = timestamp;
        animationId = requestAnimationFrame(update);
        return;
      }

      // Clamp delta time to prevent large physics jumps.
      const deltaTime = Math.min(
        (timestamp - game.lastFrame) / 1000,
        0.035,
      );

      game.lastFrame = timestamp;

      // Apply gravity and update bird position.
      game.velocity += GRAVITY * deltaTime;
      game.y += game.velocity * deltaTime;

      // Move the pipe from right to left.
      game.pipeX -= PIPE_SPEED * deltaTime;

      // Detect collisions with the top and bottom boundaries.
      if (
        game.y - BIRD_RADIUS_Y <= 0 ||
        game.y + BIRD_RADIUS_Y >= 100
      ) {
        finishGame();
        animationId = requestAnimationFrame(update);
        return;
      }

      const gapTop = game.gapCenter - GAP_HEIGHT / 2;
      const gapBottom = game.gapCenter + GAP_HEIGHT / 2;

      // Check whether the bird overlaps the pipe horizontally.
      const overlapsPipe =
        game.pipeX < BIRD_X + BIRD_RADIUS_X &&
        game.pipeX + PIPE_WIDTH > BIRD_X - BIRD_RADIUS_X;

      // The bird must remain entirely inside the gap.
      if (
        overlapsPipe &&
        (game.y - BIRD_RADIUS_Y < gapTop ||
          game.y + BIRD_RADIUS_Y > gapBottom)
      ) {
        finishGame();
        animationId = requestAnimationFrame(update);
        return;
      }

      // Award one point when the pipe passes the bird.
      if (
        !game.passed &&
        game.pipeX + PIPE_WIDTH < BIRD_X - BIRD_RADIUS_X
      ) {
        game.passed = true;
        game.score += 1;
      }

      // Generate the next pipe after the current one leaves.
      if (game.pipeX + PIPE_WIDTH < 0) {
        game.pipeX = 105;
        game.gapCenter = randomGapCenter();
        game.passed = false;
      }

      syncDisplay();
      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);
    animationRef.current = animationId;

    return () => {
      cancelAnimationFrame(animationId);
      animationRef.current = null;
    };
  }, [finishGame, syncDisplay]);

  const gapTop = gapCenter - GAP_HEIGHT / 2;
  const gapBottom = gapCenter + GAP_HEIGHT / 2;

  return (
    <div className="mini-game">
      <h2>
        {over
          ? 'Whoops!'
          : running
            ? 'Keep flying.'
            : started
              ? 'Take a breath.'
              : 'A tiny flight of fancy.'}
      </h2>

      <p>
        Tap or press Space to flap and keep clear of the
        pipes and edges.
      </p>

      <div
        className="flappy-field"
        onClick={flap}
        onTouchStart={(event) => {
          event.preventDefault();
          flap();
        }}
        role="button"
        tabIndex={0}
        aria-label="Flappy Bird game area. Tap or press Space to flap."
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault();
            flap();
          }
        }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          touchAction: 'manipulation',
        }}
      >
        <div className="flappy-score">{score}</div>

        <div
          className="bird"
          style={{
            top: `${y}%`,
            left: `${BIRD_X}%`,
            position: 'absolute',
          }}
        >
          ●
        </div>

        <div
          className="pipe pipe-top"
          style={{
            left: `${pipeX}%`,
            height: `${gapTop}%`,
            position: 'absolute',
            top: 0,
          }}
        />

        <div
          className="pipe pipe-bottom"
          style={{
            left: `${pipeX}%`,
            top: `${gapBottom}%`,
            height: `${100 - gapBottom}%`,
            position: 'absolute',
          }}
        />
      </div>

      <button
        className="button button-dark"
        onClick={toggleFlight}
      >
        {running ? (
          <Pause size={15} />
        ) : (
          <Play size={15} />
        )}{' '}
        {running
          ? 'Pause'
          : over
            ? 'Try again'
            : started
              ? 'Resume flight'
              : 'Start flight'}
      </button>
    </div>
  );
}
