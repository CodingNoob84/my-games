import { db } from "@/lib/db";
import { id } from "@instantdb/core";

export const createXOGame = async (playerIds: string[]) => {
  if (!playerIds || playerIds.length !== 2) {
    throw new Error("You must provide exactly two player IDs");
  }

  const [playerXUserId, playerOUserId] = playerIds;

  const gameData = {
    board: "---------", // 3x3 empty board
    currentTurn: playerXUserId, // Player X starts by default
    playerXUserId,
    playerOUserId,
    status: "playing", // could be: waiting | playing | finished
    type: "global",
    updatedAt: Date.now(),
    wonBy: null,
  };

  try {
    const uniqueId = id();
    const result = await db.transact(db.tx.xogame[uniqueId].create(gameData));
    console.log("✅ Game created:", uniqueId);
    return uniqueId;
  } catch (err) {
    console.error("❌ Error creating XO game:", err);
    throw err;
  }
};

// Define a union type for players
type Player = {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  isBot?: boolean; // new flag
};

export function useGameWithPlayers(id: string) {
  const { data: gameData } = db.useQuery({
    xogame: { $: { where: { id } } },
  });

  const game = gameData?.xogame?.[0];
  if (!game) return { game: null, players: [] as Player[] };

  const playerIds = [game.playerXUserId, game.playerOUserId].filter(Boolean);

  // Fetch users
  const { data: usersData } = db.useQuery(
    playerIds.length
      ? {
          $users: {
            $: { where: { id: { $in: playerIds } } },
            profile: {},
          },
        }
      : null
  );

  const users: Player[] =
    usersData?.$users?.map((u) => ({
      ...u,
      name: u.profile?.name ?? "",
      isBot: false, // mark as user
    })) ?? [];

  // Determine missing IDs → bots
  const fetchedUserIds = users.map((u) => u.id);
  const botIds = playerIds.filter((id) => !fetchedUserIds.includes(id));

  const { data: botsData } = db.useQuery(
    botIds.length
      ? {
          bots: {
            $: { where: { id: { $in: botIds } } },
          },
        }
      : null
  );

  const bots: Player[] =
    botsData?.bots?.map((b) => ({
      ...b,
      isBot: true, // mark as bot
    })) ?? [];

  // Combine players in original order
  const players: Player[] = playerIds
    .map(
      (id) => users.find((u) => u.id === id) || bots.find((b) => b.id === id)
    )
    .filter(Boolean) as Player[];

  return { game, players };
}
