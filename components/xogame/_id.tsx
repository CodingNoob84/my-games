import { db } from "@/lib/db";
import { createXOGame, useGameWithPlayers } from "@/query/xogame";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Cell = "X" | "O" | null;
const MAX_MOVES = 20;

function computeWinner(board: Cell[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function botPlacement(board: Cell[], botSymbol: Cell): number {
  if (!botSymbol) return -1;
  const opponent = botSymbol === "X" ? "O" : "X";
  const emptyIndices = board
    .map((cell, idx) => (cell === null ? idx : -1))
    .filter((idx) => idx !== -1);

  // Try to win
  for (const i of emptyIndices) {
    const test = [...board];
    test[i] = botSymbol;
    if (computeWinner(test) === botSymbol) return i;
  }

  // Try to block opponent
  for (const i of emptyIndices) {
    const test = [...board];
    test[i] = opponent;
    if (computeWinner(test) === opponent) return i;
  }

  // Otherwise pick center, corner, or random
  if (emptyIndices.includes(4)) return 4; // center
  const corners = [0, 2, 6, 8].filter((i) => emptyIndices.includes(i));
  if (corners.length)
    return corners[Math.floor(Math.random() * corners.length)];
  if (emptyIndices.length === 0) return -1;
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

export default function XOGame() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const me = db.useUser();
  const { game, players, isLoading } = useGameWithPlayers(id);
  console.log("game:", game);

  const currentPlayer = game?.currentTurn;
  const isMyTurn = currentPlayer === me.id;
  const mySymbol: Cell = game?.playerXUserId === me.id ? "X" : "O";
  const track = game?.track ?? [];

  const botHasMovedRef = useRef(false);

  const [board, setBoard] = useState<Cell[]>(
    game?.board || Array(9).fill(null)
  );

  const winner = useMemo(() => computeWinner(board), [board]);
  const isDraw = game?.moveCount! >= MAX_MOVES && !winner;

  const playerX = useMemo(
    () => players?.find((p) => p.id === game?.playerXUserId),
    [players, game?.playerXUserId]
  );
  const playerO = useMemo(
    () => players?.find((p) => p.id === game?.playerOUserId),
    [players, game?.playerOUserId]
  );
  console.log("playerX:", playerX);
  console.log("playerO:", playerO);
  const isCurrentPlayerBot =
    (currentPlayer === game?.playerXUserId && playerX?.isBot) ||
    (currentPlayer === game?.playerOUserId && playerO?.isBot);
  console.log("isCurrentPlayerBot:", isCurrentPlayerBot);
  const makeMove = useCallback(
    async (index: number, symbol: Cell) => {
      if (!game) return;

      let moveIndex = index;
      if (typeof moveIndex !== "number") {
        const firstEmpty = board.findIndex((c) => c === null);
        if (firstEmpty === -1) return;
        moveIndex = firstEmpty;
      }
      if (typeof moveIndex !== "number" || board[moveIndex]) return;
      const next = [...board] as Cell[];
      next[moveIndex] = symbol;
      track.push(moveIndex);
      if (track.length > 6) {
        const removedIndex = track.shift();
        next[removedIndex!] = null;
      }

      setBoard(next);

      const result = computeWinner(next);
      const totalMoves = game.moveCount + 1;
      if (result) {
        Alert.alert("Game Over", `Winner: ${result}`);
        await db.transact(
          db.tx.xogame[game.id].update({
            board: next,
            track: track,
            moveCount: totalMoves,
            updatedAt: Date.now(),
            wonBy: currentPlayer,
            status: "completed",
          })
        );
      } else if (totalMoves >= MAX_MOVES) {
        Alert.alert("Draw", "Maximum moves reached!");
        await db.transact(
          db.tx.xogame[game.id].update({
            board: next,
            track: track,
            moveCount: totalMoves,
            updatedAt: Date.now(),
            wonBy: currentPlayer,
            status: "completed",
          })
        );
      }

      // ✅ Switch turn
      const nextTurnId =
        currentPlayer === game.playerXUserId
          ? game.playerOUserId
          : game.playerXUserId;

      // ✅ Update DB
      try {
        await db.transact(
          db.tx.xogame[game.id].update({
            board: next,
            track: track,
            moveCount: totalMoves,
            currentTurn: nextTurnId,
            updatedAt: Date.now(),
          })
        );
      } catch (err) {
        console.error("Failed to update game:", err);
      }
    },
    [board, game, mySymbol]
  );

  const handleStartNewGame = async () => {
    const response = await createXOGame(
      [game?.playerOUserId!, game?.playerXUserId!],
      game?.type!
    );
    //console.log("-->", response);
    if (response.success) {
      router.push(`/xo/${response.result}`);
    }
  };
  useEffect(() => {
    // Only run if it's a bot match and game is still active
    if (game?.type !== "bot" || winner || isDraw) return;

    // If it's the bot's turn and bot hasn't moved yet
    if (isCurrentPlayerBot && !botHasMovedRef.current) {
      botHasMovedRef.current = true;

      const timer = setTimeout(() => {
        const botSymbol: Cell =
          currentPlayer === game.playerXUserId ? "X" : "O";
        const botIndex = botPlacement(board, botSymbol);
        if (botIndex !== -1) makeMove(botIndex, botSymbol);
      }, 800);

      return () => clearTimeout(timer);
    }

    // If it's the human's turn, reset the flag
    if (!isCurrentPlayerBot) {
      botHasMovedRef.current = false;
    }
  }, [currentPlayer, isCurrentPlayerBot, winner, isDraw]);

  const resetGame = useCallback(() => {
    const empty = Array(9).fill(null) as Cell[];
    setBoard(empty);
  }, []);

  if (!id) return null;
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg">Loading game...</Text>
      </View>
    );
  }
  if (!game) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg">Game not found</Text>
      </View>
    );
  }

  const movesDisplay = `${board.filter(Boolean).length}/${MAX_MOVES}`;

  return (
    <ScrollView
      className="flex-1 bg-gradient-to-b from-gray-900 via-gray-950 to-black"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 pt-10 pb-6 px-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-extrabold text-center text-white tracking-tight mb-1">
            Tic Tac Toe
          </Text>
        </View>

        {/* Players */}
        <View className="flex-row justify-between items-center mb-8">
          {/* Player X */}
          <View
            className={`flex-1 mx-2 items-center p-4 rounded-2xl ${
              currentPlayer === game.playerXUserId && !winner && !isDraw
                ? "bg-red-500/20 border-2 border-red-500"
                : "bg-gray-800/30 border border-gray-700"
            }`}
          >
            <Image
              source={{ uri: playerX?.avatar }}
              className="w-10 h-10 rounded-full border-2 border-red-400/60 mb-2"
            />
            <Text className="text-red-400 font-bold text-xl">X</Text>
            <Text className="text-white font-semibold text-center mt-1">
              {playerX?.name || "Player X"}
            </Text>
          </View>

          {/* VS */}
          <View className="absolute left-1/2 transform -translate-x-1/2 top-10">
            <View className="bg-gray-800 px-2 py-1 rounded-full border border-gray-600">
              <Text className="text-gray-400 text-xs font-bold">VS</Text>
            </View>
          </View>

          {/* Player O */}
          <View
            className={`flex-1 mx-2 items-center p-4 rounded-2xl ${
              currentPlayer === game.playerOUserId && !winner && !isDraw
                ? "bg-green-500/20 border-2 border-green-500"
                : "bg-gray-800/30 border border-gray-700"
            }`}
          >
            <Image
              source={{ uri: playerO?.avatar }}
              className="w-10 h-10 rounded-full border-2 border-green-400/60 mb-2"
            />
            <Text className="text-green-400 font-bold text-xl">O</Text>
            <Text className="text-white font-semibold text-center mt-1">
              {playerO?.name || "Player O"}
            </Text>
          </View>
        </View>

        {/* Game Board */}
        <View className="items-center mb-6">
          <View className="w-full max-w-sm aspect-square bg-gray-800 rounded-3xl shadow-2xl border border-gray-700/50 p-2">
            <View className="flex-row flex-wrap rounded-xl overflow-hidden flex-1">
              {board.map((cell, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    if (winner || isDraw || !isMyTurn || isCurrentPlayerBot)
                      return;
                    makeMove(i, mySymbol);
                  }}
                  disabled={
                    !!winner ||
                    !!cell ||
                    isDraw ||
                    !isMyTurn ||
                    isCurrentPlayerBot
                  }
                  activeOpacity={0.8}
                  className="items-center justify-center border border-gray-700/70 bg-gray-900/60"
                  style={{ width: "33.333%", height: "33.333%" }}
                >
                  {cell ? (
                    <Text
                      className={`text-4xl font-extrabold ${
                        cell === "X" ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {cell}
                    </Text>
                  ) : (
                    <View className="w-3 h-3 rounded-full bg-gray-700/30" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row justify-center gap-4">
          <TouchableOpacity
            onPress={handleStartNewGame}
            className="rounded-xl px-6 py-3 bg-purple-600 flex-1 max-w-[150px]"
          >
            <Text className="text-white font-semibold text-center">
              New Game
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View className="items-center mt-6">
          <Text className="text-gray-500 text-xs">
            Moves: {movesDisplay} •{" "}
            {game.type === "bot" ? "🤖 Bot Match" : "👥 Multiplayer"}
          </Text>
          <Text className="text-gray-400 text-xs mt-1">
            {winner
              ? `Winner: ${winner}`
              : isDraw
                ? "Draw"
                : isMyTurn
                  ? "Your turn"
                  : isCurrentPlayerBot
                    ? "Bot thinking..."
                    : "Opponent's turn"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
