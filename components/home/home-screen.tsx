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

// Components
const UserAvatar: React.FC<{ name: string; size?: number }> = ({
  name,
  size = 16,
}) => {
  const initial = name.charAt(0).toUpperCase();
  return (
    <View className="w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-indigo-500/25">
      <Text className="text-white text-2xl font-bold">{initial}</Text>
    </View>
  );
};

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

const StatsCard: React.FC = () => {
  const stats = [
    { label: "Games Played", value: "24", icon: "🎮" },
    { label: "Win Rate", value: "68%", icon: "🏆" },
    { label: "Level", value: "12", icon: "⭐" },
  ];

  return (
    <View className="mx-4 mt-4">
      <View className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-4 border border-gray-700">
        <View className="flex-row justify-between items-center">
          {stats.map((stat, index) => (
            <View key={stat.label} className="items-center flex-1">
              <Text className="text-2xl mb-1">{stat.icon}</Text>
              <Text className="text-white text-lg font-bold">{stat.value}</Text>
              <Text className="text-gray-400 text-xs mt-1">{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const QuickActions: React.FC = () => {
  const actions = [
    { icon: "🔍", label: "Discover", color: "bg-purple-500/20" },
    { icon: "👥", label: "Friends", color: "bg-blue-500/20" },
    { icon: "🏆", label: "Leaderboard", color: "bg-yellow-500/20" },
    { icon: "⚡", label: "Daily", color: "bg-green-500/20" },
  ];

  return (
    <View className="mx-4 mt-6">
      <Text className="text-xl font-bold text-white mb-3">Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row space-x-3">
          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              className={`${action.color} rounded-2xl p-4 items-center justify-center w-24 h-20 border border-gray-700`}
            >
              <Text className="text-2xl mb-2">{action.icon}</Text>
              <Text className="text-white text-sm font-medium text-center">
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
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
      <View className="bg-gray-800 mx-4 mt-4 rounded-2xl p-6 border border-gray-700 shadow-lg shadow-black/20">
        <View className="flex-row items-center">
          <UserAvatar name={userData.name} />
          <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-white">
              {userData.name}
            </Text>
            <Text className="text-gray-400 mt-1">{userData.email}</Text>
            <View className="flex-row mt-2">
              <View className="bg-indigo-500/20 px-3 py-1 rounded-full mr-2">
                <Text className="text-indigo-300 text-xs font-medium">
                  Pro Player
                </Text>
              </View>
              <View className="bg-gray-700 px-3 py-1 rounded-full">
                <Text className="text-gray-300 text-xs font-medium">
                  Level 12
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

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
