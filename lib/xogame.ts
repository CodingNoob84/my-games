export type Cell = "X" | "O" | null;

const winingLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const computeXOWinner = (board: Cell[]) => {
  for (const [a, b, c] of winingLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

export const getBotPlaying = (
  board: Cell[],
  track: number[],
  botSymbol: Cell,
  level: number
): number => {
  const opponent: Cell = botSymbol === "X" ? "O" : "X";
  const available: number[] = board
    .map((v, i) => (v === null ? i : null))
    .filter((i): i is number => i !== null);

  const wins: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  const checkWin = (b: Cell[], s: Cell): boolean =>
    wins.some((line) => line.every((i) => b[i] === s));

  // --- Easy: random
  if (level === 1) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // --- Medium: win or block
  if (level === 2) {
    // Try winning move
    for (const i of available) {
      const temp = [...board];
      temp[i] = botSymbol;
      if (checkWin(temp, botSymbol)) return i;
    }

    // Try blocking
    for (const i of available) {
      const temp = [...board];
      temp[i] = opponent;
      if (checkWin(temp, opponent)) return i;
    }

    // Otherwise random
    return available[Math.floor(Math.random() * available.length)];
  }

  // --- Hard: heuristic minimax with limited depth
  const minimax = (b: Cell[], depth: number, isMaximizing: boolean): number => {
    if (checkWin(b, botSymbol)) return 10 - depth;
    if (checkWin(b, opponent)) return depth - 10;

    const moves: number[] = b
      .map((v, i) => (v === null ? i : null))
      .filter((i): i is number => i !== null);

    if (moves.length === 0 || depth >= 3) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (const m of moves) {
        const newBoard = [...b];
        newBoard[m] = botSymbol;
        best = Math.max(best, minimax(newBoard, depth + 1, false));
      }
      return best;
    } else {
      let best = Infinity;
      for (const m of moves) {
        const newBoard = [...b];
        newBoard[m] = opponent;
        best = Math.min(best, minimax(newBoard, depth + 1, true));
      }
      return best;
    }
  };

  let bestScore = -Infinity;
  let bestMove = available[0];
  for (const i of available) {
    const temp = [...board];
    temp[i] = botSymbol;
    const score = minimax(temp, 0, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }

  return bestMove;
};
