import { db } from "@/lib/db";
import { initProfile } from "@/query/user";
import React, { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import LoginScreen from "./login-screen";

// Initialize profile for a signed-in user if missing, once per session
const ProfileBootstrap = () => {
  const user = db.useUser();
  const { data, isLoading } = db.useQuery({
    profiles: { $: { where: { "user.id": user.id } } },
  });
  const profile = data?.profiles?.[0];

  const initializedForUserRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    if (isLoading) return;
    if (profile) return;
    if (initializedForUserRef.current === user.id) return;
    initializedForUserRef.current = user.id as string;
    initProfile(user.id as string, user.email as string).catch(() => {});
  }, [user?.id, user?.email, isLoading, profile]);

  return null;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <db.SignedIn>
        <ProfileBootstrap />
        {children}
      </db.SignedIn>
    </>
  );
};

export const Protected = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, error } = db.useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        {/* Animated Game Icons */}
        <View className="flex-row mb-6">
          <View
            className="w-4 h-4 bg-purple-500 rounded-full mx-1 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <View
            className="w-4 h-4 bg-blue-500 rounded-full mx-1 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <View
            className="w-4 h-4 bg-green-500 rounded-full mx-1 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </View>

        {/* Loading Text */}
        <Text className="text-white text-lg font-semibold mb-2">
          Loading Game
        </Text>
        <Text className="text-gray-400 text-sm">
          Preparing your experience...
        </Text>

        {/* Progress Bar */}
        <View className="w-48 h-1 bg-gray-700 rounded-full mt-6">
          <View className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-3/4" />
        </View>
      </View>
    );
  }

  if (error) {
    const message = (
      error && typeof error === "object" && "message" in (error as any)
        ? (error as any).message
        : String(error)
    ) as string;
    return (
      <View className="flex-1 justify-center items-center bg-[#f7f7fa]">
        <Text>Error: {message}</Text>
      </View>
    );
  }

  return (
    <>
      <db.SignedIn>{children}</db.SignedIn>
      <db.SignedOut>
        <LoginScreen />
      </db.SignedOut>
    </>
  );
};
