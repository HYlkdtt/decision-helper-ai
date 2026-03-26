import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken, getToken } from "../services/api";

export default function Layout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
      if (token) setToken(token);
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  const isLoggedIn = !!getToken();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          borderTopColor: "#e2e8f0",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text>,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: isLoggedIn ? "Profile" : "Sign In",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
