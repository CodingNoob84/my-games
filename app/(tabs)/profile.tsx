import { useProfile } from "@/query/user";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileTab() {
  const { profile, isLoading: isProfileLoading } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    setIsLoading(true);
    try {
      // await db.updateUser({ name: editedName.trim() });
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update name");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(profile?.name || "");
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => console.log("Logout pressed"),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="items-center pt-10 pb-8 mb-8">
          <Text className="text-4xl font-bold text-white tracking-tight">
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <View className="bg-slate-800/40 rounded-3xl p-6 mb-8 border border-slate-700/50 shadow-xl shadow-black/20">
          {/* Avatar */}
          <View className="items-center mb-10 -mt-20">
            <View className="relative">
              <View className="w-32 h-32 rounded-3xl border-4 border-white/10 overflow-hidden shadow-2xl bg-gradient-to-br from-slate-700 to-slate-800">
                {profile?.avatar ? (
                  <Image
                    source={{ uri: profile.avatar }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex-1 items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Ionicons name="person" size={48} color="white" />
                  </View>
                )}
              </View>
              <View className="absolute -bottom-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-600 w-9 h-9 rounded-full items-center justify-center border-2 border-slate-900">
                <Ionicons name="sparkles" size={16} color="white" />
              </View>
            </View>
          </View>

          {/* Display Name */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-1">
                  Display Name
                </Text>
                <Text className="text-slate-400 text-sm">
                  Your public display name
                </Text>
              </View>

              {!isEditing && (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  className="flex-row items-center bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 active:bg-white/10"
                >
                  <Ionicons name="pencil" size={16} color="#cbd5e1" />
                  <Text className="text-slate-300 ml-2 text-sm font-medium">
                    Edit
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <View className="space-y-4">
                <TextInput
                  value={editedName}
                  onChangeText={setEditedName}
                  className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-lg font-medium placeholder-slate-500"
                  placeholder="Enter your name"
                  placeholderTextColor="#64748b"
                  selectionColor="#6366f1"
                />
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-4 items-center active:bg-white/10"
                  >
                    <Text className="text-slate-300 font-semibold text-base">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveName}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl py-4 items-center shadow-md active:opacity-90"
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white font-semibold text-base">
                        Save
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 items-center">
                <Text className="text-white text-xl font-semibold">
                  {profile?.name || "No name set"}
                </Text>
              </View>
            )}
          </View>

          {/* Email Section */}
          <View>
            <Text className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-1">
              Email Address
            </Text>
            <Text className="text-slate-400 text-sm mb-3">
              Your account email address
            </Text>
            <View className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex-row items-center justify-between">
              <Text className="text-slate-100 text-lg font-medium flex-shrink">
                {profile?.email || "Not available"}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row mb-8 space-x-4">
          <View className="flex-1 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
            <Text className="text-slate-400 text-sm font-medium mb-1">
              Member since
            </Text>
            <Text className="text-white text-lg font-semibold">
              {new Date().getFullYear()}
            </Text>
          </View>
          <View className="flex-1 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
            <Text className="text-slate-400 text-sm font-medium mb-1">
              Status
            </Text>
            <View className="flex-row items-center">
              <View className="w-2.5 h-2.5 bg-emerald-400 rounded-full mr-2" />
              <Text className="text-white text-lg font-semibold">Active</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center bg-red-500/10 border border-red-500/20 rounded-2xl py-4 active:bg-red-500/20"
        >
          <Ionicons name="log-out-outline" size={22} color="#f87171" />
          <Text className="text-red-400 font-semibold text-lg ml-2">
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
