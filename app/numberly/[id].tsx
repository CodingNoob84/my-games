import { db } from "@/lib/db";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MAX_GUESSES = 6;

export default function NumberlyGame() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoading, error, data } = db.useQuery({
    numberly: {},
  });

  const [currentGuess, setCurrentGuess] = useState<string[]>(Array(5).fill(""));
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  console.log("NumberlyGame - data:", data);

  // Get the current game data with safe access
  const gameData = data?.numberly?.[0];
  const board = gameData?.board || [];

  if (id && isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg">Loading game...</Text>
      </View>
    );
  }

  if (id && !isLoading && !gameData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg">Game not found</Text>
      </View>
    );
  }

  if (!id && !data) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg">Invalid game ID</Text>
      </View>
    );
  }

  const handleNumberInput = (number: string, index: number) => {
    const newGuess = [...currentGuess];

    // Only allow numbers and empty string
    if (number === "" || /^\d$/.test(number)) {
      newGuess[index] = number;
      setCurrentGuess(newGuess);

      // Auto-advance logic
      if (number !== "") {
        // Find next empty input
        let nextIndex = index + 1;
        while (nextIndex < 5 && newGuess[nextIndex] !== "") {
          nextIndex++;
        }

        if (nextIndex < 5) {
          setActiveInputIndex(nextIndex);
          // Focus the next input
          setTimeout(() => {
            inputRefs.current[nextIndex]?.focus();
          }, 10);
        } else {
          // All inputs are filled, focus submit button (we can't actually focus button in RN)
          // Just move active index to indicate completion
          setActiveInputIndex(5);
        }
      } else if (number === "" && index > 0) {
        // If deleting, move to previous input
        const prevIndex = index - 1;
        setActiveInputIndex(prevIndex);
        setTimeout(() => {
          inputRefs.current[prevIndex]?.focus();
        }, 10);
      }
    }
  };

  const handleSubmitGuess = async () => {
    const guessedArray = Array.from(currentGuess.join(""), Number);
    if (gameData) {
      await db.transact(
        db.tx.numberly[gameData.id].update({
          board: [...gameData?.board, guessedArray],
          guessCount: (gameData.guessCount || 0) + 1,
        })
      );
    }

    // Here you would typically submit the guess to your backend
    console.log("Submitting guess:", guessedArray);

    // Reset current guess
    setCurrentGuess(Array(5).fill(""));
    setActiveInputIndex(0);
    // Focus first input after submit
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 10);
  };

  const renderBoardRow = (row: (number | null)[], rowIndex: number) => {
    // Ensure row is always an array
    const safeRow = Array.isArray(row) ? row : Array(5).fill(null);
    const digits = Array.from(String(gameData?.givenNumber || "00000"), Number);

    return (
      <View key={rowIndex} className="flex-row justify-center mb-4">
        {safeRow.map((cell, cellIndex) => {
          if (cell === null) {
            return (
              <View
                key={cellIndex}
                className="w-12 h-12 mx-1 rounded-lg border-2 border-gray-600 bg-gray-800 items-center justify-center"
              >
                <Text className="text-white text-lg font-bold"></Text>
              </View>
            );
          }

          // Create copies for tracking used positions
          const targetDigits = [...digits];
          const guessDigits = [...safeRow];

          // First pass: mark exact matches (green)
          const exactMatches = new Set();
          for (let i = 0; i < 5; i++) {
            if (guessDigits[i] === targetDigits[i]) {
              exactMatches.add(i);
              targetDigits[i] = -1; // Mark as used
            }
          }

          // Second pass: mark partial matches (yellow)
          const partialMatches = new Set();
          for (let i = 0; i < 5; i++) {
            if (exactMatches.has(i)) continue; // Skip already matched positions

            const foundIndex = targetDigits.indexOf(guessDigits[i]);
            if (foundIndex !== -1) {
              partialMatches.add(i);
              targetDigits[foundIndex] = -1; // Mark as used
            }
          }

          // Determine cell color
          let backgroundColor = "bg-gray-500"; // Default - not in target
          let borderColor = "border-gray-400";

          if (exactMatches.has(cellIndex)) {
            backgroundColor = "bg-green-500";
            borderColor = "border-green-400";
          } else if (partialMatches.has(cellIndex)) {
            backgroundColor = "bg-yellow-500";
            borderColor = "border-yellow-400";
          }

          return (
            <View
              key={cellIndex}
              className={`w-12 h-12 mx-1 rounded-lg border-2 items-center justify-center ${backgroundColor} ${borderColor}`}
            >
              <Text className="text-white text-lg font-bold">{cell}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderInputRow = () => {
    return (
      <View className="flex-row justify-center mb-6">
        {currentGuess.map((number, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            className={`w-12 h-12 mx-1 rounded-lg border-2 text-white text-center text-lg font-bold ${
              activeInputIndex === index
                ? "border-blue-400 bg-gray-700"
                : "border-gray-500 bg-gray-800"
            }`}
            value={number}
            onChangeText={(text) => handleNumberInput(text, index)}
            keyboardType="number-pad"
            maxLength={1}
            onFocus={() => setActiveInputIndex(index)}
            selectTextOnFocus
          />
        ))}
      </View>
    );
  };

  // Calculate remaining attempts (don't render empty rows)
  const remainingAttempts = MAX_GUESSES - board.length;

  return (
    <ScrollView
      className="flex-1 bg-gray-900"
      contentContainerStyle={{
        flexGrow: 1,
        padding: 16,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Game Header */}
      <View className="items-center mb-8">
        <Text className="text-white text-2xl font-bold mb-2">Numberly</Text>
        <Text className="text-gray-400">Guess the 5-digit number!</Text>
        {gameData && (
          <Text className="text-gray-400 text-sm mt-1">
            Guess Count: {gameData.guessCount || 0} / {MAX_GUESSES}
          </Text>
        )}
      </View>

      {/* Game Board */}
      <View className="mb-8">
        <Text className="text-white text-lg font-semibold mb-4 text-center">
          Previous Guesses
        </Text>

        {/* Render existing board rows with null check */}
        {Array.isArray(board) &&
          board.map((row, index) => renderBoardRow(row, index))}

        {/* Don't render empty rows - only show actual guesses */}
        {board.length === 0 && (
          <View className="items-center py-4">
            <Text className="text-gray-500">
              No guesses yet. Make your first guess!
            </Text>
          </View>
        )}
      </View>

      {/* Current Guess Input */}
      <View className="mb-6">
        <Text className="text-white text-lg font-semibold mb-4 text-center">
          {board.length === 0 ? "Make Your First Guess" : "Your Next Guess"}
        </Text>
        {renderInputRow()}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className={`py-4 rounded-lg mx-4 ${
          currentGuess.every((val) => val !== "")
            ? "bg-blue-500"
            : "bg-blue-500/50"
        }`}
        onPress={handleSubmitGuess}
        disabled={!currentGuess.every((val) => val !== "")}
      >
        <Text className="text-white text-center text-lg font-bold">
          Submit Guess {remainingAttempts > 0 && `(${remainingAttempts} left)`}
        </Text>
      </TouchableOpacity>

      {/* Game Info */}
      <View className="mt-8 p-4 bg-gray-800 rounded-lg mx-4">
        <Text className="text-white font-semibold mb-2">How to Play:</Text>
        <Text className="text-gray-400 text-sm">
          • Guess the 5-digit number{"\n"}• Each digit must be between 0-9{"\n"}
          • You have {MAX_GUESSES} attempts{"\n"}• Green: correct digit &
          position{"\n"}• Yellow: correct digit, wrong position{"\n"}• Gray:
          digit not in number
        </Text>
      </View>
    </ScrollView>
  );
}
