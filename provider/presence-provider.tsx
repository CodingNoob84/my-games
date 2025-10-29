"use client";

import { db } from "@/lib/db";
import { useProfile } from "@/query/user";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";

interface OnlineUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface PresenceContextType {
  onlineUsers: OnlineUser[];
}

const PresenceContext = createContext<PresenceContextType | undefined>(
  undefined
);

interface PresenceProviderProps {
  children: ReactNode;
}

/**
 * Tracks global presence (who’s online) with profile info.
 */
export const PresenceProvider = ({ children }: PresenceProviderProps) => {
  const roomId = "game-global-presence";
  const room = db.room("game", roomId);
  const { profile, user, isLoading } = useProfile();

  const {
    user: myPresence,
    peers,
    publishPresence,
  } = db.rooms.usePresence(room, {
    user: true,
    initialData: undefined, // published later when ready
  });

  /**
   * Publish presence when user profile is available
   */
  useEffect(() => {
    if (isLoading) return;
    if (!user?.id || !profile?.name || !profile?.email) return;

    publishPresence({
      id: user.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
    });
  }, [
    isLoading,
    user?.id,
    profile?.name,
    profile?.email,
    profile?.avatar,
    publishPresence,
  ]);

  /**
   * Build array of all online users (myself + peers)
   */
  const onlineUsers = useMemo<OnlineUser[]>(() => {
    const list: OnlineUser[] = [];

    if (peers) {
      for (const peer of Object.values(peers)) {
        if (peer?.id && peer.id !== myPresence?.id) {
          list.push({
            id: peer.id,
            name: peer.name ?? "",
            email: peer.email ?? "",
            avatar: peer.avatar,
          });
        }
      }
    }

    return list;
  }, [myPresence, peers]);

  const value = useMemo(
    () => ({
      onlineUsers,
    }),
    [onlineUsers]
  );

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
};

/**
 * Hook for consuming presence context.
 */
export const useCustomPresence = () => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error("usePresence must be used within a PresenceProvider");
  }
  return context;
};
