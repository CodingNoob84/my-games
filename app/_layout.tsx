import { AuthProvider } from "@/components/auth/auth-provider";
import { ErrorBoundary } from "@/components/common/error-boundry";
import { LoadingScreen } from "@/components/common/loading-screen";
import { db } from "@/lib/db";
import { PresenceProvider } from "@/provider/presence-provider";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

export default function RootLayout() {
  console.log("Layout rendered");

  if (!db) {
    console.warn("⚠️ Database client not initialized yet.");
    return <LoadingScreen />;
  }

  const { isLoading, user } = db.useAuth?.() ?? { isLoading: true, user: null };

  // Show a loading screen until auth state is resolved
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PresenceProvider>
          <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaProvider>
        </PresenceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
