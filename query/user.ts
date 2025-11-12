import { db } from "@/lib/db";
import { getNameFromEmail } from "@/lib/utils";

export const initProfile = async (userId: string, email: string) => {
  console.log("email", email, userId);
  const name = getNameFromEmail(email);
  const avatarUrl = `https://api.dicebear.com/9.x/thumbs/png?seed=${encodeURIComponent(email)}`;
  const existing = await db.queryOnce({
    profiles: {
      $: {
        where: { id: userId },
      },
    },
  });
  console.log("existing profile", existing);
  if (existing) {
    await db.transact([
      db.tx.profiles[userId]
        .update({
          name,
          email,
          avatar: avatarUrl,
        })
        .link({ user: userId }),
    ]);
  }
};

export const useProfile = () => {
  const user = db.useUser();
  const { data, isLoading, error } = db.useQuery({
    profiles: {
      $: { where: { "user.id": user.id } },
    },
  });
  //console.log("daat", data);
  const profile = data?.profiles?.[0];

  return { profile, user, isLoading, error };
};

export type Bot = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level?: number;
};

export const getRandomBot = async (level?: number): Promise<Bot | null> => {
  const query =
    level !== undefined
      ? { bots: { $: { where: { level } } } }
      : { bots: { $: {} } };

  const { data } = await db.queryOnce(query);
  const bots = data?.bots ?? [];

  if (bots.length === 0) return null;

  // Pick one random bot
  const randomIndex = Math.floor(Math.random() * bots.length);
  return bots[randomIndex] as Bot;
};

export const getRandomBots = (count: number, level?: number): Bot[] | null => {
  const query =
    level !== undefined
      ? { bots: { $: { where: { level } } } }
      : { bots: { $: {} } };

  const { data } = db.useQuery(query);
  const bots = data?.bots ?? [];

  if (bots.length === 0) return null;

  // Shuffle array and take the requested number
  const shuffled = [...bots].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, bots.length)) as Bot[];
};
