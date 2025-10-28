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

export const botXOPlaying = (board: Cell[], botSymbol: Cell): number => {
  if (!botSymbol) return -1;
  const opponent = botSymbol === "X" ? "O" : "X";
  const emptyIndices = board
    .map((cell, idx) => (cell === null ? idx : -1))
    .filter((idx) => idx !== -1);

  // Try to win
  for (const i of emptyIndices) {
    const test = [...board];
    test[i] = botSymbol;
    if (computeXOWinner(test) === botSymbol) return i;
  }

  // Try to block opponent
  for (const i of emptyIndices) {
    const test = [...board];
    test[i] = opponent;
    if (computeXOWinner(test) === opponent) return i;
  }

  // Otherwise pick center, corner, or random
  if (emptyIndices.includes(4)) return 4; // center
  const corners = [0, 2, 6, 8].filter((i) => emptyIndices.includes(i));
  if (corners.length)
    return corners[Math.floor(Math.random() * corners.length)];
  if (emptyIndices.length === 0) return -1;
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
};
