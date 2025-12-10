// app/home.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import colors from "../src/constants/colors";

const overviewItems = [
  {
    key: "history",
    title: "Scan History",
    subtitle: "View your past results",
    icon: "📈",
    bg: "#E9F1FF",
  },
  {
    key: "education",
    title: "Understanding T2DM",
    subtitle: "Learn about diabetes",
    icon: "📘",
    bg: "#E9F8EF",
  },
  {
    key: "photos",
    title: "How to Take Good Photos",
    subtitle: "Tips for best results",
    icon: "📸",
    bg: "#FFF4E6",
  },
];

const tabs = [
  { key: "home", label: "Home", icon: "🏠", route: "/home" },
  { key: "scan", label: "Scan", icon: "📷", route: "/scan" },
  { key: "history", label: "History", icon: "⏱", route: "/history" },
  { key: "profile", label: "Profile", icon: "👤", route: "/profile" },
];

function BottomTabBar({ activeTab }) {
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
              if (!tab.route || (isActive && tab.key === "home")) return;
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

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Blue header background */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Good afternoon, Demo</Text>
            <Text style={styles.question}>How are you feeling today?</Text>
          </View>

          {/* Last scan card */}
          <View style={styles.resultCardWrapper}>
            <View style={styles.resultCard}>
              <View style={styles.resultCardLeft}>
                <Text style={styles.resultLabel}>Last Scan Result</Text>
                <Text style={styles.resultValue}>Low Risk</Text>
                <Text style={styles.resultDate}>March 15, 2024</Text>
              </View>

              <View style={styles.resultCardRight}>
                <Text style={styles.confidenceLabel}>Confidence</Text>
                <Text style={styles.confidenceValue}>92%</Text>
              </View>
            </View>
          </View>

          {/* New Scan button */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push("/scan")}
          >
            <Text style={styles.primaryButtonIcon}>📷</Text>
            <Text style={styles.primaryButtonText}>New Scan</Text>
          </TouchableOpacity>

          {/* Health overview */}
          <Text style={styles.sectionTitle}>Health Overview</Text>

          {overviewItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.overviewCard}
              activeOpacity={0.85}
              onPress={() => {
                if (item.key === "history") router.push("/history");
                // other items can later navigate to education screens
              }}
            >
              <View style={[styles.overviewIconWrapper, { backgroundColor: item.bg }]}>
                <Text style={styles.overviewIcon}>{item.icon}</Text>
              </View>
              <View style={styles.overviewTextWrapper}>
                <Text style={styles.overviewTitle}>{item.title}</Text>
                <Text style={styles.overviewSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Spacer above tab bar */}
          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Bottom tabs */}
        <BottomTabBar activeTab="home" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // Use primary color so the status bar area matches the blue header
    backgroundColor: colors.primary || "#0F75FF",
  },
  container: {
    flex: 1,
    backgroundColor: colors.background || "#F5F5F5",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    backgroundColor: colors.primary || "#0F75FF",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 80,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  question: {
    marginTop: 4,
    color: "#E5EEFF",
    fontSize: 14,
  },
  resultCardWrapper: {
    marginTop: -40,
    paddingHorizontal: 16,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  resultCardLeft: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 12,
    color: colors.textMuted || "#6B7280",
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16A34A",
    marginBottom: 4,
  },
  resultDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  resultCardRight: {
    alignItems: "flex-end",
    marginLeft: 24,
  },
  confidenceLabel: {
    fontSize: 12,
    color: colors.textMuted || "#6B7280",
    marginBottom: 4,
  },
  confidenceValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text || "#111827",
  },
  primaryButton: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: colors.primary || "#0F75FF",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonIcon: {
    marginRight: 8,
    fontSize: 18,
    color: "#fff",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text || "#111827",
  },
  overviewCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  overviewIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  overviewIcon: {
    fontSize: 20,
  },
  overviewTextWrapper: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
    color: colors.text || "#111827",
  },
  overviewSubtitle: {
    fontSize: 13,
    color: colors.textMuted || "#6B7280",
  },
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