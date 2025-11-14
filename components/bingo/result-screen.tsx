import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

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
  players: PlayerData[];
  markedNumbers: number[];
  wonBy: string | undefined;
  myId: string;
};

export const BingoResultsScreen = ({
  playersInfo,
  players,
  markedNumbers,
  wonBy,
  myId,
}: Props) => {
  const isWinner = myId === wonBy;

  /** 🔗 merge info + game data */
  const combinedPlayers = playersInfo.map((info) => {
    const playerData = players.find((p) => p.userId === info.id);
    return {
      ...info,
      ...playerData,
      isWinner: info.id === wonBy,
    };
  });

  const renderPlayerBoard = (player: any) => {
    const cellBase = "w-12 h-12 items-center justify-center rounded border";

    return (
      <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-700 mt-4">
        {/* 5x5 Grid */}
        <View className="space-y-1">
          {Array.from({ length: 5 }, (_, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-between">
              {player.board
                ?.slice(rowIndex * 5, rowIndex * 5 + 5)
                .map((number: number, colIndex: number) => {
                  const isMarked = markedNumbers.includes(number);
                  const isWinningNumber = player.winningArray?.some(
                    (line: number[]) => line.includes(number)
                  );

                  const cellStyle = isWinningNumber
                    ? "bg-yellow-500 border-yellow-400"
                    : isMarked
                      ? "bg-red-500/40 border-red-400"
                      : "bg-gray-700 border-gray-600";

                  const textStyle = isWinningNumber
                    ? "text-white"
                    : isMarked
                      ? "text-white"
                      : "text-gray-300";

                  return (
                    <View key={colIndex} className={`${cellBase} ${cellStyle}`}>
                      <Text className={`text-xs font-bold ${textStyle}`}>
                        {number}
                      </Text>
                    </View>
                  );
                })}
            </View>
          ))}
        </View>

        {/* Stats */}
        <View className="flex-row justify-between items-center mt-3 px-1">
          <Text className="text-gray-400 text-xs">
            Completed Lines:
            <Text className="text-white font-bold">
              {" "}
              {player.winningArray?.length || 0}/5
            </Text>
          </Text>
          <Text className="text-gray-400 text-xs">
            Marked:
            <Text className="text-white font-bold">
              {" "}
              {markedNumbers.length}/25
            </Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-950">
      {/* 🔥 Header */}
      <View
        className={`p-8 pb-10 rounded-b-3xl shadow-lg ${
          isWinner
            ? "bg-gradient-to-b from-green-600 to-green-800"
            : "bg-gradient-to-b from-red-600 to-red-800"
        }`}
      >
        <View className="items-center">
          <Text className="text-6xl mb-3">{isWinner ? "🏆" : "🎯"}</Text>

          <Text className="text-white text-4xl font-bold tracking-wide mb-2">
            {isWinner ? "VICTORY!" : "GAME OVER"}
          </Text>

          <Text className="text-white/90 text-lg text-center max-w-xs">
            {isWinner
              ? "You conquered the board! Well played 🎉"
              : "Don't give up — go for the next win! 💪"}
          </Text>
        </View>
      </View>

      {/* 🔽 Scrollable Body */}
      <ScrollView className="flex-1 p-4">
        {/* 🎮 Player Cards */}
        <View className="space-y-5">
          {combinedPlayers.map((player) => (
            <View
              key={player.id}
              className={`rounded-2xl p-5 border ${
                player.isWinner
                  ? "bg-green-500/10 border-green-400 shadow-green-500/20 shadow-md"
                  : "bg-gray-900/60 border-gray-700"
              }`}
            >
              {/* Player Row */}
              <View className="flex-row items-center mb-3">
                {/* Avatar */}
                <View
                  className={`w-14 h-14 rounded-full overflow-hidden border-2 mr-4 ${
                    player.isWinner ? "border-yellow-400" : "border-gray-600"
                  }`}
                >
                  {player.avatar ? (
                    <Image
                      source={
                        typeof player.avatar === "string"
                          ? { uri: player.avatar }
                          : player.avatar
                      }
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="flex-1 bg-gray-700 items-center justify-center">
                      <Text className="text-white text-xl">
                        {player.type === "bot" ? "🤖" : "👤"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Name + Status */}
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-white font-bold text-lg flex-1">
                      {player.name} {player.id === myId && "(You)"}
                    </Text>

                    {player.isWinner && (
                      <View className="bg-yellow-400 px-2 py-1 rounded-full">
                        <Text className="text-gray-900 text-xs font-bold">
                          WINNER 🏆
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* AI/Human chip + Progress */}
                  <View className="flex-row items-center">
                    {/* Type */}
                    <View
                      className={`px-2 py-1 rounded-full border mr-3 ${
                        player.type === "bot"
                          ? "bg-blue-500/20 border-blue-400/40"
                          : "bg-green-500/20 border-green-400/40"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          player.type === "bot"
                            ? "text-blue-300"
                            : "text-green-300"
                        }`}
                      >
                        {player.type === "bot" ? "🤖 AI" : "👤 Human"}
                      </Text>
                    </View>

                    {/* BINGO progress */}
                    <View className="flex-row">
                      {["B", "I", "N", "G", "O"].map((letter, i) => {
                        const active = i < (player.winningArray?.length || 0);
                        return (
                          <View
                            key={letter}
                            className={`w-5 h-5 rounded-full border mx-0.5 items-center justify-center ${
                              active
                                ? "bg-green-500 border-green-400"
                                : "bg-gray-800 border-gray-700"
                            }`}
                          >
                            <Text
                              className={`text-[8px] font-bold ${
                                active ? "text-white" : "text-gray-400"
                              }`}
                            >
                              {letter}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>

              {/* Board */}
              {renderPlayerBoard(player)}
            </View>
          ))}
        </View>

        {/* 📊 Game Stats */}
        <View className="bg-gray-900 rounded-2xl p-5 border border-gray-700 mt-8 mb-8">
          <Text className="text-white font-bold text-xl text-center mb-4">
            Game Statistics
          </Text>

          <View className="flex-row justify-between px-2">
            <Stat label="Total Players" value={combinedPlayers.length} />
            <Stat
              label="Winner"
              value={combinedPlayers.find((p) => p.isWinner)?.name || "Unknown"}
              color="text-yellow-400"
            />
            <Stat
              label="Top Lines"
              value={`${Math.max(
                ...combinedPlayers.map((p) => p.winningArray?.length || 0)
              )}/5`}
            />
          </View>
        </View>

        {/* Buttons */}
        <View className="pb-8">
          <TouchableOpacity
            onPress={() => {}}
            className={`py-4 rounded-2xl border-2 items-center justify-center ${
              isWinner
                ? "bg-green-600 border-green-500 active:bg-green-700"
                : "bg-blue-600 border-blue-500 active:bg-blue-700"
            }`}
          >
            <Text className="text-white text-lg font-bold">
              {isWinner ? "🎉 Celebrate Again" : "🔄 Play Again"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {}}
            className="py-3 rounded-2xl border border-gray-600 items-center justify-center active:bg-gray-800 mt-3"
          >
            <Text className="text-gray-300 text-base font-medium">
              Back to Menu
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const Stat = ({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: any;
  color?: string;
}) => (
  <View className="items-center">
    <Text className="text-gray-400 text-sm">{label}</Text>
    <Text className={`${color} text-xl font-bold`}>{value}</Text>
  </View>
);
