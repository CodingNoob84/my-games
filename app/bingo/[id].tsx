import { BingoGameArea } from "@/components/bingo/game-area";
import { db } from "@/lib/db";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function BingoGame() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { isLoading, data } = db.useQuery({
    bingo: {
      $: { where: { id: id || "" } },
    },
    bingoplayers: {
      $: { where: { bingoId: id || "" } },
    },
  });

  const gamedata = data?.bingo[0];
  const players = data?.bingoplayers;

  if (id && isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg">Loading game...</Text>
      </View>
    );
  }

  if (id && !isLoading && !data) {
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

  return (
    <ScrollView
      className="flex-1 bg-gradient-to-b from-gray-900 via-gray-950 to-black"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {gamedata && (
        <BingoGameArea gameData={gamedata} players={players || []} />
      )}
    </ScrollView>
  );
}
