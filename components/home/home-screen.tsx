import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserCard } from "./user-card";

// Types
type User = {
  name: string;
  email: string;
  avatar?: string;
};

type Game = {
  id: number;
  name: string;
  icon: string;
  description: string;
  category?: string;
};

type FooterItem = {
  id: number;
  icon: string;
  label: string;
  isActive?: boolean;
};

// Mock data
const userData: User = {
  name: "John Doe",
  email: "john.doe@example.com",
};

const games: Game[] = [
  {
    id: 1,
    name: "XO (Tic Tac Toe)",
    icon: "⭕",
    description: "Classic XO game",
    category: "Strategy",
  },
  {
    id: 2,
    name: "Bingo",
    icon: "🎯",
    description: "Play Bingo with friends",
    category: "Luck",
  },
  {
    id: 3,
    name: "Numberly",
    icon: "🔢",
    description: "Number puzzle game",
    category: "Puzzle",
  },
  {
    id: 4,
    name: "Sudoku",
    icon: "9️⃣",
    description: "Logic-based number puzzle",
    category: "Logic",
  },
  {
    id: 5,
    name: "Chess",
    icon: "♟️",
    description: "Strategic board game",
    category: "Strategy",
  },
  {
    id: 6,
    name: "Checkers",
    icon: "⚫",
    description: "Classic checkers game",
    category: "Strategy",
  },
];

const GameCard: React.FC<{ game: Game; onPress: (game: Game) => void }> = ({
  game,
  onPress,
}) => {
  return (
    <TouchableOpacity
      className="bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-700 active:bg-gray-750 shadow-lg shadow-black/20"
      onPress={() => onPress(game)}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 bg-indigo-500/20 rounded-xl items-center justify-center mr-4">
          <Text className="text-2xl">{game.icon}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-white">
              {game.name}
            </Text>
            <View className="bg-gray-700 px-2 py-1 rounded-full">
              <Text className="text-xs text-gray-300 font-medium">
                {game.category}
              </Text>
            </View>
          </View>
          <Text className="text-gray-400 text-sm mt-1">{game.description}</Text>
        </View>
        <View className="ml-2">
          <Ionicons name="chevron-forward" size={20} color="#6b7280" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Main Component
const HomeScreen: React.FC = () => {
  const router = useRouter();
  const handleGamePress = (game: Game) => {
    console.log(`Game pressed: ${game.name}`);
    if (game.name.toLowerCase().includes("xo")) {
      router.push("/xo" as Href);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Header */}
      <View className="mx-4 mt-4 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-white">Welcome back</Text>
          <Text className="text-gray-400">Ready to play?</Text>
        </View>
        <TouchableOpacity className="bg-gray-800 p-2 rounded-xl">
          <Ionicons name="notifications-outline" size={24} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      {/* Top Card - User Profile */}
      <UserCard />

      {/* Games List Section */}
      <View className="flex-1 mt-6">
        <View className="px-4 mb-4">
          <Text className="text-xl font-bold text-white">Popular Games</Text>
          <Text className="text-gray-400 mt-1">Choose your adventure</Text>
        </View>

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {games.map((game) => (
            <GameCard key={game.id} game={game} onPress={handleGamePress} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
