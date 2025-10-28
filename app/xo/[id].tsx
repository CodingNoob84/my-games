import { XOGameArea } from "@/components/xogame/game-area";
import { useGameWithPlayers } from "@/query/xogame";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function XOGame() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { game, players, isLoading } = useGameWithPlayers(id || "");
  if (id && isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg">Loading game...</Text>
      </View>
    );
  }

  if (id && !isLoading && !game) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg">Game not found</Text>
      </View>
    );
  }

  // Show invalid ID message if no ID
  if (!id && !game) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg">Invalid game ID</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gradient-to-b from-gray-900 via-gray-950 to-black"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {game && <XOGameArea game={game} players={players} />}
    </ScrollView>
  );
}
