import { findWinningLines } from "@/lib/bingo";
import { db } from "@/lib/db";
import { addBingoNumber } from "@/query/bingo";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export const UserInput = ({
  gameId,
  board,
  winningArray,
  markedNumbers,
  orderOfTurns,
  bpId,
}: {
  gameId: string;
  board: number[];
  winningArray: number[][];
  markedNumbers: number[];
  orderOfTurns: string[];
  bpId: string;
}) => {
  const me = db.useUser();
  const router = useRouter();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  /** 🟡 Check if number belongs to a winning line */
  const isWinningNumber = useCallback(
    (num: number) => winningArray.some((line) => line.includes(num)),
    [winningArray]
  );

  /** 🎨 Return color styles based on number status */
  const getNumberColor = useCallback(
    (num: number) => {
      if (isWinningNumber(num)) return "bg-yellow-500/60 border-yellow-400";
      if (selectedNumber === num) return "bg-green-500/40 border-green-400";
      if (markedNumbers.includes(num)) return "bg-red-500/40 border-red-400";
      return "bg-gray-700 border-gray-600";
    },
    [isWinningNumber, selectedNumber, markedNumbers]
  );

  /** ✔️ Safe, memoized rows (5x5) */
  const boardRows = useMemo(() => {
    return Array.from({ length: 5 }, (_, rowIndex) =>
      board.slice(rowIndex * 5, rowIndex * 5 + 5)
    );
  }, [board]);

  /** 🟢 Submit number */
  const submitSelectedNumber = useCallback(async () => {
    if (selectedNumber == null) return;

    const newMarked = [...markedNumbers, selectedNumber];
    const newTurns = [...orderOfTurns.slice(1), orderOfTurns[0]];

    const winningLines = findWinningLines(board, newMarked);

    await addBingoNumber(
      gameId,
      newMarked,
      newTurns,
      bpId,
      me.id,
      winningLines
    );

    setSelectedNumber(null);
  }, [selectedNumber, markedNumbers, orderOfTurns, board, gameId, bpId, me.id]);

  return (
    <View className="p-4">
      {/* Bingo Board */}
      <View className="bg-gray-800 rounded-2xl p-4 border border-gray-700 mb-8">
        {boardRows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row justify-center">
            {row.map((num, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                onPress={() => setSelectedNumber(num)}
                disabled={markedNumbers.includes(num)}
                className={`w-12 h-12 mx-1 my-1 rounded-lg border-2 items-center justify-center ${getNumberColor(
                  num
                )}`}
              >
                <Text className="text-lg font-bold text-white">{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Selected Number Display */}
      {selectedNumber !== null && (
        <View className="bg-blue-500/20 rounded-2xl p-4 border border-blue-400/50 mb-4">
          <Text className="text-white text-center font-semibold">
            Selected Number:{" "}
            <Text className="text-blue-300">{selectedNumber}</Text>
          </Text>
        </View>
      )}

      {/* Submit + Back Buttons */}
      <View className="space-y-4">
        <TouchableOpacity
          onPress={submitSelectedNumber}
          disabled={selectedNumber === null}
          className={`py-4 rounded-2xl border-2 items-center justify-center ${
            selectedNumber
              ? "bg-green-600 border-green-500 active:bg-green-700"
              : "bg-gray-600 border-gray-500"
          }`}
        >
          <Text
            className={`text-lg font-bold ${
              selectedNumber ? "text-white" : "text-gray-400"
            }`}
          >
            Submit Number
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="py-3 rounded-2xl border border-gray-600 items-center justify-center active:bg-gray-800"
        >
          <Text className="text-gray-300 text-lg font-medium">← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <Legend />
    </View>
  );
};

/** 🎯 Extract Legend into its own clean component */
const Legend = () => (
  <View className="mt-6 bg-gray-800/50 rounded-xl p-3 border border-gray-600/30">
    <Text className="text-white font-bold text-center mb-2">Legend</Text>

    <View className="flex-row justify-around">
      <LegendItem color="bg-yellow-500/60 border-yellow-400" label="Winning" />
      <LegendItem color="bg-green-500/40 border-green-400" label="Selected" />
      <LegendItem color="bg-red-500/40 border-red-400" label="Marked" />
      <LegendItem color="bg-gray-700 border-gray-600" label="Available" />
    </View>
  </View>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <View className="items-center">
    <View className={`w-6 h-6 rounded-lg mb-1 border ${color}`} />
    <Text className="text-gray-300 text-xs">{label}</Text>
  </View>
);
