import AvailablePlayers from "@/components/common/available-players";
import { HeadingSection } from "@/components/common/heading-section";
import { PlayWithBot } from "@/components/xogame/play_with_bot";
import { db } from "@/lib/db";
import { getRandomBot } from "@/query/user";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Player = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
};

const ROOM = db.room("xogame", "global-xo");

export default function XOIndex() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const me = db.useUser();
  const bot = getRandomBot();

  // Track your presence and peers
  const {
    user: myPresence,
    peers,
    publishPresence,
  } = db.rooms.usePresence(ROOM, {
    initialData: { id: me.id },
  });

  // Update presence whenever name changes
  useEffect(() => {
    if (me.id) {
      publishPresence({ id: me.id });
    }
  }, [me.id, publishPresence]);

  // Compute all online user IDs (me + peers)
  const userIds = useMemo(() => {
    if (!peers) return myPresence ? [myPresence.id] : [];
    const others = Object.values(peers)
      .map((p: any) => p.id)
      .filter(Boolean);
    return others;
  }, [peers, myPresence?.id]);

  console.log("Online XO user IDs:", userIds);

  const { data } = db.useQuery({
    profiles: {
      $: {
        where: {
          id: {
            $in: userIds,
          },
        },
      },
    },
  });
  const users = data?.profiles ?? [];

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <HeadingSection heading="Tic Tac Toe" />

        {/* Play vs Bot Section */}
        <PlayWithBot myId={me.id} />

        {/* Online Players Section */}
        <AvailablePlayers myId={me.id} players={users as unknown as Player[]} />
      </ScrollView>
    </SafeAreaView>
  );
}
