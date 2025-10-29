import { AuthProvider } from "@/components/auth/auth-provider";
import { ErrorBoundary } from "@/components/common/error-boundry";
import { Stack } from "expo-router";
import "./global.css";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
