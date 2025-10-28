import { Text, View } from "react-native";

export const LoadingScreen = () => {
  return (
    <View className="flex-1 justify-center items-center bg-gray-900">
      {/* Animated Dots */}
      <View className="flex-row mb-6">
        <View className="w-4 h-4 bg-purple-500 rounded-full mx-1 animate-bounce" />
        <View
          className="w-4 h-4 bg-blue-500 rounded-full mx-1 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <View
          className="w-4 h-4 bg-green-500 rounded-full mx-1 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </View>
      <Text className="text-white text-lg font-semibold mb-2">
        Loading Game
      </Text>
      <Text className="text-gray-400 text-sm">
        Preparing your experience...
      </Text>
      <View className="w-48 h-1 bg-gray-700 rounded-full mt-6">
        <View className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-3/4" />
      </View>
    </View>
  );
};
