import { AuthProvider } from "@/components/auth/auth-provider";
import { Stack } from "expo-router";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
