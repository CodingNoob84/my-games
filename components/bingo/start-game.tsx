import { db } from "@/lib/db";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export const StartBingoGame = ({
  gameId,
  bgId,
  board,
}: {
  gameId: string;
  bgId: string;
  board: number[];
}) => {
  const router = useRouter();
  const [currentBoard, setCurrentBoard] = useState<number[]>(board);

  const shuffleNumbers = () => {
    const shuffled = [...currentBoard]
      .sort(() => Math.random() - 0.5)
      .slice(0, 25);

    setCurrentBoard(shuffled);
  };

  const startGame = async () => {
    await db.transact([
      db.tx.bingo[gameId].update({
        status: "playing", // mark game as started
        updatedAt: Date.now(),
      }),
      db.tx.bingoplayers[bgId].update({
        board: currentBoard, // 🔥 save the updated board for the player
      }),
    ]);
  };

  return (
    <View className="p-4">
      <View className="bg-gray-800 rounded-2xl p-4 border border-gray-700 mb-8">
        {currentBoard.length > 0 &&
          Array.from({ length: 5 }, (_, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-center">
              {currentBoard
                .slice(rowIndex * 5, rowIndex * 5 + 5)
                .map((number: number, colIndex: number) => (
                  <TouchableOpacity
                    key={colIndex}
                    className="w-12 h-12 items-center justify-center rounded-lg border-2 border-gray-600 mx-1 my-1 bg-gray-700"
                  >
                    <Text className="text-lg font-bold text-white">
                      {number}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          ))}
      </View>

      <View className="space-y-4">
        <TouchableOpacity
          onPress={shuffleNumbers}
          className="py-4 rounded-2xl border-2 items-center justify-center bg-purple-600 border-purple-500 active:bg-purple-700"
        >
          <Text className="text-lg font-bold text-white">
            🔀 Shuffle Numbers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={startGame}
          className="py-4 rounded-2xl border-2 items-center justify-center bg-green-500 border-green-600 active:bg-green-700"
        >
          <Text className="text-white text-lg font-bold">🎮 Start Game</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={() => router.back()}
          className="py-3 rounded-2xl border border-gray-600 items-center justify-center active:bg-gray-800"
        >
          <Text className="text-gray-300 text-lg font-medium">
            ← Back to Menu
          </Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};
