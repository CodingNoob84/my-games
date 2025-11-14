import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";

const { width } = Dimensions.get("window");
const TILE_SIZE = (width - 64) / 5; // 5 columns with padding

const BoardGameScreen = () => {
  const router = useRouter();
  const [numbers, setNumbers] = useState<number[]>(
    Array.from({ length: 25 }, (_, i) => i + 1)
  );
  const [isGameStarted, setIsGameStarted] = useState(false);

  const shuffleNumbers = useCallback(() => {
    const shuffled = [...numbers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setNumbers(shuffled);
  }, [numbers]);

  const startGame = useCallback(() => {
    setIsGameStarted(true);
    Alert.alert("Game Started!", "The game has begun! Good luck!");
  }, []);

  const resetGame = useCallback(() => {
    setNumbers(Array.from({ length: 25 }, (_, i) => i + 1));
    setIsGameStarted(false);
  }, []);

  const handleNumberPress = useCallback(
    (number: number) => {
      if (!isGameStarted) return;
      Alert.alert("Number Pressed", `You pressed number: ${number}`);
    },
    [isGameStarted]
  );

  const renderItem = ({ item, drag, isActive }: any) => {
    console.log("Rendering item:", item, "isActive:", isActive);
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={!isGameStarted ? drag : undefined}
          onPress={() => handleNumberPress(item)}
          disabled={isGameStarted && !isActive}
          className={`items-center justify-center rounded-lg border-2 mx-1 my-1
          ${
            isGameStarted
              ? "bg-blue-500 border-blue-400"
              : "bg-gray-600 border-gray-500"
          }`}
          style={{
            width: TILE_SIZE,
            height: TILE_SIZE,
            opacity: isActive ? 0.7 : 1,
          }}
        >
          <Text
            className={`text-lg font-bold ${
              isGameStarted ? "text-white" : "text-gray-300"
            }`}
          >
            {item}
          </Text>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-gradient-to-b from-gray-900 via-gray-950 to-black"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 px-2 pt-16 pb-8">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-white mb-2">
            Number Board Game
          </Text>
          <Text className="text-gray-400 text-center">
            {isGameStarted
              ? "Game in progress - Tap numbers!"
              : "Long-press & drag to reorder before starting"}
          </Text>
        </View>

        {/* Game Board */}
        <View className="bg-gray-800 rounded-2xl p-4 border border-gray-700 mb-8 items-center">
          <DraggableFlatList
            data={numbers}
            onDragEnd={({ data }) => {
              console.log("Dragged data:", data);
              setNumbers(data);
            }}
            keyExtractor={(item) => item.toString()}
            renderItem={renderItem}
            numColumns={5}
            scrollEnabled={false}
          />
        </View>

        {/* Game Info */}
        <View className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-400 text-sm">Game Status</Text>
            <View
              className={`px-3 py-1 rounded-full ${
                isGameStarted ? "bg-green-500/20" : "bg-yellow-500/20"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isGameStarted ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {isGameStarted ? "In Progress" : "Not Started"}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400 text-sm">Numbers</Text>
            <Text className="text-white font-semibold">1 - 25</Text>
          </View>
        </View>

        {/* Controls */}
        <View className="space-y-4">
          <TouchableOpacity
            onPress={shuffleNumbers}
            disabled={isGameStarted}
            className={`py-4 rounded-2xl border-2 items-center justify-center
              ${
                isGameStarted
                  ? "bg-gray-700 border-gray-600"
                  : "bg-purple-600 border-purple-500 active:bg-purple-700"
              }`}
          >
            <Text
              className={`text-lg font-bold ${
                isGameStarted ? "text-gray-400" : "text-white"
              }`}
            >
              🔀 Shuffle Numbers
            </Text>
            {isGameStarted && (
              <Text className="text-gray-400 text-xs mt-1">
                Cannot shuffle during game
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={isGameStarted ? resetGame : startGame}
            className={`py-4 rounded-2xl border-2 items-center justify-center
              ${
                isGameStarted
                  ? "bg-red-600 border-red-500 active:bg-red-700"
                  : "bg-green-600 border-green-500 active:bg-green-700"
              }`}
          >
            <Text className="text-white text-lg font-bold">
              {isGameStarted ? "🔄 Reset Game" : "🎮 Start Game"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="py-3 rounded-2xl border border-gray-600 items-center justify-center active:bg-gray-800"
          >
            <Text className="text-gray-300 text-lg font-medium">
              ← Back to Menu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View className="mt-8 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
          <Text className="text-blue-400 font-semibold mb-2">How to Play:</Text>
          <Text className="text-blue-300 text-sm">
            1. Long-press and drag numbers to rearrange{"\n"}
            2. Press "Start Game" to begin{"\n"}
            3. Tap numbers in sequence or follow your own rules{"\n"}
            4. Reset to start over
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default BoardGameScreen;
