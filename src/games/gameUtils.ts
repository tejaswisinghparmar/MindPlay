/** Shared helpers used by the mini-game components. */
export const rand = (n: number) => Math.floor(Math.random() * n);
export function record(id: string, score: number, label?: string) {
  try {
    const rs = JSON.parse(localStorage.getItem('mindplay-results') || '[]');
    rs.unshift({ gameId: id, score, label, date: new Date().toISOString() });
    localStorage.setItem('mindplay-results', JSON.stringify(rs.slice(0, 50)));
    const b = JSON.parse(localStorage.getItem('mindplay-bests') || '{}');
    const better =
      id === 'reaction'
        ? b[id] === undefined || score < b[id]
        : b[id] === undefined || score > b[id];
    if (better) {
      b[id] = score;
      localStorage.setItem('mindplay-bests', JSON.stringify(b));
    }
  } catch {}
}

export function winner(b: string[]) {
  for (const [a, c, d] of [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ])
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  return '';
}

export function newBoard() {
  return addTile(addTile(Array.from({ length: 4 }, () => Array(4).fill(0))));
}

export function addTile(b: number[][]) {
  const empty: [number, number][] = [];
  b.forEach((r, i) =>
    r.forEach((v, j) => {
      if (!v) empty.push([i, j]);
    }),
  );
  if (empty.length) {
    const [r, c] = empty[rand(empty.length)];
    b[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
  return b;
}

export function shuffle<T>(a: T[]) {
  return a
    .map((v) => ({ v, r: Math.random() }))
    .sort((x, y) => x.r - y.r)
    .map((x) => x.v);
}

export function question() {
  const x = 1 + rand(12),
    y = 1 + rand(12),
    op = Math.random() > 0.5 ? '+' : '−',
    a = op === '+' ? x + y : x - y;
  const opts = shuffle([a, a + 1, a - 1, a + 2]).filter((v, i, a) => a.indexOf(v) === i);
  while (opts.length < 4) opts.push(a + opts.length + 2);
  return { x, y, op, a, options: shuffle(opts.slice(0, 4)) };
}
