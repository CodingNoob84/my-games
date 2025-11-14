import { db } from "@/lib/db";
import { Cell, computeXOWinner, getBotPlaying } from "@/lib/xogame";
import { completeXOGame, createXOGame, Player, XOGame } from "@/query/xogame";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";

const MAX_MOVES = 20;

export const BotXOGameArea = ({
  game,
  players,
}: {
  game: XOGame;
  players: Player[];
}) => {
  const router = useRouter();
  const me = db.useUser();
  const [board, setBoard] = useState<Cell[]>(game.board as Cell[]);
  const [track, setTrack] = useState<number[]>(game.track as number[]);
  const [moveCount, setMoveCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const winner = useMemo(() => computeXOWinner(board), [board]);
  const isDraw = moveCount >= MAX_MOVES && !winner;

  // Human is always one of the players, bot is the other
  const humanSymbol = me.id === game.playerXUserId ? "X" : "O";
  const botSymbol = humanSymbol === "X" ? "O" : "X";

  const isMyTurn = me.id === game.currentTurn;

  // find both players
  const playerX = useMemo(
    () => players?.find((p) => p.id === game?.playerXUserId),
    [players, game?.playerXUserId]
  );
  const playerO = useMemo(
    () => players?.find((p) => p.id === game?.playerOUserId),
    [players, game?.playerOUserId]
  );

  // Identify human and bot players
  const humanPlayer = humanSymbol === "X" ? playerX : playerO;
  const botPlayer = humanSymbol === "X" ? playerO : playerX;

  // current player id for highlighting
  const currentPlayer = game.currentTurn;

  // --- Player move
  const handlePlayerMove = useCallback(
    async (index: number) => {
      if (!isMyTurn || winner || isDraw || board[index]) return;

      const next = [...board];
      const newTrack = [...track, index];
      next[index] = humanSymbol;

      // keep only 3 Xs on board
      if (newTrack.length > 6) {
        const removedIndex = newTrack.shift();
        if (removedIndex !== undefined) next[removedIndex] = null;
      }

      // Update local state
      setBoard(next);
      setTrack(newTrack);
      setMoveCount((prev) => prev + 1);

      // Update database
      try {
        await db.transact(
          db.tx.xogame[game.id].update({
            board: next,
            track: newTrack,
            currentTurn:
              game.currentTurn == game.playerXUserId
                ? game.playerOUserId
                : game.playerXUserId, // Switch to bot's turn
          })
        );
      } catch (error) {
        console.error("Failed to update game state:", error);
      }
    },
    [
      board,
      track,
      isMyTurn,
      winner,
      isDraw,
      humanSymbol,
      game.id,
      game.playerOUserId,
    ]
  );

  // --- Bot move (delayed)
  useEffect(() => {
    if (winner || isDraw || isMyTurn) return;

    const timer = setTimeout(async () => {
      const botIndex = getBotPlaying(
        board,
        track,
        botSymbol,
        (game.level as number) || 1
      );
      if (botIndex === -1) return;

      const next = [...board];
      const newTrack = [...track, botIndex];
      next[botIndex] = botSymbol;

      if (newTrack.length > 6) {
        const removedIndex = newTrack.shift();
        if (removedIndex !== undefined) next[removedIndex] = null;
      }

      // Update local state
      setBoard(next);
      setTrack(newTrack);
      setMoveCount((prev) => prev + 1);

      // Update database
      try {
        await db.transact(
          db.tx.xogame[game.id].update({
            board: next,
            track: newTrack,
            currentTurn:
              game.currentTurn == game.playerXUserId
                ? game.playerOUserId
                : game.playerXUserId,
          })
        );
      } catch (error) {
        console.error("Failed to update bot move:", error);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    isMyTurn,
    board,
    track,
    winner,
    isDraw,
    game.id,
    game.playerXUserId,
    game.level,
  ]);

  // --- Show modal if game ends
  useEffect(() => {
    if (!winner && !isDraw) return;

    const updateGameStatus = async () => {
      try {
        let status = "";
        let wonBy = "";

        if (isDraw) {
          status = "draw";
          wonBy = "";
        } else {
          status = "finished";
          wonBy = winner === "X" ? playerX?.id || "" : playerO?.id || "";
        }

        await completeXOGame(game.id, status, wonBy);
        setShowModal(true);
      } catch (error) {
        console.error("Failed to update XO game status:", error);
      }
    };

    updateGameStatus();
  }, [winner, isDraw, game.id, playerX?.id, playerO?.id]);

  const handleRestart = async () => {
    if (!playerX || !playerO) return;
    const response = await createXOGame(
      [playerX.id, playerO.id],
      "bot",
      game.level
    );
    if (response.success) {
      setShowModal(false);
      router.push(`/xo/${response.result}`);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    router.push("/xo");
  };

  // Determine result message and opponent info - FIXED
  const getResultInfo = () => {
    if (isDraw) {
      return {
        title: "🤝 It's a Draw!",
        message: "Great game! You were equally matched",
        opponent: botPlayer,
        resultType: "draw",
      };
    } else if (winner === humanSymbol) {
      return {
        title: "🎉 You Won!",
        message: "Congratulations on your victory!",
        opponent: botPlayer,
        resultType: "win",
      };
    } else {
      return {
        title: "😔 You Lost",
        message: "Better luck next time!",
        opponent: botPlayer,
        resultType: "loss",
      };
    }
  };

  const resultInfo = getResultInfo();

  return (
    <View className="flex-1 bg-black px-5 pt-12 pb-6">
      <Text className="text-3xl font-extrabold text-center text-white mb-8">
        Tic Tac Toe 🤖
      </Text>

      {/* Players Info - FIXED */}
      <View className="flex-row justify-between items-center mb-6">
        {/* Human Player */}
        <View
          className={`flex-1 mx-2 items-center p-4 rounded-2xl transition-all duration-300 ${
            currentPlayer === me.id && !winner && !isDraw
              ? "bg-green-600/20 border border-green-500/40 shadow-lg shadow-green-900/40"
              : "bg-gray-800/40 border border-gray-700/60"
          }`}
        >
          <Image
            source={{
              uri:
                humanPlayer?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            className="w-12 h-12 rounded-full mb-2 border-2 border-red-400/70"
          />
          <Text
            className={`text-2xl font-extrabold mb-1 ${
              humanSymbol === "X" ? "text-red-400" : "text-green-400"
            }`}
          >
            {humanSymbol}
          </Text>
          <Text className="text-white font-semibold text-sm" numberOfLines={1}>
            {humanPlayer?.name || "You"}
          </Text>
          {currentPlayer === me.id && !winner && !isDraw && (
            <Text className="text-xs text-red-300 mt-1 animate-pulse">
              Your Turn
            </Text>
          )}
        </View>

        {/* Bot Player */}
        <View
          className={`flex-1 mx-2 items-center p-4 rounded-2xl transition-all duration-300 ${
            currentPlayer !== me.id && !winner && !isDraw
              ? "bg-green-600/20 border border-green-500/40 shadow-lg shadow-green-900/40"
              : "bg-gray-800/40 border border-gray-700/60"
          }`}
        >
          <Image
            source={{
              uri:
                botPlayer?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/4712/4712100.png",
            }}
            className="w-12 h-12 rounded-full mb-2 border-2 border-green-400/70"
          />
          <Text
            className={`text-2xl font-extrabold mb-1 ${
              botSymbol === "X" ? "text-red-400" : "text-green-400"
            }`}
          >
            {botSymbol}
          </Text>
          <Text className="text-white font-semibold text-sm" numberOfLines={1}>
            {botPlayer?.name || "Bot"}
          </Text>
          {currentPlayer !== me.id && !winner && !isDraw && (
            <Text className="text-xs text-green-300 mt-1 animate-pulse">
              Bot Thinking...
            </Text>
          )}
        </View>
      </View>

      {/* Game Board */}
      <View className="items-center">
        <View className="w-full max-w-sm aspect-square bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 p-2">
          <View className="flex-row flex-wrap rounded-2xl overflow-hidden flex-1">
            {board.map((cell, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handlePlayerMove(i)}
                disabled={!!winner || isDraw || !isMyTurn}
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
        <Text className="text-gray-400 text-sm">
          Moves: {moveCount} • {isMyTurn ? "Your turn" : "Bot thinking..."}
        </Text>
        <Text className="text-gray-400 text-xs mt-1">
          {winner
            ? `Winner: ${winner}`
            : isDraw
              ? "Draw"
              : isMyTurn
                ? "Tap to play"
                : "Bot's move"}
        </Text>
      </View>

      {/* Result Modal - FIXED */}
      <Modal transparent visible={showModal} animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center px-6">
          <View className="w-full bg-gray-900/95 rounded-3xl p-8 border border-gray-700 shadow-2xl">
            {/* Result Header */}
            <View className="items-center mb-6">
              <Text className="text-3xl font-extrabold text-center text-white mb-2">
                {resultInfo.title}
              </Text>
              <Text className="text-gray-300 text-center text-base">
                {resultInfo.message}
              </Text>
            </View>

            {/* Opponent Info - FIXED */}
            <View className="items-center mb-8">
              <View className="flex-row items-center justify-center mb-4">
                <View className="items-center ">
                  <Image
                    source={{
                      uri:
                        humanPlayer?.avatar ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                    }}
                    className="w-16 h-16 rounded-full border-2 border-red-400/70"
                  />
                  <Text className="text-white font-semibold text-sm mt-2">
                    You
                  </Text>
                  <Text
                    className={`text-lg font-bold ${
                      humanSymbol === "X" ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {humanSymbol}
                  </Text>
                </View>

                <Text className="text-gray-400 text-2xl font-bold mx-4">
                  VS
                </Text>

                <View className="items-center">
                  <Image
                    source={{
                      uri:
                        resultInfo.opponent?.avatar ||
                        "https://cdn-icons-png.flaticon.com/512/4712/4712100.png",
                    }}
                    className="w-16 h-16 rounded-full border-2 border-green-400/70"
                  />
                  <Text className="text-white font-semibold text-sm mt-2">
                    {resultInfo.opponent?.name || "Bot"}
                  </Text>
                  <Text
                    className={`text-lg font-bold ${
                      botSymbol === "X" ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {botSymbol}
                  </Text>
                </View>
              </View>

              <View className="bg-gray-800/50 rounded-xl p-4 w-full">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-400 text-sm">Difficulty</Text>
                  <Text className="text-white font-semibold">
                    {game.level === 1
                      ? "Easy"
                      : game.level === 2
                        ? "Medium"
                        : "Hard"}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-400 text-sm">Total Moves</Text>
                  <Text className="text-white font-semibold">{moveCount}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleRestart}
                className="bg-blue-500 py-2 rounded-2xl active:scale-95"
              >
                <Text className="text-white text-center font-bold text-lg">
                  Play Again
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancel}
                className="border border-gray-600 py-2 rounded-2xl active:scale-95"
              >
                <Text className="text-gray-300 text-center font-medium text-lg">
                  Back to Menu
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
