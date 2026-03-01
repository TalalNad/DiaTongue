// src/components/BottomTabBar.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import colors from "../constants/colors";

const tabs = [
  { key: "home", label: "Home", icon: "🏠", route: "/home" },
  { key: "scan", label: "Scan", icon: "📷", route: "/scan" },
  { key: "chat", label: "Chat", icon: "💬", route: "/chat" },
  { key: "history", label: "History", icon: "⏱", route: "/history" },
  { key: "profile", label: "Profile", icon: "👤", route: "/profile" },
];

export default function BottomTabBar({ activeTab }) {
  const router = useRouter();

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => {
              // stay on current tab if already active
              if (!tab.route || isActive) return;
              router.push(tab.route);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text
              style={[styles.tabLabel, isActive && styles.tabLabelActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    fontSize: 18,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  tabIconActive: {
    color: colors.primary || "#0F75FF",
  },
  tabLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  tabLabelActive: {
    color: colors.primary || "#0F75FF",
    fontWeight: "600",
  },
});