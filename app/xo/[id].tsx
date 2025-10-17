import { db } from "@/lib/db";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function XOGame() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = db.useQuery(
    id
      ? {
          xogame: { $: { where: { key: id as string } } },
        }
      : { xogame: {} }
  );
  const game = data?.xogame?.[0];

  const makeMove = useCallback(() => {
    // placeholder for move logic
  }, []);

  if (!id) return null;
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0b0b41]">
        <Text className="text-white">Loading game...</Text>
      </View>
    );
  }
  if (!game) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0b0b41]">
        <Text className="text-white">Game not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-[#0b0b41]">
      <Text className="text-white text-xl font-semibold">XO Game</Text>
      <Text className="text-gray-300 mt-2">Key: {game.key}</Text>
      <TouchableOpacity
        onPress={makeMove}
        className="mt-6 rounded-xl px-6 py-3 bg-[#f4511e]"
      >
        <Text className="text-white font-semibold">Demo Move</Text>
      </TouchableOpacity>
    </View>
  );
}
