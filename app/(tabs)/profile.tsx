import { useProfile } from "@/query/user";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
    <SafeAreaView className="flex-1 bg-[#05051a]">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="items-center pt-10 pb-8">
          <Text className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Profile
          </Text>
          <Text className="text-gray-400 text-base">Manage your account</Text>
        </View>

        {/* Profile Card */}
        <View className="gap-4 mb-4">
          {/* Avatar */}
          <View className="items-center mb-8 relative">
            <View className="w-40 h-40 rounded-full border-4 border-indigo-500/40 overflow-hidden shadow-xl shadow-indigo-500/20">
              {profile?.avatar ? (
                <Image
                  source={{ uri: profile.avatar }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Ionicons name="person-outline" size={60} color="white" />
                </View>
              )}
            </View>
          </View>

          {/* Name Section */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-400 text-sm font-semibold tracking-wide">
                DISPLAY NAME
              </Text>
              {!isEditing && (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  className="flex-row items-center bg-indigo-600/20 px-3 py-2 rounded-xl active:scale-95"
                >
                  <Ionicons name="pencil" size={14} color="#818cf8" />
                  <Text className="text-indigo-300 ml-2 text-sm font-medium">
                    Edit
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <View>
                <TextInput
                  value={editedName}
                  onChangeText={setEditedName}
                  className="bg-gray-700/50 border-2 border-gray-600 rounded-2xl px-5 py-4 text-white text-xl text-center font-semibold"
                  placeholder="Enter your name"
                  placeholderTextColor="#6b7280"
                  autoFocus
                  selectionColor="#6366f1"
                />
                <View className="flex-row mt-4 space-x-3">
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    className="flex-1 bg-gray-700/40 rounded-2xl py-4 items-center border border-gray-600 active:scale-95"
                  >
                    <Text className="text-gray-300 font-semibold text-lg">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveName}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl py-4 items-center shadow-lg shadow-indigo-500/40 active:scale-95"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white font-semibold text-lg">
                        Save
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text className="text-white text-2xl font-bold text-center py-3 bg-gray-700/30 rounded-2xl">
                {profile?.name || "No name set"}
              </Text>
            )}
          </View>

          {/* Email Section */}
          <View>
            <Text className="text-gray-400 text-sm font-semibold tracking-wide mb-3">
              EMAIL ADDRESS
            </Text>
            <View className="bg-gray-700/30 rounded-2xl px-5 py-4 border border-gray-600/50">
              <Text className="text-gray-100 text-lg text-center font-medium">
                {profile?.email || "Not available"}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl py-5 items-center flex-row justify-center shadow-lg shadow-red-500/10 active:scale-95"
        >
          <Ionicons name="log-out-outline" size={20} color="#f87171" />
          <Text className="text-red-400 font-semibold text-lg ml-3">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
