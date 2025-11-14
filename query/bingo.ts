import { db } from "@/lib/db";
import { id } from "@instantdb/react-native";
import { getRandomBots } from "./user";

const LIMIT = 75;

export const createBoxBingoGame = async (myId: string) => {
  // 1️⃣ Fetch random bots
  const bots = await getRandomBots(3);
  if (!bots || bots.length === 0) {
    console.error("No bots available");
    return { success: false, result: "", error: "No bots available" };
  }

  // 2️⃣ Prepare player order (user + bots)
  const players = [myId, ...bots.map((bot) => bot.id)];
  const orderOfTurns = [...players]; // store play order

  // 3️⃣ Unique game ID
  const bingoId = id();

  // 4️⃣ Base game object
  const gameData = {
    markedNumbers: [] as number[],
    limit: LIMIT,
    orderOfTurns, // changed from currentTurn
    status: "created",
    type: "bot",
    wonBy: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // 5️⃣ Helper: create a random bingo board
  const createBoard = () => {
    const numbers = Array.from({ length: LIMIT }, (_, i) => i + 1);
    return numbers.sort(() => Math.random() - 0.5).slice(0, 25);
  };

  // 6️⃣ Prepare bingoPlayers records
  const bingoPlayers = players.map((userId) => ({
    userId,
    bingoId,
    board: createBoard(),
    winningArray: [],
  }));

  // 7️⃣ Create game + player entries in one transaction
  const tx = db.tx;
  const transaction = [
    tx.bingo[bingoId].create(gameData),
    ...bingoPlayers.map((player) => tx.bingoplayers[id()].create(player)),
  ];

  await db.transact(transaction);

  console.log("✅ Bingo game created:", bingoId);
  return { success: true, result: bingoId, error: null };
};

export const getPlayersInfo = async (playerIds: string[]) => {
  try {
    const [profilesData, botsData] = await Promise.all([
      db.queryOnce({
        profiles: {
          $: { where: { id: { $in: playerIds } } },
        },
      }),
      db.queryOnce({
        bots: {
          $: { where: { id: { $in: playerIds } } },
        },
      }),
    ]);

    console.log("Fetched profiles data:", profilesData);
    console.log("Fetched bots data:", botsData);
    // ✅ Correct access (Instant returns results at top level)
    const profiles =
      profilesData?.data.profiles?.map((p) => ({
        ...p,
        type: "user" as const,
      })) ?? [];

    const bots =
      botsData?.data.bots?.map((b) => ({
        ...b,
        type: "bot" as const,
      })) ?? [];

    // ✅ Combine both and preserve order if needed
    const allPlayers = [...profiles, ...bots];

    return allPlayers;
  } catch (error) {
    console.error("Error fetching player info:", error);
    return [];
  }
};

export const addBingoNumber = async (
  bingoId: string,
  newMarkedNumbers: number[],
  newOrderOfTurns: string[],
  bpId: string,
  playerId: string,
  winningLines: number[][]
) => {
  if (!bpId) {
    console.error("bpId missing in addBingoNumber");
    return;
  }

  if (winningLines.length < 5) {
    await db.transact([
      db.tx.bingo[bingoId].update({
        markedNumbers: newMarkedNumbers,
        orderOfTurns: newOrderOfTurns,
        updatedAt: Date.now(),
      }),
      db.tx.bingoplayers[bpId].update({
        winningArray: winningLines,
      }),
    ]);
  } else {
    await db.transact([
      db.tx.bingo[bingoId].update({
        markedNumbers: newMarkedNumbers,
        orderOfTurns: newOrderOfTurns,
        updatedAt: Date.now(),
        status: "completed",
        wonBy: playerId,
      }),
      db.tx.bingoplayers[bpId].update({
        winningArray: winningLines,
      }),
    ]);
  }
};
