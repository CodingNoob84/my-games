import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Types
type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  character: {
    name: string;
    image: string;
    power: string;
  };
  isOnline: boolean;
  points: number;
  isRevealed?: boolean;
};

// Dummy data
const dummyUsers: User[] = [
  {
    id: "1",
    name: "You",
    email: "you@example.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    character: {
      name: "Police",
      image:
        "https://images.unsplash.com/photo-1587351021759-3ca5ed7c1e7e?w=150&h=150&fit=crop",
      power: "Find the thief among players",
    },
    isOnline: true,
    points: 1250,
    isRevealed: true,
  },
  {
    id: "2",
    name: "Alice Sharma",
    email: "alice@example.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    character: {
      name: "King",
      image:
        "https://images.unsplash.com/photo-1543365066-f488401f5c6a?w=150&h=150&fit=crop",
      power: "Can eliminate any character",
    },
    isOnline: true,
    points: 980,
    isRevealed: true,
  },
  {
    id: "3",
    name: "Raj Kumar",
    email: "raj@example.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    character: {
      name: "Thief",
      image:
        "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop",
      power: "Can steal powers temporarily",
    },
    isOnline: true,
    points: 1120,
    isRevealed: false,
  },
  {
    id: "4",
    name: "Priya Patel",
    email: "priya@example.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    character: {
      name: "Queen",
      image:
        "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=150&h=150&fit=crop",
      power: "Can protect any character",
    },
    isOnline: false,
    points: 750,
    isRevealed: false,
  },
  {
    id: "5",
    name: "Mike Johnson",
    email: "mike@example.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    character: {
      name: "Bishop",
      image:
        "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=150&h=150&fit=crop",
      power: "Can reveal character identities",
    },
    isOnline: true,
    points: 890,
    isRevealed: false,
  },
  {
    id: "6",
    name: "Sneha Gupta",
    email: "sneha@example.com",
    avatar:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face",
    character: {
      name: "Soldier",
      image:
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop",
      power: "Can attack adjacent characters",
    },
    isOnline: true,
    points: 1050,
    isRevealed: false,
  },
];

// Character colors for badges
const characterColors: { [key: string]: string } = {
  King: "bg-yellow-500",
  Queen: "bg-pink-500",
  Bishop: "bg-purple-500",
  Soldier: "bg-green-500",
  Police: "bg-blue-500",
  Thief: "bg-red-500",
};

export default function RajaRaniGame() {
  const [users, setUsers] = useState<User[]>(dummyUsers);
  const [investigationModal, setInvestigationModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<"success" | "failed" | null>(
    null
  );

  const currentUser = users.find((user) => user.name === "You");

  const handleInvestigatePlayer = (player: User) => {
    if (player.name === "You" || player.isRevealed) {
      return; // Can't investigate yourself or already revealed players
    }
    setSelectedPlayer(player);
    setInvestigationModal(true);
  };

  const confirmInvestigation = () => {
    if (!selectedPlayer) return;

    setInvestigationModal(false);

    // Check if the selected player is the thief
    const isThief = selectedPlayer.character.name === "Thief";

    if (isThief) {
      setGameResult("success");
      // Reveal all characters
      const updatedUsers = users.map((user) => ({
        ...user,
        isRevealed: true,
      }));
      setUsers(updatedUsers);
    } else {
      setGameResult("failed");
      // Only reveal the investigated player's character
      const updatedUsers = users.map((user) =>
        user.id === selectedPlayer.id ? { ...user, isRevealed: true } : user
      );
      setUsers(updatedUsers);
    }

    setGameOver(true);
  };

  const cancelInvestigation = () => {
    setInvestigationModal(false);
    setSelectedPlayer(null);
  };

  const resetGame = () => {
    setUsers(dummyUsers);
    setGameOver(false);
    setGameResult(null);
    setSelectedPlayer(null);
  };

  const renderUserCard = (user: User) => {
    const isCurrentUser = user.name === "You";
    const isRevealed = user.isRevealed || isCurrentUser;

    return (
      <TouchableOpacity
        key={user.id}
        className={`bg-gray-800 rounded-2xl p-4 mx-4 mb-3 ${
          isCurrentUser ? "border-2 border-blue-400" : "border border-gray-700"
        } ${!isCurrentUser && !user.isRevealed ? "active:bg-gray-750" : ""}`}
        onPress={() =>
          !isCurrentUser && !user.isRevealed && handleInvestigatePlayer(user)
        }
        disabled={isCurrentUser || user.isRevealed || gameOver}
      >
        <View className="flex-row items-center justify-between">
          {/* User Info - Left Side */}
          <View className="flex-row items-center flex-1">
            <View className="relative">
              <Image
                source={{ uri: user.avatar }}
                className="w-12 h-12 rounded-full"
              />
              <View
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                  user.isOnline ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </View>

            <View className="ml-3 flex-1">
              <View className="flex-row items-center">
                <Text className="text-white font-semibold text-base">
                  {user.name}
                </Text>
                {isCurrentUser && (
                  <View className="bg-blue-500 px-2 py-1 rounded-full ml-2">
                    <Text className="text-white text-xs font-bold">You</Text>
                  </View>
                )}
              </View>

              <Text className="text-gray-400 text-sm">{user.email}</Text>

              <View className="flex-row items-center mt-1">
                <Text className="text-yellow-400 text-sm font-medium">
                  +{Math.floor(Math.random() * 50) + 10} points
                </Text>
              </View>
            </View>
          </View>

          {/* Character Info - Right Side */}
          <View className="items-center">
            {isRevealed ? (
              <>
                <Image
                  source={{ uri: user.character.image }}
                  className="w-12 h-12 rounded-lg"
                />
                <View
                  className={`mt-1 ${characterColors[user.character.name]} px-2 py-1 rounded-full`}
                >
                  <Text className="text-white text-xs font-bold">
                    {user.character.name}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View className="w-12 h-12 rounded-lg bg-gray-700 items-center justify-center">
                  <Text className="text-gray-400 text-lg">?</Text>
                </View>
                <View className="mt-1 bg-gray-600 px-2 py-1 rounded-full">
                  <Text className="text-gray-300 text-xs font-bold">
                    Hidden
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Police Action Button */}
        {isCurrentUser && user.character.name === "Police" && !gameOver && (
          <View className="mt-4">
            <Text className="text-white font-semibold mb-2 text-center">
              🕵️ Tap on any hidden player to investigate!
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-900"
      contentContainerStyle={{
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="items-center my-6">
        <Text className="text-yellow-400 text-4xl font-bold mb-2">
          RajaRani
        </Text>
        <Text className="text-gray-400">Police vs Thief Mission</Text>
        <View className="flex-row mt-2">
          <View className="bg-green-500 px-3 py-1 rounded-full mr-2">
            <Text className="text-white text-xs font-bold">
              {users.filter((u) => u.isOnline).length} Online
            </Text>
          </View>
          <View className="bg-blue-500 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">
              {users.length} Players
            </Text>
          </View>
        </View>
      </View>

      {/* Game Result Banner */}
      {gameOver && gameResult && (
        <View
          className={`mx-4 mb-6 rounded-2xl p-4 ${
            gameResult === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <Text className="text-white text-xl font-bold text-center mb-2">
            {gameResult === "success"
              ? "🎉 Mission Successful! 🎉"
              : "❌ Mission Failed! ❌"}
          </Text>
          <Text className="text-white text-center">
            {gameResult === "success"
              ? "You caught the Thief! All characters revealed."
              : `Wrong guess! ${selectedPlayer?.name} was not the Thief.`}
          </Text>
          <TouchableOpacity
            className="bg-white mt-3 py-2 rounded-lg"
            onPress={resetGame}
          >
            <Text className="text-gray-900 text-center font-bold">
              Play Again
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Game Info */}
      {!gameOver && (
        <View className="bg-gray-800 rounded-2xl p-4 mx-4 mb-6">
          <Text className="text-white text-lg font-bold mb-3 text-center">
            🕵️‍♂️ Mission Briefing
          </Text>
          <Text className="text-gray-400 text-sm mb-2">
            • You are the <Text className="text-blue-400">Police</Text>
          </Text>
          <Text className="text-gray-400 text-sm mb-2">
            • The <Text className="text-red-400">Thief</Text> is hiding among
            other players
          </Text>
          <Text className="text-gray-400 text-sm mb-2">
            • Only <Text className="text-yellow-400">King</Text> and your
            identity are revealed
          </Text>
          <Text className="text-gray-400 text-sm">
            • Tap on any hidden player to investigate!
          </Text>
        </View>
      )}

      {/* Revealed Characters Info */}
      {!gameOver && (
        <View className="flex-row justify-between mx-4 mb-6">
          <View className="bg-yellow-500/20 rounded-xl p-3 flex-1 mr-2">
            <View className="flex-row items-center">
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1543365066-f488401f5c6a?w=150&h=150&fit=crop",
                }}
                className="w-10 h-10 rounded-lg"
              />
              <View className="ml-2">
                <Text className="text-white font-semibold text-sm">King</Text>
                <Text className="text-gray-300 text-xs">Revealed</Text>
              </View>
            </View>
          </View>

          <View className="bg-blue-500/20 rounded-xl p-3 flex-1 ml-2">
            <View className="flex-row items-center">
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1587351021759-3ca5ed7c1e7e?w=150&h=150&fit=crop",
                }}
                className="w-10 h-10 rounded-lg"
              />
              <View className="ml-2">
                <Text className="text-white font-semibold text-sm">You</Text>
                <Text className="text-gray-300 text-xs">Police</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Players List */}
      <View>
        <Text className="text-white text-xl font-bold mx-4 mb-3">
          Players ({users.length})
        </Text>

        {users.map(renderUserCard)}
      </View>

      {/* Investigation Modal */}
      <Modal
        visible={investigationModal}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-gray-800 rounded-2xl p-6 mx-4 w-11/12">
            <Text className="text-white text-xl font-bold text-center mb-4">
              🕵️ Investigation
            </Text>

            <View className="bg-gray-700 rounded-xl p-4 mb-4">
              <Text className="text-white text-center text-lg font-semibold">
                Are you sure {selectedPlayer?.name} is the Thief?
              </Text>
              <Text className="text-gray-400 text-center text-sm mt-2">
                If correct: You win and all characters are revealed{"\n"}
                If wrong: Only this player's character is revealed
              </Text>
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-red-500 py-3 rounded-lg"
                onPress={cancelInvestigation}
              >
                <Text className="text-white text-center font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-green-500 py-3 rounded-lg"
                onPress={confirmInvestigation}
              >
                <Text className="text-white text-center font-bold">
                  Investigate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Game Controls */}
      <View className="flex-row mx-4 mt-6 space-x-3">
        <TouchableOpacity className="flex-1 bg-red-500 py-4 rounded-xl">
          <Text className="text-white text-center font-bold text-lg">
            Leave Game
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-gray-700 py-4 rounded-xl">
          <Text className="text-white text-center font-bold text-lg">Chat</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
