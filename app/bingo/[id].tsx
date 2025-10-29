import { db } from "@/lib/db";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Types
type Player = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  completedRows: string[];
  isCurrentPlayer?: boolean;
};

// Dummy data
const dummyPlayers: Player[] = [
  {
    id: "1",
    name: "You",
    email: "you@example.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    completedRows: ["B", "I", "N"],
    isCurrentPlayer: true,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    completedRows: ["B", "I"],
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    completedRows: ["B"],
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    completedRows: ["B", "I", "N", "G"],
  },
  {
    id: "5",
    name: "Alex Brown",
    email: "alex@example.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    completedRows: ["B", "I", "N", "G", "O"], // Full house!
  },
];

const MyBingoCard = [
  [5, 12, 18, 34, 51],
  [3, 16, 25, 38, 49],
  [7, 19, 0, 41, 56], // 0 represents FREE space
  [2, 14, 29, 40, 53],
  [9, 17, 28, 36, 55],
];

const BINGO_LETTERS = ["B", "I", "N", "G", "O"];

export default function BingoGame() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoading, error, data } = db.useQuery({
    numberly: {},
  });

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([
    5, 12, 18, 34, 51, 3, 16, 7, 19, 2, 14,
  ]); // Example called numbers
  const [currentNumber, setCurrentNumber] = useState<string>("");

  console.log("BingoGame - data:", data);

  // Get the current game data with safe access
  const gameData = data?.numberly?.[0];
  const currentPlayer = dummyPlayers.find((player) => player.isCurrentPlayer);

  if (id && isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg">Loading game...</Text>
      </View>
    );
  }

  if (id && !isLoading && !gameData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg">Game not found</Text>
      </View>
    );
  }

  if (!id && !data) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg">Invalid game ID</Text>
      </View>
    );
  }

  const handleNumberSelect = () => {
    if (currentNumber && !isNaN(Number(currentNumber))) {
      const num = parseInt(currentNumber);
      if (num >= 1 && num <= 75 && !selectedNumbers.includes(num)) {
        setSelectedNumbers([...selectedNumbers, num]);
        setCurrentNumber("");
      }
    }
  };

  const getHighestRowProgress = (completedRows: string[]) => {
    const progress = completedRows.length;
    switch (progress) {
      case 5:
        return "BINGO! 🎉";
      case 4:
        return "BING";
      case 3:
        return "BIN";
      case 2:
        return "BI";
      case 1:
        return "B";
      default:
        return "No rows";
    }
  };

  const getProgressColor = (completedRows: string[]) => {
    const progress = completedRows.length;
    switch (progress) {
      case 5:
        return "text-green-400";
      case 4:
        return "text-yellow-400";
      case 3:
        return "text-orange-400";
      case 2:
        return "text-blue-400";
      case 1:
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  const getProgressWidth = (completedRows: string[]) => {
    const progress = completedRows.length;
    return (progress / 5) * 100;
  };

  const getProgressBarColor = (completedRows: string[]) => {
    const progress = completedRows.length;
    switch (progress) {
      case 5:
        return "bg-green-500";
      case 4:
        return "bg-yellow-500";
      case 3:
        return "bg-orange-500";
      case 2:
        return "bg-blue-500";
      case 1:
        return "bg-purple-500";
      default:
        return "bg-gray-600";
    }
  };

  const formatCompletedRows = (completedRows: string[]) => {
    if (completedRows.length === 0) return "No completed rows";

    // Sort by progression: B, BI, BIN, BING, BINGO
    const order = ["B", "BI", "BIN", "BING", "BINGO"];
    const sortedRows = completedRows.sort(
      (a, b) => order.indexOf(a) - order.indexOf(b)
    );

    return sortedRows.join(" → ");
  };

  const renderMyBingoCard = () => {
    if (!currentPlayer) return null;

    return (
      <View className="bg-gray-800 rounded-2xl p-4 mx-4 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Image
              source={{ uri: currentPlayer.avatar }}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View>
              <Text className="text-white font-semibold">
                {currentPlayer.name}
              </Text>
              <Text className="text-gray-400 text-xs">
                {currentPlayer.email}
              </Text>
            </View>
          </View>
          <View className="bg-green-500 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">Your Turn</Text>
          </View>
        </View>

        {/* BINGO Header */}
        <View className="flex-row justify-center mb-2">
          {BINGO_LETTERS.map((letter) => (
            <View key={letter} className="flex-1 items-center">
              <Text className="text-yellow-400 font-bold text-lg">
                {letter}
              </Text>
            </View>
          ))}
        </View>

        {/* Bingo Card */}
        {MyBingoCard.map((row, rowIndex) => {
          const isRowComplete = row.every(
            (num, colIndex) => num === 0 || selectedNumbers.includes(num)
          );

          return (
            <View
              key={rowIndex}
              className={`flex-row justify-center mb-1 rounded-lg ${
                isRowComplete ? "bg-green-500/20" : ""
              }`}
            >
              {row.map((number, colIndex) => (
                <View
                  key={`${rowIndex}-${colIndex}`}
                  className={`flex-1 mx-1 py-3 rounded-lg items-center justify-center ${
                    number === 0
                      ? "bg-red-500" // FREE space
                      : selectedNumbers.includes(number)
                        ? "bg-green-500" // Called number
                        : "bg-gray-700" // Not called
                  }`}
                >
                  {number === 0 ? (
                    <Text className="text-white text-xs font-bold">FREE</Text>
                  ) : (
                    <Text className="text-white text-sm font-bold">
                      {number}
                    </Text>
                  )}
                  {selectedNumbers.includes(number) && number !== 0 && (
                    <View className="absolute inset-0 items-center justify-center">
                      <Text className="text-white text-lg font-bold">✕</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        {/* Progress */}
        <View className="mt-4 p-3 bg-gray-700 rounded-lg">
          <Text className="text-white font-semibold mb-1">Your Progress:</Text>
          <Text
            className={`font-bold ${getProgressColor(currentPlayer.completedRows)}`}
          >
            {getHighestRowProgress(currentPlayer.completedRows)}
          </Text>
          <Text className="text-gray-400 text-xs mt-1">
            Completed: {formatCompletedRows(currentPlayer.completedRows)}
          </Text>
        </View>
      </View>
    );
  };

  const renderOtherPlayers = () => {
    const otherPlayers = dummyPlayers.filter(
      (player) => !player.isCurrentPlayer
    );

    return (
      <View className="mt-4">
        <Text className="text-white text-xl font-bold mx-4 mb-3">
          Other Players ({otherPlayers.length})
        </Text>

        {otherPlayers.map((player) => (
          <View
            key={player.id}
            className="bg-gray-800 rounded-2xl p-4 mx-4 mb-3"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Image
                  source={{ uri: player.avatar }}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="text-white font-semibold">
                    {player.name}
                  </Text>
                  <Text className="text-gray-400 text-xs">{player.email}</Text>
                </View>
              </View>
              <View className={`px-3 py-1 rounded-full min-w-20`}>
                <Text
                  className={`text-center font-bold ${getProgressColor(player.completedRows)}`}
                >
                  {getHighestRowProgress(player.completedRows)}
                </Text>
              </View>
            </View>

            {/* Progress bar visualization */}
            <View className="mt-2 bg-gray-700 rounded-full h-2">
              <View
                className={`h-2 rounded-full ${getProgressBarColor(player.completedRows)}`}
                style={{
                  width: getProgressWidth(player.completedRows),
                }}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-900"
      contentContainerStyle={{
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="items-center my-6">
        <Text className="text-white text-3xl font-bold mb-2">BINGO</Text>
        <Text className="text-gray-400">Your turn to select a number!</Text>
      </View>

      {/* Number Input - Only show if it's your turn */}
      {currentPlayer?.isCurrentPlayer && (
        <View className="mx-4 mb-6">
          <Text className="text-white font-semibold mb-2 text-center">
            🎯 Your Turn - Select Next Number
          </Text>
          <View className="flex-row">
            <TextInput
              className="flex-1 bg-gray-800 text-white rounded-l-lg px-4 py-3 border-2 border-green-500"
              placeholder="Enter number (1-75)"
              placeholderTextColor="#9CA3AF"
              value={currentNumber}
              onChangeText={setCurrentNumber}
              keyboardType="number-pad"
              maxLength={2}
            />
            <TouchableOpacity
              className="bg-green-500 px-6 rounded-r-lg items-center justify-center"
              onPress={handleNumberSelect}
            >
              <Text className="text-white font-bold">Call</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-400 text-xs mt-2 text-center">
            Called numbers: {selectedNumbers.sort((a, b) => a - b).join(", ")}
          </Text>
        </View>
      )}

      {/* My Bingo Card */}
      {renderMyBingoCard()}

      {/* Other Players */}
      {renderOtherPlayers()}
    </ScrollView>
  );
}
