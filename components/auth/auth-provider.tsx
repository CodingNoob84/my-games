import { db } from "@/lib/db";
import { initProfile } from "@/query/user";
import React, { useEffect, useRef } from "react";
import { LoadingScreen } from "../common/loading-screen";
import LoginScreen from "./login-screen";

// Initializes a profile for new signed-in users if missing
const ProfileBootstrap = () => {
  const user = db.useUser();
  const { data, isLoading } = db.useQuery({
    profiles: { $: { where: { "user.id": user?.id } } },
  });

  const profile = data?.profiles?.[0];
  const initializedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!user?.id || isLoading || profile) return;
      if (initializedForUserRef.current === user.id) return;
      initializedForUserRef.current = user.id;
      await initProfile(user.id, user.email ?? ""); // ✅ await here
    };
    init();
  }, [user?.id, user?.email, isLoading, profile]);

  return null;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, error, user } = db.useAuth();
  console.log("AuthProvider - user:", user);
  if (isLoading) {
    return <LoadingScreen />;
  }

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
