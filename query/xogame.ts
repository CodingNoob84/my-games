import { db } from "@/lib/db";
import { id } from "@instantdb/core";
import { getRandomBot } from "./user";

export const createBotXOGame = async (myId: string, level: number) => {
  const bot = await getRandomBot(level);
  if (!bot) {
    console.error("❌ No bot found!");
    return { success: false, result: null, error: "No bot available" };
  }

  // Randomize who starts as X or O
  const playerIds = [myId, bot.id];
  return await createXOGame(playerIds, "bot", level);
};

export const createXOGame = async (
  playerIds: string[],
  type: string,
  level: number = 0
) => {
  if (!playerIds || playerIds.length !== 2) {
    return {
      success: false,
      result: "",
      error: "You must provide exactly two player IDs",
    };
    //throw new Error("You must provide exactly two player IDs");
  }
  const shuffled = playerIds.sort(() => Math.random() - 0.5);
  const [playerXUserId, playerOUserId] = shuffled;

  const gameData = {
    key: id(),
    board: [null, null, null, null, null, null, null, null, null], // 3x3 empty board
    track: [],
    moveCount: 0,
    currentTurn: playerXUserId, // Player X starts by default
    playerXUserId,
    playerOUserId,
    status: "playing", // could be: waiting | playing | finished
    type: type,
    updatedAt: Date.now(),
    wonBy: null,
    level,
  };

  try {
    const uniqueId = id();
    const result = await db.transact(db.tx.xogame[uniqueId].create(gameData));
    console.log("✅ Game created:", uniqueId);
    return { success: true, result: uniqueId, error: null };
  } catch (err) {
    console.error("❌ Error creating XO game:", err);
    throw err;
  }
};

// Define a union type for players
export type Player = {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  isBot?: boolean; // new flag
};

export type XOGame = {
  id: string;
  key: string;
  board: string[];
  level?: number;
  status?: string;
  wonBy?: string;
  moveCount: number;
  currentTurn: string;
  playerXUserId: string;
  playerOUserId: string;
  track?: number[];
  type?: "bot" | "user" | string;
  createdAt?: number;
  updatedAt?: number;
};

export function useGameWithPlayers(id: string): {
  game: XOGame | null;
  players: Player[];
  playerX: Player | null;
  playerO: Player | null;
  isLoading: boolean;
} {
  // 🧩 Always call hooks unconditionally - use empty arrays when no IDs
  const { data: gameData, isLoading: gameLoading } = db.useQuery(
    id
      ? {
          xogame: { $: { where: { id } } },
        }
      : {
          xogame: { $: { where: { id: "" } } }, // Empty query when no ID
        }
  );

  const game = gameData?.xogame?.[0];

  // Determine player IDs - use empty array if no game
  const playerIds = game
    ? [game.playerXUserId, game.playerOUserId].filter(Boolean)
    : [];

  // 🧩 Fetch users (human players) - always call the hook
  const { data: usersData, isLoading: usersLoading } = db.useQuery(
    playerIds.length > 0
      ? {
          $users: {
            $: { where: { id: { $in: playerIds } } },
            profile: {},
          },
        }
      : {
          $users: { $: { where: { id: { $in: [] } } } }, // Empty query
        }
  );

  const users: Player[] =
    usersData?.$users?.map((u) => ({
      ...u,
      name: u.profile?.name ?? "Unknown Player",
      avatar: u.profile?.avatar ?? "https://placehold.co/100x100?text=User",
      isBot: false,
    })) ?? [];

  // 🧩 Detect bots (missing users) - always call the hook
  const fetchedUserIds = users.map((u) => u.id);
  const botIds = playerIds.filter((id) => !fetchedUserIds.includes(id));

  const { data: botsData, isLoading: botsLoading } = db.useQuery(
    botIds.length > 0
      ? {
          bots: {
            $: { where: { id: { $in: botIds } } },
          },
        }
      : {
          bots: { $: { where: { id: { $in: [] } } } }, // Empty query
        }
  );

  const bots: Player[] =
    botsData?.bots?.map((b) => ({
      ...b,
      isBot: true,
      name: b.name ?? "Bot",
      avatar: b.avatar ?? "https://placehold.co/100x100?text=Bot",
    })) ?? [];

  // 🧩 Combine all players in correct order
  const players: Player[] = playerIds
    .map(
      (id) => users.find((u) => u.id === id) || bots.find((b) => b.id === id)
    )
    .filter(Boolean) as Player[];

  // 🧩 Identify X and O players
  const playerX = players.find((p) => p.id === game?.playerXUserId) ?? null;
  const playerO = players.find((p) => p.id === game?.playerOUserId) ?? null;

  // 🧩 Return combined data
  return {
    game: game || null,
    players,
    playerX,
    playerO,
    isLoading: gameLoading || usersLoading || botsLoading,
  };
}

export const completeXOGame = async (
  gameId: string,
  status: string,
  wonBy: string | null
) => {
  try {
    await db.transact(
      db.tx.xogame[gameId].update({
        status: "finished",
        wonBy,
      })
    );
  } catch (err) {
    console.error("❌ Error completing XO game:", err);
    throw err;
  }
};
