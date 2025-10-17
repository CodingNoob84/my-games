import { db } from "@/lib/db";
import { getRandomBot } from "@/query/user";
import { createXOGame } from "@/query/xogame";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ROOM = db.room("xo", "global-xo");

export default function XOIndex() {
  const router = useRouter();
  const { user } = db.useAuth();
  const [creating, setCreating] = useState(false);
  const me = db.useUser();
  const bot = getRandomBot();

  // Track your presence and peers
  const {
    user: myPresence,
    peers,
    publishPresence,
  } = db.rooms.usePresence(ROOM, {
    initialData: { id: me.id },
  });

  // Update presence whenever name changes
  useEffect(() => {
    if (me.id) {
      publishPresence({ id: me.id });
    }
  }, [me.id, publishPresence]);

  // Compute all online user IDs (me + peers)
  const userIds = useMemo(() => {
    if (!peers) return myPresence ? [myPresence.id] : [];
    const others = Object.values(peers)
      .map((p: any) => p.id)
      .filter(Boolean);
    return others;
  }, [peers, myPresence?.id]);

  // Query user profiles for all online IDs
  const queryInput = useMemo(
    () => ({
      $users: {
        $: { where: { id: { $in: userIds.length ? userIds : ["__none__"] } } },
        profile: {},
      },
    }),
    [userIds]
  );

  const { data } = db.useQuery(queryInput);
  const users = data?.$users ?? [];

  const handleStartBotGame = async () => {
    if (bot) {
      const result = await createXOGame([me.id, bot.id]);
      console.log("-->", result);
    }
  };

  const startBotGame = useCallback(async () => {
    if (!user) return;
    setCreating(true);
    try {
      const key = `xo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const tx = db.tx.xogame[key].update({
        key,
        playerXUserId: user.id as string,
        playerOUserId: "bot",
        type: "bot",
        status: "in_progress",
        updatedAt: Date.now(),
      });
      await db.transact([tx]);
      router.push({ pathname: "/xo/[id]", params: { id: key } });
    } finally {
      setCreating(false);
    }
  }, [user]);

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

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a2e]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center pt-8 pb-6">
          <Text className="text-3xl font-bold text-white mb-2">XO Lobby</Text>
          <Text className="text-gray-400 text-base">
            Challenge players or play vs AI
          </Text>
        </View>

        {/* Main Card */}
        <View className="mx-4 bg-gray-800 rounded-3xl p-6 border border-gray-700 shadow-2xl shadow-black/40 mb-6">
          {/* Play vs Bot Section */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
              <MaterialCommunityIcons name="robot" size={32} color="white" />
            </View>
            <Text className="text-white text-xl font-bold mb-2">
              Play vs AI
            </Text>
            <Text className="text-gray-400 text-center mb-4">
              Challenge our smart bot opponent
            </Text>
            <TouchableOpacity
              onPress={startBotGame}
              disabled={creating}
              className={`w-full rounded-2xl py-4 items-center shadow-lg ${
                creating
                  ? "bg-gray-600"
                  : "bg-gradient-to-r from-orange-500 to-red-500"
              }`}
            >
              {creating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Play with Bot
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Online Users Section */}
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">
                Online Players
              </Text>
              <View className="flex-row items-center bg-indigo-500/20 px-3 py-1 rounded-full">
                <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                <Text className="text-indigo-300 text-sm font-medium">
                  {userIds.length} online
                </Text>
              </View>
            </View>

            {users.length === 0 ? (
              <View className="bg-gray-700/50 rounded-2xl p-6 items-center border border-gray-600/50">
                <Ionicons name="people-outline" size={48} color="#6b7280" />
                <Text className="text-gray-400 text-lg mt-2 font-medium">
                  No one online yet
                </Text>
                <Text className="text-gray-500 text-center mt-1">
                  Be the first to start playing!
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {users.map((u: any) => (
                  <View
                    key={u.id}
                    className="bg-gray-700/50 rounded-2xl p-4 border border-gray-600/50 flex-row items-center"
                  >
                    {/* User Avatar */}
                    <View className="w-12 h-12 bg-indigo-500 rounded-xl items-center justify-center mr-4">
                      <Text className="text-white font-bold text-lg">
                        {getInitials(u.profile?.name, u.email, u.id)}
                      </Text>
                    </View>

                    {/* User Info */}
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-base">
                        {u.profile?.name || u.email || u.id.slice(0, 8)}
                      </Text>
                      <Text className="text-gray-400 text-sm mt-1">
                        {u.email || "No email"}
                      </Text>
                    </View>

                    {/* Challenge Button */}
                    <TouchableOpacity className="bg-indigo-500/20 px-4 py-2 rounded-xl border border-indigo-500/30">
                      <Text className="text-indigo-300 text-sm font-medium">
                        Challenge
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
