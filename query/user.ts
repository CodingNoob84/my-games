import { db } from "@/lib/db";
import { getNameFromEmail } from "@/lib/utils";

export const initProfile = async (userId: string, email: string) => {
  console.log("email", email, userId);
  const name = getNameFromEmail(email);
  const avatarUrl = `https://api.dicebear.com/9.x/thumbs/png?seed=${encodeURIComponent(email)}`;
  const existing = db.useQuery({
    profiles: {
      $: {
        where: { id: userId },
      },
    },
  });
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

export const getRandomBot = () => {
  const { data } = db.useQuery({
    bots: {
      $: {},
    },
  });

  const bots = data?.bots ?? [];
  if (bots.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * bots.length);
  return bots[randomIndex];
};
