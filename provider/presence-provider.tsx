import { db } from "@/lib/db";
import { useProfile } from "@/query/user";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";

const GLOBAL_PRESENCE_ROOM_ID = "global-presence-room";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface PresenceContextType {
  onlineUsers: User[];
}

const PresenceContext = createContext<PresenceContextType | undefined>(
  undefined
);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const room = db.room("game", GLOBAL_PRESENCE_ROOM_ID);
  const { profile, user, isLoading } = useProfile();

  const {
    user: myPresence,
    peers,
    publishPresence,
  } = db.rooms.usePresence(room, {
    user: true,
    initialData: undefined, // publish when ready
  });

  /**
   * Publish presence when user profile is available
   */
  useEffect(() => {
    if (isLoading || !user?.id || !profile?.name || !profile?.email) {
      return;
    }

    publishPresence({
      id: user.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar ?? "",
    });
  }, [isLoading, user?.id, profile, publishPresence]);

  /**
   * Build array of all online users (excluding myself)
   */
  const onlineUsers = useMemo<User[]>(() => {
    if (!peers) return [];
    return Object.values(peers)
      .filter((peer) => !!peer?.id && peer.id !== myPresence?.id)
      .map((peer) => ({
        id: peer.id,
        name: peer.name ?? "",
        email: peer.email ?? "",
        avatar: peer.avatar ?? "",
      }));
  }, [peers, myPresence?.id]);

  const value = useMemo(() => ({ onlineUsers }), [onlineUsers]);

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
};

/**
 * Hook for consuming presence context.
 */
export const useCustomPresence = (): PresenceContextType => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error("useCustomPresence must be used within a PresenceProvider");
  }
  return context;
};
