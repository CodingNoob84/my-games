import { Bot, getRandomBot } from "@/query/user";
import { createXOGame } from "@/query/xogame";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const LEVELS = [
  { level: 1, name: "Easy", color: "green" },
  { level: 2, name: "Medium", color: "yellow" },
  { level: 3, name: "Hard", color: "red" },
];

const AVATAR_FOLDER_PATH = "../../assets/avatars/";
const botAvatars = [
  require(`${AVATAR_FOLDER_PATH}1.png`),
  require(`${AVATAR_FOLDER_PATH}2.png`),
  require(`${AVATAR_FOLDER_PATH}3.png`),
  require(`${AVATAR_FOLDER_PATH}4.png`),
  require(`${AVATAR_FOLDER_PATH}5.png`),
  require(`${AVATAR_FOLDER_PATH}6.png`),
];
const LOADING_TIMEOUT = 3000;
const GAME_START_DELAY = 2000;

export const PlayWithBot = ({ myId }: { myId: string }) => {
  const router = useRouter();
  const [level, setLevel] = useState<number>(1);
  const [creating, setCreating] = useState(false);
  const [showBotModal, setShowBotModal] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [loadingStage, setLoadingStage] = useState<
    "selecting" | "found" | "starting"
  >("selecting");

  const avatarIntervalRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const clearAllTimers = () => {
    if (avatarIntervalRef.current) clearInterval(avatarIntervalRef.current);
    avatarIntervalRef.current = null;
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const handleStartBotGame = async (level: number) => {
    console.log("Starting bot game at level:", level);
    setCreating(true);
    setShowBotModal(true);
    setLoadingStage("selecting");
    setSelectedBot(null);
    clearAllTimers();

    let currentAvatarIndex = 0;

    // Start animated avatars
    avatarIntervalRef.current = setInterval(() => {
      currentAvatarIndex = (currentAvatarIndex + 1) % botAvatars.length;
      setSelectedBot({
        id: "",
        email: "",
        avatar: botAvatars[currentAvatarIndex],
        name: "Finding opponent...",
      });
    }, 250);

    try {
      // Simulate loading delay
      const botTimeout = setTimeout(async () => {
        // stop avatar animation
        if (avatarIntervalRef.current) {
          clearInterval(avatarIntervalRef.current);
          avatarIntervalRef.current = null;
        }

        const bot = await getRandomBot(level);
        if (!bot) throw new Error("Bot not found");

        setSelectedBot(bot);
        setLoadingStage("found");

        // wait a bit before starting
        const startTimeout = setTimeout(async () => {
          try {
            setLoadingStage("starting");
            const response = await createXOGame([myId, bot.id], "bot", level);
            if (response.success) {
              clearAllTimers();
              setShowBotModal(false);
              router.push(`/xo/${response.result}`);
            } else {
              throw new Error("Failed to create game");
            }
          } catch (err) {
            console.error("Error creating game:", err);
            clearAllTimers();
            setShowBotModal(false);
          }
        }, GAME_START_DELAY);

        timeoutsRef.current.push(startTimeout);
      }, LOADING_TIMEOUT);

      timeoutsRef.current.push(botTimeout);
    } catch (error) {
      console.error("Failed to start bot game:", error);
      clearAllTimers();
      setShowBotModal(false);
      setCreating(false);
    }
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Animated dots for “Finding opponent…”
  const [dots, setDots] = useState(".");
  useEffect(() => {
    if (loadingStage !== "selecting") return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, [loadingStage]);

  const getStageMessage = () => {
    switch (loadingStage) {
      case "selecting":
        return `Finding the perfect AI opponent${dots}`;
      case "found":
        return "Opponent found!";
      case "starting":
        return "Starting game...";
      default:
        return "Preparing your game...";
    }
  };

  const getStageColor = () => {
    switch (loadingStage) {
      case "selecting":
        return "text-amber-400";
      case "found":
        return "text-emerald-400";
      case "starting":
        return "text-blue-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <View className="px-6 mb-8">
      <View className="bg-gray-900/20 rounded-3xl p-6 border border-blue-200/20">
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mr-4">
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

        {/* Difficulty Selection */}
        <View className="mb-4">
          <View className="flex-row space-x-3">
            {LEVELS.map((item) => (
              <TouchableOpacity
                key={item.level}
                className={`flex-1 py-3 rounded-xl border ${
                  level === item.level
                    ? `bg-${item.color}-500/20 border-${item.color}-400`
                    : "bg-slate-700/50 border-slate-600"
                }`}
                onPress={() => setLevel(item.level)}
              >
                <Text
                  className={`text-center font-medium ${
                    level === item.level
                      ? `text-${item.color}-400`
                      : "text-slate-400"
                  }`}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Start Game Button */}
        <TouchableOpacity
          onPress={() => handleStartBotGame(level)}
          disabled={creating}
          className={`rounded-2xl py-4 items-center ${
            creating ? "bg-slate-600" : "bg-blue-500 active:scale-95"
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

      {/* Bot Selection Modal */}
      <Modal
        visible={showBotModal}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/70 justify-center items-center px-6">
          <View className="bg-slate-800 rounded-3xl p-8 w-full max-w-sm border border-slate-600">
            {/* Header */}
            <View className="items-center mb-8">
              <Text className="text-white text-2xl font-bold mb-2">
                Finding Opponent
              </Text>
              <Text className={`text-base font-medium ${getStageColor()}`}>
                {getStageMessage()}
              </Text>
            </View>

            {/* Bot Avatar */}
            <View className="items-center mb-8">
              <View className="w-24 h-24 bg-slate-700 rounded-2xl items-center justify-center mb-4 border-2 border-slate-600 overflow-hidden">
                {selectedBot ? (
                  <Image
                    source={
                      typeof selectedBot.avatar === "string"
                        ? { uri: selectedBot.avatar } // for remote images
                        : selectedBot.avatar // for local require() assets
                    }
                    resizeMode="contain"
                    className="w-24 h-24"
                    style={{
                      opacity: loadingStage === "selecting" ? 0.85 : 1,
                      transform: [
                        { scale: loadingStage === "selecting" ? 0.95 : 1 },
                      ],
                    }}
                  />
                ) : (
                  <ActivityIndicator size="large" color="#3b82f6" />
                )}
              </View>

              <Text className="text-white text-xl font-bold text-center mb-1">
                {selectedBot?.name || "Searching..."}
              </Text>
              <Text className="text-slate-400 text-sm text-center">
                Level {level} • {["Easy", "Medium", "Hard"][level - 1]}
              </Text>
            </View>

            {/* Loading Message */}
            <View className="items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-slate-400 text-sm mt-3 text-center">
                {loadingStage === "selecting" && "Scanning AI opponents..."}
                {loadingStage === "found" && "Opponent locked in!"}
                {loadingStage === "starting" && "Initializing game board..."}
              </Text>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => {
                clearAllTimers();
                setShowBotModal(false);
                setCreating(false);
              }}
              disabled={loadingStage === "starting"}
              className={`mt-6 border border-slate-600 py-3 rounded-2xl items-center ${
                loadingStage === "starting" ? "opacity-40" : ""
              }`}
            >
              <Text className="text-slate-400 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
