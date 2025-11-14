import { db } from "@/lib/db";
import { getInitials } from "@/lib/utils";
import { useCustomPresence } from "@/provider/presence-provider";
import { useProfile } from "@/query/user";
import Ionicons from "@expo/vector-icons/Ionicons";
import { id as generateId } from "@instantdb/react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ---------- Types ----------

type Player = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
};

type Request = {
  id: string;
  status: string;
  fromUserId: string;
  toUserId: string;
  gametype: string;
  createdAt: number;
  fromInit?: boolean;
  toInit?: boolean;
  cancelledBy?: string | null;
};

// ---------- AvailablePlayers ----------

interface AvailablePlayersProps {
  myId: string;
  gameType: string;
}

export const AvailablePlayers: React.FC<AvailablePlayersProps> = ({
  myId,
  gameType,
}: {
  myId: string;
  gameType: string;
}) => {
  const { onlineUsers: players } = useCustomPresence();
  // Subscribe to all requests related to this user for "xo" games
  const { data } = db.useQuery({
    requests: {
      $: {
        where: {
          gametype: gameType,
          or: [{ fromUserId: myId }, { toUserId: myId }],
        },
      },
    },
  });

  const requests: Request[] = data?.requests ?? [];

  return (
    <View className="px-6 mb-8">
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-white text-xl font-bold mb-1">
            Available Players
          </Text>
          <Text className="text-slate-400 text-sm">
            Challenge other online players
          </Text>
        </View>
        <View className="flex-row items-center bg-emerald-500/20 px-3 py-1 rounded-full">
          <View className="w-2 h-2 bg-emerald-400 rounded-full mr-2" />
          <Text className="text-emerald-400 text-xs font-medium">
            {players.length} online
          </Text>
        </View>
      </View>

      {/* Players */}
      <View className="space-y-3">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            myId={myId}
            player={player}
            requests={requests}
          />
        ))}
      </View>
    </View>
  );
};

// ---------- PlayerCard ----------

interface PlayerCardProps {
  player: Player;
  myId: string;
  requests: Request[];
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, myId, requests }) => {
  const req = useMemo(
    () =>
      requests.find(
        (r) =>
          (r.fromUserId === myId && r.toUserId === player.id) ||
          (r.toUserId === myId && r.fromUserId === player.id)
      ),
    [requests, myId, player.id]
  );

  let status: "none" | "sent" | "received" | "accepted" | "cancelled" = "none";

  if (req) {
    if (req.status === "accepted") status = "accepted";
    else if (req.status === "cancelled") status = "cancelled";
    else if (req.fromUserId === myId) status = "sent";
    else status = "received";
  }

  return (
    <View className="bg-white/5 rounded-2xl p-2 border border-white/10 flex-row items-center">
      {/* Avatar */}
      <View className="relative mr-4">
        {player.avatar ? (
          <Image
            source={{ uri: player.avatar }}
            className="w-12 h-12 rounded-xl"
          />
        ) : (
          <View className="w-12 h-12 bg-slate-700 rounded-xl items-center justify-center">
            <Text className="text-white font-bold text-base">
              {getInitials(player.name)}
            </Text>
          </View>
        )}
        <View className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border border-slate-900" />
      </View>

      {/* Info */}
      <View className="flex-1 mr-3">
        <Text className="text-white font-semibold text-base">
          {player.name}
        </Text>
        <Text className="text-slate-400 text-xs mt-0.5">{player.email}</Text>
      </View>

      {/* Button */}
      <ChallengeButton
        status={status}
        req={req}
        myId={myId}
        oppId={player.id}
        oppName={player.name}
        oppAvatar={player.avatar}
      />
    </View>
  );
};

// ---------- ChallengeButton ----------

interface ChallengeButtonProps {
  status: "none" | "sent" | "received" | "accepted" | "cancelled";
  req?: Request | null;
  myId: string;
  oppId: string;
  oppName: string;
  oppAvatar?: string | null;
}

export const ChallengeButton: React.FC<ChallengeButtonProps> = ({
  status,
  req = null,
  myId,
  oppId,
  oppName,
  oppAvatar,
}) => {
  const { profile } = useProfile();
  const [showGameModal, setShowGameModal] = useState(false);
  const [showCowardModal, setShowCowardModal] = useState(false);
  const [cancelledBy, setCancelledBy] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const deleteTimerRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Clear any pending deletion timer
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }
    };
  }, []);

  // Show modal when status becomes accepted
  useEffect(() => {
    if (status === "accepted" && req) {
      setShowGameModal(true);
    }
  }, [status, req]);

  // Show coward modal when status becomes cancelled and auto-close after 5 seconds
  useEffect(() => {
    if (status === "cancelled" && req && !isTransitioning) {
      setCancelledBy(req.cancelledBy || null);

      // Close game modal first, then show coward modal with a small delay
      if (showGameModal) {
        setIsTransitioning(true);
        setShowGameModal(false);

        // Small delay to allow game modal to close before showing coward modal
        setTimeout(() => {
          if (isMounted.current) {
            setShowCowardModal(true);
            setIsTransitioning(false);
          }
        }, 300);
      } else {
        setShowCowardModal(true);
      }

      // Schedule auto-delete and modal close after 5 seconds
      if (req.id) {
        // clear any existing timer
        if (deleteTimerRef.current) {
          clearTimeout(deleteTimerRef.current);
          deleteTimerRef.current = null;
        }

        deleteTimerRef.current = setTimeout(() => {
          handleAutoCloseAndDelete();
        }, 5000) as unknown as number;
      }
    }
  }, [status, req, showGameModal]);

  // Handle auto-close and delete
  const handleAutoCloseAndDelete = () => {
    if (!isMounted.current) return;

    // Close all modals
    setShowGameModal(false);
    setShowCowardModal(false);

    // Delete the request
    if (req?.id) {
      try {
        db.transact(db.tx.requests[req.id].delete());
      } catch (err) {
        // ignore: deletion might fail if already removed
      }
    }

    if (deleteTimerRef.current) {
      deleteTimerRef.current = null;
    }
  };

  // Create a new challenge request
  const onChallenge = async (opponentId: string) => {
    try {
      const newId = generateId();
      await db.transact(
        db.tx.requests[newId].create({
          fromUserId: myId,
          toUserId: opponentId,
          gametype: "xo",
          status: "pending",
          createdAt: Date.now(),
          fromInit: false,
          toInit: false,
        })
      );
    } catch (error) {
      Alert.alert("Error", "Failed to send challenge. Please try again.");
    }
  };

  // Cancel an outgoing or accepted request
  const onCancel = async (reqId: string) => {
    try {
      await db.transact(
        db.tx.requests[reqId].update({ status: "cancelled", cancelledBy: myId })
      );
      // Don't immediately show coward modal - let the useEffect handle the transition
      setCancelledBy(myId);

      // schedule auto-close and delete
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }

      deleteTimerRef.current = setTimeout(() => {
        handleAutoCloseAndDelete();
      }, 5000) as unknown as number;
    } catch (error) {
      Alert.alert("Error", "Failed to cancel challenge. Please try again.");
    }
  };

  // Accept an incoming request
  const onAccept = async (reqId: string) => {
    try {
      await db.transact(db.tx.requests[reqId].update({ status: "accepted" }));
      // game modal will open via effect when status updates
    } catch (error) {
      Alert.alert("Error", "Failed to accept challenge. Please try again.");
    }
  };

  // Reject an incoming request
  const onReject = async (reqId: string) => {
    try {
      await db.transact(db.tx.requests[reqId].update({ status: "rejected" }));
      Alert.alert(
        "Challenge Rejected",
        `You rejected ${oppName}'s challenge.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to reject challenge. Please try again.");
    }
  };

  // Start the game — mark initialization flag for the current user
  const onStartGame = async (reqId: string) => {
    if (!req) return;

    setIsInitializing(true);

    try {
      const updates: Partial<Request> = {};
      if (req.fromUserId === myId) updates.fromInit = true;
      else updates.toInit = true;

      await db.transact(db.tx.requests[reqId].update(updates));

      Alert.alert("Game Starting!", "Get ready to play XO!", [
        { text: "Let's Go!", onPress: () => setShowGameModal(false) },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to start game. Please try again.");
    } finally {
      if (isMounted.current) setIsInitializing(false);
    }
  };

  // Called when the coward modal cancel button is pressed (from inside GameStart modal)
  const onCowardCancel = async (reqId: string) => {
    try {
      await db.transact(
        db.tx.requests[reqId].update({ status: "cancelled", cancelledBy: myId })
      );
      // Let the useEffect handle the smooth transition between modals
      setCancelledBy(myId);

      // schedule auto-close and deletion
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }

      deleteTimerRef.current = setTimeout(() => {
        handleAutoCloseAndDelete();
      }, 5000) as unknown as number;
    } catch (error) {
      Alert.alert("Error", "Failed to cancel challenge. Please try again.");
    }
  };

  // Close modals and perform any cleanup
  const onCloseModal = () => setShowGameModal(false);

  const onCloseCowardModal = () => {
    handleAutoCloseAndDelete();
  };

  // Helpers to determine initialization state
  const isBothInitialized = !!(req?.fromInit && req?.toInit);
  const hasCurrentUserInitialized = req
    ? req.fromUserId === myId
      ? !!req.fromInit
      : !!req.toInit
    : false;
  const hasOpponentInitialized = req
    ? req.fromUserId === myId
      ? !!req.toInit
      : !!req.fromInit
    : false;

  // Determine coward modal message
  const getCowardModalMessage = () => {
    if (cancelledBy === myId) {
      return {
        title: "Challenge Withdrawn",
        message: `You withdrew the challenge against ${oppName}.`,
        subMessage: "Better to retreat than face certain defeat!",
        emoji: "🏃‍♂️💨",
      };
    } else {
      return {
        title: "Opponent Ran Away!",
        message: `${oppName} feared your skills and ran away!`,
        subMessage:
          "Don't worry, there are plenty of brave challengers waiting!",
        emoji: "😨🏃‍♂️",
      };
    }
  };

  const cowardModalData = getCowardModalMessage();

  // -------------------- Modal Components --------------------

  const GameStartModal = () => (
    <Modal
      visible={showGameModal && !isTransitioning}
      transparent={true}
      animationType="fade"
      onRequestClose={onCloseModal}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View className="bg-slate-800 rounded-3xl p-6 w-11/12 max-w-sm border border-slate-600">
          {/* Header */}
          <View className="items-center mb-6">
            <Text className="text-white text-2xl font-bold mb-2">
              Game Ready!
            </Text>
            <Text className="text-slate-300 text-center text-base">
              Challenge accepted! Get ready to play Tic Tac Toe
            </Text>
          </View>

          {/* Players Section */}
          <View className="flex-row justify-between items-center mb-6">
            {/* Current User */}
            <View className="items-center flex-1">
              {profile?.avatar ? (
                <Image
                  source={{ uri: profile.avatar }}
                  className="w-16 h-16 rounded-2xl mb-3"
                />
              ) : (
                <View className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-3 items-center justify-center">
                  <Text className="text-white font-bold text-xl">
                    {getInitials(profile?.name ?? "Y")}
                  </Text>
                </View>
              )}
              <Text className="text-white font-semibold text-center text-sm">
                {profile?.name}
              </Text>
              <View
                className={`mt-2 w-3 h-3 rounded-full ${hasCurrentUserInitialized ? "bg-emerald-400" : "bg-amber-400"}`}
              />
              <Text className="text-slate-400 text-xs mt-1">
                {hasCurrentUserInitialized ? "Ready" : "Waiting"}
              </Text>
            </View>

            {/* VS Badge */}
            <View className="mx-4">
              <View className="bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2 rounded-full">
                <Text className="text-white font-bold text-sm">VS</Text>
              </View>
            </View>

            {/* Opponent */}
            <View className="items-center flex-1">
              {oppAvatar ? (
                <Image
                  source={{ uri: oppAvatar }}
                  className="w-16 h-16 rounded-2xl mb-3"
                />
              ) : (
                <View className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-3 items-center justify-center">
                  <Text className="text-white font-bold text-xl">
                    {getInitials(oppName)}
                  </Text>
                </View>
              )}
              <Text className="text-white font-semibold text-center text-sm">
                {oppName}
              </Text>
              <View
                className={`mt-2 w-3 h-3 rounded-full ${hasOpponentInitialized ? "bg-emerald-400" : "bg-amber-400"}`}
              />
              <Text className="text-slate-400 text-xs mt-1">
                {hasOpponentInitialized ? "Ready" : "Waiting"}
              </Text>
            </View>
          </View>

          {/* Game Info */}
          <View className="bg-slate-700/50 rounded-xl p-4 mb-6 border border-slate-600/50">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-slate-300 text-sm">Game</Text>
              <Text className="text-white font-semibold text-sm">
                Tic Tac Toe (XO)
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-slate-300 text-sm">Initiated by</Text>
              <Text className="text-emerald-400 font-semibold text-sm">
                {req && req.fromUserId === myId ? "You" : oppName}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-300 text-sm">Status</Text>
              <View className="flex-row items-center">
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${isBothInitialized ? "bg-emerald-400" : "bg-amber-400"}`}
                />
                <Text
                  className={`font-semibold text-sm ${isBothInitialized ? "text-emerald-400" : "text-amber-400"}`}
                >
                  {isBothInitialized ? "Both Ready" : "Waiting..."}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            {!hasCurrentUserInitialized ? (
              <TouchableOpacity
                onPress={() => req && onStartGame(req.id)}
                disabled={isInitializing}
                className={`bg-gradient-to-r from-indigo-500 to-purple-600 py-4 rounded-2xl items-center ${
                  isInitializing ? "opacity-50" : ""
                }`}
              >
                {isInitializing ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    Start Game
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View className="bg-slate-700 py-4 rounded-2xl items-center">
                <Text className="text-slate-300 text-lg font-bold">
                  Waiting for {oppName}...
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => req && onCowardCancel(req.id)}
              className="border border-rose-500/50 py-3 rounded-2xl items-center"
            >
              <Text className="text-rose-400 text-sm font-medium">
                Cancel Challenge
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const CowardModal = () => (
    <Modal
      visible={showCowardModal && !isTransitioning}
      transparent={true}
      animationType="fade"
      onRequestClose={onCloseCowardModal}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View className="bg-slate-800 rounded-3xl p-8 w-11/12 max-w-sm border border-slate-600">
          {/* Emoji Icon */}
          <View className="items-center mb-6">
            <Text className="text-6xl mb-4">{cowardModalData.emoji}</Text>
            <Text className="text-white text-2xl font-bold text-center mb-2">
              {cowardModalData.title}
            </Text>
          </View>

          {/* Message */}
          <View className="items-center mb-8">
            <Text className="text-slate-300 text-lg text-center leading-7">
              {cowardModalData.message}
            </Text>
            <Text className="text-slate-400 text-sm text-center mt-3">
              {cowardModalData.subMessage}
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onCloseCowardModal}
            className="bg-gradient-to-r from-amber-500 to-orange-600 py-4 rounded-2xl items-center"
          >
            <Text className="text-white text-lg font-bold">
              Find Another Opponent
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render different button variants based on status
  if (status === "sent" && req) {
    return (
      <View className="flex-row items-center space-x-2">
        <TouchableOpacity
          onPress={() => onCancel(req.id)}
          className="bg-amber-600 px-5 py-2.5 rounded-xl"
        >
          <Text className="text-white text-sm font-semibold">Cancel</Text>
        </TouchableOpacity>
        <GameStartModal />
        <CowardModal />
      </View>
    );
  }

  if (status === "received" && req) {
    return (
      <View className="flex-row items-center space-x-2">
        <TouchableOpacity
          onPress={() => onAccept(req.id)}
          className="bg-emerald-600 px-4 py-2 rounded-xl"
        >
          <Text className="text-white text-sm font-semibold">
            <Ionicons name="checkmark-sharp" size={16} color="black" />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onReject(req.id)}
          className="bg-rose-600 px-4 py-2 rounded-xl"
        >
          <Text className="text-white text-sm font-semibold">
            <Ionicons name="close" size={16} color="black" />
          </Text>
        </TouchableOpacity>
        <GameStartModal />
        <CowardModal />
      </View>
    );
  }

  if (status === "accepted" && req) {
    return (
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => setShowGameModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2.5 rounded-xl"
        >
          <Text className="text-white text-sm font-semibold">Start Game</Text>
        </TouchableOpacity>
        <GameStartModal />
        <CowardModal />
      </View>
    );
  }

  if (status === "cancelled" && req) {
    return (
      <View className="flex-row items-center">
        <View className="bg-slate-600 px-5 py-2.5 rounded-xl">
          <Text className="text-slate-300 text-sm font-semibold">
            Cancelled
          </Text>
        </View>
        <CowardModal />
      </View>
    );
  }

  // default: no status -> show challenge button
  return (
    <View className="flex-row items-center">
      <TouchableOpacity
        onPress={() => onChallenge(oppId)}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 rounded-xl"
      >
        <Text className="text-white text-sm font-semibold">Challenge</Text>
      </TouchableOpacity>
      <GameStartModal />
      <CowardModal />
    </View>
  );
};

export default AvailablePlayers;
