// app/scan.js
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

export default function ScanScreen() {
  const handleTakePhoto = () => {
    console.log("Take Photo pressed");
    // TODO: integrate camera
  };

  const handleChooseFromGallery = () => {
    console.log("Choose from Gallery pressed");
    // TODO: integrate image picker
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
            <Text style={styles.headerTitle}>New Scan</Text>
            <Text style={styles.headerSubtitle}>
              Capture or upload tongue image
            </Text>
          </View>

          {/* Take photo button */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={handleTakePhoto}
          >
            <Text style={styles.primaryButtonIcon}>📷</Text>
            <Text style={styles.primaryButtonText}>Take Photo</Text>
          </TouchableOpacity>

          {/* Choose from gallery button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={handleChooseFromGallery}
          >
            <Text style={styles.secondaryButtonIcon}>⬆️</Text>
            <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>

          {/* Tips card */}
          <View style={styles.tipsCardWrapper}>
            <View style={styles.tipsCard}>
              <View style={styles.tipsHeaderRow}>
                <View style={styles.tipsIconWrapper}>
                  <Text style={styles.tipsIcon}>🖼️</Text>
                </View>
                <Text style={styles.tipsTitle}>Tips for Best Results</Text>
              </View>

              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>
                  • Use natural or bright lighting
                </Text>
                <Text style={styles.tipItem}>• Stick your tongue out fully</Text>
                <Text style={styles.tipItem}>
                  • Position camera directly in front
                </Text>
                <Text style={styles.tipItem}>
                  • Ensure tongue fills most of the frame
                </Text>
                <Text style={styles.tipItem}>• Keep the image in focus</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        <BottomTabBar activeTab="scan" />
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
  secondaryButton: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonIcon: {
    marginRight: 8,
    fontSize: 18,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text || "#111827",
  },
  tipsCardWrapper: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  tipsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  tipsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipsIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#E9F1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  tipsIcon: {
    fontSize: 18,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text || "#111827",
  },
  tipsList: {
    marginTop: 4,
  },
  tipItem: {
    fontSize: 14,
    color: colors.textMuted || "#6B7280",
    marginBottom: 4,
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