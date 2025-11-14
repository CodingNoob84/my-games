import AvailablePlayers from "@/components/common/available-players";
import { HeadingSection } from "@/components/common/heading-section";
import { PlayWithBot } from "@/components/xogame/play_with_bot";
import { db } from "@/lib/db";
import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function XOIndex() {
  const me = db.useUser();

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <HeadingSection heading="Tic Tac Toe" />

        {/* Play vs Bot Section */}
        <PlayWithBot myId={me.id} />

        {/* Online Players Section */}
        <AvailablePlayers myId={me.id} gameType="xo" />
      </ScrollView>
    </SafeAreaView>
  );
}
