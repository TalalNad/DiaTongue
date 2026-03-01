// app/profile.js
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
import BottomTabBar from "../src/components/BottomTabBar";

export default function ProfileScreen() {
  const handleLogout = () => {
    console.log("Log out pressed");
    // TODO: clear auth state and navigate to login
    // router.replace("/auth/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Blue header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your account</Text>
          </View>

          {/* Profile card */}
          <View style={styles.profileCardWrapper}>
            <View style={styles.profileCard}>
              <View style={styles.profileTopRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarIcon}>👤</Text>
                </View>
                <View style={styles.profileTextWrapper}>
                  <Text style={styles.profileName}>Demo User</Text>
                  <Text style={styles.profileEmail}>
                    talalnadeem.7.tn@gmail.com
                  </Text>
                </View>
              </View>

              <View style={styles.profileDivider} />

              <View style={styles.profileInfoRow}>
                <Text style={styles.infoIcon}>✉️</Text>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>
                  {" "}
                  talalnadeem.7.tn@gmail.com
                </Text>
              </View>

              <View style={styles.profileInfoRow}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.infoLabel}>Member since:</Text>
                <Text style={styles.infoValue}> March 2024</Text>
              </View>
            </View>
          </View>

          {/* Settings cards */}
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.85}>
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionTitle}>Account Settings</Text>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.85}>
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Health Data</Text>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>

          {/* Logout card */}
          <TouchableOpacity
            style={styles.logoutCard}
            activeOpacity={0.85}
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>↗</Text>
            <Text style={styles.logoutText}> Log Out</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>

        <BottomTabBar activeTab="profile" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    marginTop: 4,
    color: "#E5EEFF",
    fontSize: 14,
  },
  profileCardWrapper: {
    marginTop: -24,
    paddingHorizontal: 16,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarIcon: {
    fontSize: 26,
  },
  profileTextWrapper: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text || "#111827",
  },
  profileEmail: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted || "#6B7280",
  },
  profileDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  profileInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  infoIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textMuted || "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    color: colors.text || "#111827",
    fontWeight: "500",
  },
  actionCard: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  actionTitle: {
    fontSize: 15,
    color: colors.text || "#111827",
    fontWeight: "500",
  },
  actionChevron: {
    fontSize: 18,
    color: "#9CA3AF",
  },
  logoutCard: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  logoutIcon: {
    fontSize: 16,
    color: "#DC2626",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
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