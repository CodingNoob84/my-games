import { db } from "@/lib/db";
import { useCustomPresence } from "@/provider/presence-provider";
import { createBotNumberly } from "@/query/numberly";
import { getRandomBot } from "@/query/user";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NumberlyIndex() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const me = db.useUser();
  const bot = getRandomBot();

  const { onlineUsers: users } = useCustomPresence();

  const handleStartBotGame = async () => {
    setCreating(true);
    try {
      if (bot) {
        const response = await createBotNumberly(me.id, "bot");
        if (response.success) {
          router.push(`/numberly/${response.result}`);
        }
      }
    } catch (error) {
      console.error("Failed to start bot game:", error);
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (name: string, email: string, id: string) => {
    if (name) {
      return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
    }
    return email ? email.charAt(0).toUpperCase() : id.slice(0, 2).toUpperCase();
  };

  const handleChallengePlayer = (playerId: string) => {
    console.log("Challenge player:", playerId);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-8 pb-6">
          <View className="flex-row items-center mb-2">
            <TouchableOpacity
              onPress={() => router.push("/")}
              className="w-10 h-10 bg-white/5 rounded-xl items-center justify-center border border-white/10 mr-4 active:bg-white/10"
            >
              <Ionicons name="chevron-back" size={24} color="#cbd5e1" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white">XO Lobby</Text>
            </View>
          </View>
          <Text className="text-slate-400 text-base ml-14">
            Challenge players or play vs AI
          </Text>
        </View>

        {/* Online Status Bar */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-emerald-400 rounded-full mr-3" />
              <Text className="text-slate-300 font-medium">Online Players</Text>
            </View>
            <Text className="text-white font-bold text-lg">{users.length}</Text>
          </View>
        </View>

        {/* Play vs Bot Section */}
        <View className="px-6 mb-8">
          <View className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-3xl p-6 border border-cyan-500/20">
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl items-center justify-center mr-4">
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

            <TouchableOpacity
              onPress={handleStartBotGame}
              disabled={creating}
              className={`rounded-2xl py-4 items-center ${
                creating
                  ? "bg-slate-600"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 active:scale-95"
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

        {/* Online Players Section */}
        <View className="px-6 mb-8">
          <View className="mb-4">
            <Text className="text-white text-xl font-bold mb-2">
              Available Players
            </Text>
            <Text className="text-slate-400 text-sm">
              Challenge other online players
            </Text>
          </View>

          {users.length === 0 ? (
            <View className="bg-white/5 rounded-2xl p-8 items-center border border-white/10">
              <Ionicons name="people-outline" size={48} color="#475569" />
              <Text className="text-slate-400 text-lg mt-4 font-semibold">
                No players online
              </Text>
              <Text className="text-slate-500 text-center mt-2 text-sm">
                You're the first one here!
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {users.map((u: any, index: number) => (
                <View
                  key={u.id}
                  className="bg-white/5 rounded-2xl p-4 border border-white/10 flex-row items-center"
                >
                  {/* User Avatar */}
                  <View className="relative mr-4">
                    <View className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl items-center justify-center">
                      <Text className="text-white font-bold text-base">
                        {getInitials(u.profile?.name, u.email, u.id)}
                      </Text>
                    </View>
                    <View className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-800" />
                  </View>

                  {/* User Info */}
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-base mb-1">
                      {u.profile?.name || u.email || "Anonymous Player"}
                    </Text>
                    <Text className="text-slate-400 text-xs">
                      {u.email || "Ready to play"}
                    </Text>
                  </View>

                  {/* Challenge Button */}
                  <TouchableOpacity
                    onPress={() => handleChallengePlayer(u.id)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 rounded-xl active:scale-95"
                  >
                    <Text className="text-white text-sm font-semibold">
                      Challenge
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-8">
          <Text className="text-white text-xl font-bold mb-4">
            Quick Actions
          </Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 items-center active:bg-white/10">
              <Ionicons name="person-add" size={24} color="#cbd5e1" />
              <Text className="text-slate-300 font-medium mt-2 text-sm text-center">
                Invite Friends
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 items-center active:bg-white/10">
              <Ionicons name="trophy" size={24} color="#cbd5e1" />
              <Text className="text-slate-300 font-medium mt-2 text-sm text-center">
                Leaderboard
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
