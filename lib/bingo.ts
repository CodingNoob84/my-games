import { addBingoNumber, getPlayersInfo } from "@/query/bingo";
import { useEffect, useState } from "react";

const BOT_DELAY = 3000;

export type GameDataType = {
  id: string;
  type: string;
  markedNumbers: any;
  limit: number;
  orderOfTurns: any;
  status?: string | undefined;
  createdAt?: number | undefined;
  updatedAt?: number | undefined;
  wonBy?: string | undefined;
};

export type PlayerInfo = {
  id: string;
  name?: string;
  avatar?: string;
  level?: number;
  type: string;
};

export type PlayerData = {
  id: string;
  userId: string;
  bingoId: string;
  board: number[];
  winningArray: number[][];
};

export function getBotMove(
  board: number[],
  marked: number[],
  level: number
): number {
  if (board.length !== 25) throw new Error("Board must have 25 cells.");

  // Indices 0..24 correspond to board positions
  const allIndices = Array.from({ length: 25 }, (_, i) => i);

  // Map marked numbers to indices
  const markedIndices = allIndices.filter((i) => marked.includes(board[i]));
  const unmarkedIndices = allIndices.filter((i) => !marked.includes(board[i]));
  if (unmarkedIndices.length === 0) throw new Error("No available moves.");

  // Define all bingo lines (5 rows + 5 cols + 2 diagonals = 12)
  const lines: number[][] = [];
  for (let r = 0; r < 5; r++) lines.push([0, 1, 2, 3, 4].map((c) => r * 5 + c)); // rows
  for (let c = 0; c < 5; c++) lines.push([0, 1, 2, 3, 4].map((r) => r * 5 + c)); // cols
  lines.push([0, 6, 12, 18, 24]); // main diagonal
  lines.push([4, 8, 12, 16, 20]); // anti-diagonal

  const countMarkedInLine = (line: number[]) =>
    line.reduce(
      (count, idx) => (markedIndices.includes(idx) ? count + 1 : count),
      0
    );

  // EASY: Random unmarked cell
  if (level === 1) {
    const idx =
      unmarkedIndices[Math.floor(Math.random() * unmarkedIndices.length)];
    return board[idx];
  }

  // MEDIUM: Prefer moves that help complete a line
  if (level === 2) {
    const scores = unmarkedIndices.map((idx) => {
      const maxInLine = Math.max(
        ...lines
          .filter((line) => line.includes(idx))
          .map((line) => countMarkedInLine(line))
      );
      return { idx, score: maxInLine };
    });

    const maxScore = Math.max(...scores.map((s) => s.score));
    const candidates = scores
      .filter((s) => s.score === maxScore)
      .map((s) => s.idx);
    const chosenIdx = candidates[Math.floor(Math.random() * candidates.length)];
    return board[chosenIdx];
  }

  // HARD: Try to complete a bingo or pick the most strategic spot
  if (level === 3) {
    // 1️⃣ Immediate winning move
    for (const idx of unmarkedIndices) {
      if (
        lines.some(
          (line) => line.includes(idx) && countMarkedInLine(line) === 4
        )
      ) {
        return board[idx];
      }
    }

    // 2️⃣ Heuristic scoring
    const scoreWeight = (count: number) => {
      switch (count) {
        case 4:
          return 1000;
        case 3:
          return 60;
        case 2:
          return 20;
        case 1:
          return 5;
        default:
          return 1;
      }
    };

    const scoredMoves = unmarkedIndices.map((idx) => {
      let score = 0;
      let hotLines = 0;

      for (const line of lines) {
        if (!line.includes(idx)) continue;
        const count = countMarkedInLine(line);
        score += scoreWeight(count);
        if (count >= 3) hotLines++;
      }

      // Bonus for intersecting strong lines
      score += hotLines * 30;

      // Center advantage
      if (idx === 12) score += 5;

      return { idx, score };
    });

    const maxScore = Math.max(...scoredMoves.map((m) => m.score));
    const bestMoves = scoredMoves
      .filter((m) => m.score === maxScore)
      .map((m) => m.idx);
    const chosenIdx = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    return board[chosenIdx];
  }

  // fallback (shouldn't reach)
  const fallbackIdx =
    unmarkedIndices[Math.floor(Math.random() * unmarkedIndices.length)];
  return board[fallbackIdx];
}

export function findWinningLines(board: number[], markedNumbers: number[]) {
  if (!Array.isArray(board) || board.length !== 25) {
    throw new Error("board must be an array of length 25");
  }

  const marked = new Set((markedNumbers || []).map(Number));
  const lines: number[][] = [];

  // Rows
  for (let r = 0; r < 5; r++) {
    lines.push([r * 5 + 0, r * 5 + 1, r * 5 + 2, r * 5 + 3, r * 5 + 4]);
  }

  // Columns
  for (let c = 0; c < 5; c++) {
    lines.push([0 * 5 + c, 1 * 5 + c, 2 * 5 + c, 3 * 5 + c, 4 * 5 + c]);
  }

  // Diagonals
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);

  const winningLines: number[][] = [];

  for (const idxLine of lines) {
    let allMarked = true;
    const nums: number[] = [];

    for (const idx of idxLine) {
      const val = board[idx];
      nums.push(val);

      if (idx !== 12 && !marked.has(val)) {
        allMarked = false;
        break;
      }
    }

    if (allMarked) winningLines.push(nums);
  }

  return winningLines;
}

export const usePlayersInfo = (
  gameData: GameDataType,
  players: PlayerData[]
) => {
  const [playersInfo, setPlayersInfo] = useState<PlayerInfo[]>([]);

  useEffect(() => {
    if (!gameData || !players?.length || playersInfo.length > 0) return;

    (async () => {
      const ids = players.map((p) => p.userId);
      const data = await getPlayersInfo(ids);
      setPlayersInfo(data);
    })();
  }, [gameData, players]);

  return playersInfo;
};

export const useBotTurn = (
  gameData: GameDataType,
  players: PlayerData[],
  playersInfo: PlayerInfo[]
) => {
  const isBotTurn = playersInfo
    .filter((p) => p.type === "bot")
    .some((bot) => bot.id === gameData?.orderOfTurns[0]);

  useEffect(() => {
    if (!isBotTurn || !gameData) return;

    const timeout = setTimeout(() => {
      const botPlay = async () => {
        const currPlayerId = gameData.orderOfTurns[0];
        const player = players?.find((p) => p.userId === currPlayerId);
        const playerLevel =
          playersInfo.find((p) => p.id === currPlayerId)?.level || 1;

        const number = getBotMove(
          player?.board!,
          gameData.markedNumbers,
          playerLevel
        );
        if (!number) return;

        const newMarkedNumbers = [...gameData.markedNumbers, number];
        const newTurnOrder = [...gameData.orderOfTurns.slice(1), currPlayerId];

        const winningLines = findWinningLines(
          player?.board || [],
          newMarkedNumbers
        );

        await addBingoNumber(
          gameData.id,
          newMarkedNumbers,
          newTurnOrder,
          player?.id || "",
          player?.userId || "",
          winningLines
        );
      };

      botPlay();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isBotTurn, gameData, players, playersInfo]);
};
