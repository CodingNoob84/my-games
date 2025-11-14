import { Image, Text, View } from "react-native";

type PlayerData = {
  id: string;
  userId: string;
  bingoId: string;
  board: number[];
  winningArray: number[][];
};

type PlayerInfo = {
  id: string;
  name?: string;
  avatar?: string;
  level?: number;
  type: string;
};

type Props = {
  playersInfo: PlayerInfo[];
  currentTurn?: string;
  players: PlayerData[];
};

export const PlayersGrid = ({ playersInfo, currentTurn, players }: Props) => {
  return (
    <View className="p-3">
      <View className="flex-row flex-wrap justify-between">
        {playersInfo.slice(0, 4).map((user, index) => {
          const isCurrentTurn = user.id === currentTurn;

          const playerData = players.find((p) => p.userId === user.id);
          const winningCount = playerData?.winningArray?.length || 0;

          return (
            <View
              key={user.id}
              className={`w-[48%] rounded-xl p-3 border mb-3 ${
                isCurrentTurn
                  ? "bg-blue-500/20 border-blue-400/60"
                  : "bg-gray-800/80 border-gray-600/50"
              }`}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-gray-700 border border-gray-600 overflow-hidden mr-3">
                  <Image
                    source={
                      user.avatar
                        ? typeof user.avatar === "string"
                          ? { uri: user.avatar }
                          : user.avatar
                        : require("@/assets/avatars/1.png")
                    }
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text
                      className="text-white font-semibold text-sm flex-1"
                      numberOfLines={1}
                    >
                      {user.name}
                    </Text>
                    {isCurrentTurn && (
                      <View className="w-2 h-2 bg-green-400 rounded-full ml-1" />
                    )}
                  </View>

                  <View
                    className={`px-2 py-1 rounded-full self-start mt-1 ${
                      user.type === "bot"
                        ? "bg-blue-500/20 border border-blue-400/50"
                        : "bg-green-500/20 border border-green-400/50"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        user.type === "bot" ? "text-blue-300" : "text-green-300"
                      }`}
                    >
                      {user.type === "bot" ? "🤖 AI" : "👤 You"}
                    </Text>
                  </View>
                </View>
              </View>

              {isCurrentTurn && (
                <Text className="text-green-400 text-xs font-medium mt-2 text-center">
                  🎯 Current Turn
                </Text>
              )}

              {/* Bingo Progress */}
              <View className="flex flex-row justify-evenly items-center mt-2 bg-gray-900/50 rounded-lg p-2">
                {["B", "I", "N", "G", "O"].map((letter, i) => (
                  <View
                    key={i}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      i < winningCount
                        ? "bg-green-500 border-green-400"
                        : "bg-gray-700 border-gray-600"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        i < winningCount ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {letter}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
