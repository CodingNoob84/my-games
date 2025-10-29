import { db } from "@/lib/db";
import { initProfile } from "@/query/user";
import React, { useEffect, useRef } from "react";
import { LoadingScreen } from "../common/loading-screen";
import LoginScreen from "./login-screen";

const ProfileBootstrap = () => {
  if (!db) {
    console.warn("⚠️ Database client (db) not initialized yet");
    return null;
  }

  const user = db.useUser?.();
  const { data, isLoading } = db.useQuery?.({
    profiles: { $: { where: { "user.id": user?.id } } },
  }) ?? { data: null, isLoading: true };

  const profile = data?.profiles?.[0];
  const initializedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!user?.id || isLoading || profile) return;
      if (initializedForUserRef.current === user.id) return;
      initializedForUserRef.current = user.id;
      await initProfile(user.id, user.email ?? "");
    };
    init();
  }, [user?.id, user?.email, isLoading, profile]);

  return null;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  if (!db) {
    console.warn("⚠️ Database client (db) not initialized yet");
    return <LoadingScreen />;
  }

  const { isLoading, error, user } = db.useAuth?.() ?? {
    isLoading: true,
    error: null,
    user: null,
  };

  console.log(
    "AuthProvider - user:",
    user,
    "isLoading:",
    isLoading,
    "error:",
    error
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <db.SignedIn>
        <ProfileBootstrap />
        {children}
      </db.SignedIn>
      <db.SignedOut>
        <LoginScreen />
      </db.SignedOut>
    </>
  );
};
