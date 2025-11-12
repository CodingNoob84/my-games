import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export const HeadingSection = ({ heading }: { heading: string }) => {
  const router = useRouter();
  return (
    <View className="px-6 pt-16 pb-8">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => router.push("/")}
          className="w-11 h-11 bg-white/5 rounded-xl items-center justify-center border border-white/10 mr-4 active:bg-white/10"
        >
          <Ionicons name="chevron-back" size={22} color="#94a3b8" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-white mb-1">{heading}</Text>
          <Text className="text-slate-400 text-sm">
            Challenge players or play vs AI
          </Text>
        </View>
      </View>
    </View>
  );
};
