import { db } from "@/lib/db";
import { botXOPlaying, Cell, computeXOWinner } from "@/lib/xogame";
import { createXOGame, Player, XOGame } from "@/query/xogame";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";

const MAX_MOVES = 20;

export const XOGameArea = ({
  game,
  players,
}: {
  game: XOGame;
  players: Player[];
}) => {
  const router = useRouter();
  const me = db.useUser();
  const [showModal, setShowModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const currentPlayer = game?.currentTurn;
  const isMyTurn = currentPlayer === me.id;
  const mySymbol: Cell = game?.playerXUserId === me.id ? "X" : "O";
  const track = game?.track ?? [];

  const winner = useMemo(
    () => computeXOWinner(game.board as Cell[]),
    [game.board]
  );
  const isDraw = game?.moveCount! >= MAX_MOVES && !winner;

  const playerX = useMemo(
    () => players?.find((p) => p.id === game?.playerXUserId),
    [players, game?.playerXUserId]
  );
  const playerO = useMemo(
    () => players?.find((p) => p.id === game?.playerOUserId),
    [players, game?.playerOUserId]
  );

  const isCurrentPlayerBot =
    (currentPlayer === game?.playerXUserId && playerX?.isBot) ||
    (currentPlayer === game?.playerOUserId && playerO?.isBot);

  const makeMove = useCallback(
    async (index: number, symbol: Cell) => {
      if (!game) return;

      let moveIndex = index;

      const next = [...game.board] as Cell[];
      next[moveIndex] = symbol;
      track.push(moveIndex);
      if (track.length > 6) {
        const removedIndex = track.shift();
        next[removedIndex!] = null;
      }

      const result = computeXOWinner(next);
      const totalMoves = game.moveCount + 1;
      if (result) {
        //Alert.alert("Game Over", `Winner: ${result}`);
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
        //Alert.alert("Draw", "Maximum moves reached!");
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
    [game, mySymbol]
  );

  const handleStartNewGame = async () => {
    const response = await createXOGame(
      [game?.playerOUserId!, game?.playerXUserId!],
      game?.type!
    );
    //console.log("-->", response);
    if (response.success) {
      setShowModal(false);
      router.push(`/xo/${response.result}`);
    }
  };

  const handleCancelGame = () => {
    setShowModal(false);
    router.push(`/xo`);
  };

  useEffect(() => {
    if (winner || isDraw) {
      setShowModal(true);
    }
  }, [winner, isDraw]);

  useEffect(() => {
    // Only run if it's a bot match and game is still active
    if (game?.type !== "bot" || winner || isDraw) return;

    // If it's the bot's turn and bot hasn't moved yet
    if (isCurrentPlayerBot) {
      const timer = setTimeout(() => {
        const botSymbol: Cell =
          currentPlayer === game.playerXUserId ? "X" : "O";
        const botIndex = botXOPlaying(game.board as Cell[], botSymbol);
        if (botIndex !== -1) makeMove(botIndex, botSymbol);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, isCurrentPlayerBot, winner, isDraw]);
  return (
    <View className="flex-1 bg-black px-5 pt-12 pb-6">
      {/* Header */}
      <Text className="text-3xl font-extrabold text-center text-white mb-8 tracking-tight">
        Tic Tac Toe
      </Text>
      {/* Player Cards */}
      <View className="flex-row justify-between items-center mb-6">
        {/* Player X */}
        <View
          className={`flex-1 mx-2 items-center p-4 rounded-2xl transition-all duration-300 ${
            currentPlayer === game.playerXUserId && !winner && !isDraw
              ? "bg-green-600/20 border border-green-500/40 shadow-lg shadow-green-900/40"
              : "bg-gray-800/40 border border-gray-700/60"
          }`}
        >
          <Image
            source={{ uri: playerX?.avatar }}
            className="w-12 h-12 rounded-full mb-2 border-2 border-red-400/70"
          />
          <Text className="text-red-400 text-2xl font-extrabold mb-1">X</Text>
          <Text className="text-white font-semibold text-sm" numberOfLines={1}>
            {playerX?.name || "Player X"}
          </Text>
          {currentPlayer === game.playerXUserId && !winner && !isDraw && (
            <Text className="text-xs text-red-300 mt-1 animate-pulse">
              Your Turn
            </Text>
          )}
        </View>

        {/* Player O */}
        <View
          className={`flex-1 mx-2 items-center p-4 rounded-2xl transition-all duration-300 ${
            currentPlayer === game.playerOUserId && !winner && !isDraw
              ? "bg-green-600/20 border border-green-500/40 shadow-lg shadow-green-900/40"
              : "bg-gray-800/40 border border-gray-700/60"
          }`}
        >
          <Image
            source={{ uri: playerO?.avatar }}
            className="w-12 h-12 rounded-full mb-2 border-2 border-green-400/70"
          />
          <Text className="text-green-400 text-2xl font-extrabold mb-1">O</Text>
          <Text className="text-white font-semibold text-sm" numberOfLines={1}>
            {playerO?.name || "Player O"}
          </Text>
          {currentPlayer === game.playerOUserId && !winner && !isDraw && (
            <Text className="text-xs text-green-300 mt-1 animate-pulse">
              Your Turn
            </Text>
          )}
        </View>
      </View>
      {/* Game Board */}
      <View className="items-center">
        <View className="w-full max-w-sm aspect-square bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 p-2">
          <View className="flex-row flex-wrap rounded-2xl overflow-hidden flex-1">
            {game.board.map((cell, i) => (
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
                activeOpacity={0.7}
                className="items-center justify-center border border-gray-800 bg-gray-950/60"
                style={{ width: "33.333%", height: "33.333%" }}
              >
                {cell ? (
                  <Text
                    className={`text-5xl font-extrabold ${
                      cell === "X" ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {cell}
                  </Text>
                ) : (
                  <View className="w-3 h-3 rounded-full bg-gray-700/20" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      {/* Info */}
      <View className="items-center mt-6">
        <Text className="text-gray-500 text-xs">
          Moves: {game.moveCount} •{" "}
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

      <View className="flex items-center mt-6">
        <TouchableOpacity
          onPress={() => setShowQuitModal(true)}
          className="bg-red-800/60 px-3 py-2 rounded-xl border border-red-700 active:scale-95"
        >
          <Text className="text-red-100 font-bold text-sm">Quit Game</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showQuitModal} animationType="fade">
        <View className="flex-1 bg-black/70 items-center justify-center">
          <View className="w-80 bg-gray-900/90 rounded-3xl p-6 border border-gray-700">
            <Text className="text-2xl font-extrabold text-center text-white mb-3">
              Are you sure?
            </Text>
            <Text className="text-center text-gray-400 mb-6">
              Do you really want to give up this match?
            </Text>

            <View className="flex-row justify-center gap-3">
              <TouchableOpacity
                onPress={() => setShowQuitModal(false)}
                className="flex-1 bg-gray-700 py-3 rounded-xl active:scale-95"
              >
                <Text className="text-white text-center font-semibold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowQuitModal(false);
                  //handleQuitGame(); // 👈 your logic to quit / navigate back
                }}
                className="flex-1 bg-red-600 py-3 rounded-xl active:scale-95"
              >
                <Text className="text-white text-center font-bold text-base">
                  Give Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Result Modal */}
      <Modal transparent visible={showModal} animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center">
          <View className="w-80 bg-gray-900/90 rounded-3xl p-6 border border-gray-700 shadow-xl">
            <Text className="text-3xl font-extrabold text-center text-gray-200 mb-4">
              {winner ? "🏆 Game Over" : "🤝 Draw"}
            </Text>

            <Text
              className={`text-center text-xl font-semibold mb-6 ${
                winner ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {winner ? `Winner: ${winner}` : "It's a tie!"}
            </Text>

            <TouchableOpacity
              onPress={handleStartNewGame}
              className="bg-blue-500 py-3 rounded-xl active:scale-95 mb-3"
            >
              <Text className="text-white text-center font-bold text-base">
                Play Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancelGame}
              className="bg-gray-300 py-3 rounded-xl active:scale-95"
            >
              <Text className="text-gray-700 text-center font-bold text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
