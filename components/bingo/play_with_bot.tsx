import { createBoxBingoGame } from "@/query/bingo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export const PlayWithBot = ({ myId }: { myId: string }) => {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleStartBotGame = async () => {
    console.log("Starting bot game");
    setCreating(true);
    try {
      const response = await createBoxBingoGame(myId);
      if (response.success) {
        setCreating(false);
        router.push(`/bingo/${response.result}`);
      } else {
        throw new Error("Failed to create game");
      }
    } catch (error) {
      setCreating(false);
    }
  };

  return (
    <View className="px-6 mb-8">
      <View className="bg-gray-900/20 rounded-3xl p-6 border border-blue-200/20">
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mr-4">
            <MaterialCommunityIcons name="robot" size={28} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold mb-1">
              Play vs AI
            </Text>
            <Text className="text-slate-300 text-sm">
              Challenge our intelligent bot
            </Text>
          </View>
        </View>

        {/* Start Game Button */}
        <TouchableOpacity
          onPress={handleStartBotGame}
          disabled={creating}
          className={`rounded-2xl py-4 items-center ${
            creating ? "bg-slate-600" : "bg-blue-500 active:scale-95"
          }`}
        >
          {creating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="play" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Start Bot Game
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
