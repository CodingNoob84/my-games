import { Protected } from "@/components/auth/auth-provider";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Protected>
      <ThemeProvider value={DarkTheme}>
        <Tabs
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: "#0a0a2e" },
            headerTintColor: "#fff",
            tabBarStyle: {
              backgroundColor: "#0a0a2e",
              borderTopColor: "#1e1e4d",
              borderTopWidth: 1,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: "#6366f1",
            tabBarInactiveTintColor: "#94a3b8",
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "500",
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: "Explore",
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "compass" : "compass-outline"}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size, focused }) => (
                <FontAwesome5
                  name={focused ? "user-alt" : "user"}
                  size={size - 2}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
      </ThemeProvider>
    </Protected>
  );
}
