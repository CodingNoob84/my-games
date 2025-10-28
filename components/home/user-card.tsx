import { useProfile } from "@/query/user";
import { Image, Text, View } from "react-native";

export const UserCard = () => {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <View className="bg-gray-800 mx-4 mt-4 rounded-2xl p-6 border border-gray-700 shadow-lg shadow-black/20 items-center justify-center">
        <Text className="text-gray-400">Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="bg-gray-800 mx-4 mt-4 rounded-2xl p-6 border border-gray-700 shadow-lg shadow-black/20">
      <View className="flex-row items-center">
        {profile?.avatar ? (
          <Image
            source={{ uri: profile.avatar }}
            className="w-16 h-16 rounded-2xl border border-indigo-500"
          />
        ) : (
          <View className="w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-indigo-500/25">
            <Text className="text-white text-2xl font-bold">
              {profile?.name?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
        )}

        <View className="ml-4 flex-1">
          <Text className="text-xl font-bold text-white">{profile?.name}</Text>
          <Text className="text-gray-400 mt-1">{profile?.email}</Text>

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
  );
};
