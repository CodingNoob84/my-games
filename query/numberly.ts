import { db } from "@/lib/db";
import { id } from "@instantdb/react-native";

export const createBotNumberly = async (userId: string, type: string) => {
  // Generate a random number between 1 and 99999
  const givenNumber = Math.floor(Math.random() * 99999) + 1;
  const uniqueId = id();
  await db.transact([
    db.tx.numberly[uniqueId].create({
      userId,
      givenNumber,
      board: Array(5).fill(null),
      guessCount: 0,
      status: "playing",
      type: "bot",
      updatedAt: Date.now(),
    }),
  ]);
  return { success: true, result: uniqueId, error: null };
};
