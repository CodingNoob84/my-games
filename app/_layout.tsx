import { AuthProvider, Protected } from "@/components/auth/auth-provider";
import { Stack } from "expo-router";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Protected>
        <Stack screenOptions={{ headerShown: false }} />
      </Protected>
    </AuthProvider>
  );
}
