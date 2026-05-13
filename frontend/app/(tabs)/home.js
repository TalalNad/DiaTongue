import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { apiFetch } from "../../src/config/api";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function riskTone(label) {
  if (label === "High Risk") return styles.highTone;
  if (label === "Medium Risk") return styles.mediumTone;
  if (label === "Low Risk") return styles.lowTone;
  return styles.neutralTone;
}

function riskColor(label) {
  if (label === "High Risk") return "#C2410C";
  if (label === "Medium Risk") return "#B7791F";
  if (label === "Low Risk") return "#12805C";
  return "#64748B";
}

function riskIcon(label) {
  if (label === "High Risk") return "alert-circle-outline";
  if (label === "Medium Risk") return "pulse-outline";
  if (label === "Low Risk") return "shield-checkmark-outline";
  return "document-text-outline";
}

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [latest, setLatest] = useState(null);

  const load = useCallback(async ({ showSpinner = false } = {}) => {
    try {
      if (showSpinner) setLoading(true);

      const [me, last] = await Promise.all([
        apiFetch("/api/users/me"),
        apiFetch("/api/scans/latest"),
      ]);

      setUser(me?.data || null);
      setLatest(last?.data || null);
    } catch {
      setLatest(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load({ showSpinner: true });
    }, [load])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const firstName =
    user?.firstName || user?.fullName?.trim()?.split(/\s+/)?.[0] || "User";
  const riskLabel = latest?.riskLabel || "No Record";
  const confidence =
    latest?.confidence != null ? Math.round(latest.confidence * 100) : null;
  const dateText = latest?.createdAt ? formatDate(latest.createdAt) : "No scans yet";
  const progressWidth = `${Math.min(Math.max(confidence || 0, 0), 100)}%`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.eyebrow}>DiaTongue</Text>
            <Text style={styles.headerTitle}>Good afternoon, {firstName}</Text>
          </View>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.8}
          >
            <Ionicons name="person-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>
          Track your tongue scan results and clinical risk profile.
        </Text>
      </View>

      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View>
            <Text style={styles.cardLabel}>Latest result</Text>
            <Text style={[styles.riskTitle, riskTone(riskLabel)]}>{riskLabel}</Text>
          </View>
          <View style={[styles.riskBadge, riskTone(riskLabel)]}>
            <Ionicons name={riskIcon(riskLabel)} size={18} color={riskColor(riskLabel)} />
          </View>
        </View>

        <View style={styles.scoreRow}>
          <View>
            <Text style={styles.scoreValue}>
              {confidence == null ? "--" : `${confidence}%`}
            </Text>
            <Text style={styles.scoreLabel}>Chance of diabetes</Text>
          </View>
          <Text style={styles.resultDate}>{dateText}</Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              riskLabel === "High Risk" && styles.progressHigh,
              riskLabel === "Medium Risk" && styles.progressMedium,
              riskLabel === "Low Risk" && styles.progressLow,
              { width: progressWidth },
            ]}
          />
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.primaryAction}
          onPress={() => router.push("/(tabs)/scan")}
          activeOpacity={0.88}
        >
          <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
          <View style={styles.actionTextWrap}>
            <Text style={styles.primaryActionTitle}>New scan</Text>
            <Text style={styles.primaryActionSub}>Capture or upload image</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Health overview</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
          <Text style={styles.sectionLink}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Age</Text>
          <Text style={styles.metricValue}>{user?.age ?? "--"}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>BMI</Text>
          <Text style={styles.metricValue}>{user?.bmi ?? "--"}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.listItem}
        onPress={() => router.push("/(tabs)/history")}
        activeOpacity={0.84}
      >
        <View style={styles.listIcon}>
          <Ionicons name="time-outline" size={21} color="#1D72F2" />
        </View>
        <View style={styles.listText}>
          <Text style={styles.listTitle}>Scan history</Text>
          <Text style={styles.listSub}>Review previous results and reports</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.listItem}
        onPress={() => router.push("/(tabs)/profile")}
        activeOpacity={0.84}
      >
        <View style={styles.listIcon}>
          <Ionicons name="fitness-outline" size={21} color="#1D72F2" />
        </View>
        <View style={styles.listText}>
          <Text style={styles.listTitle}>Health data</Text>
          <Text style={styles.listSub}>Keep clinical details up to date</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </TouchableOpacity>

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={20} color="#64748B" />
        <Text style={styles.noteText}>
          Results are screening signals and should be interpreted with a qualified clinician.
        </Text>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#1D72F2" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FB" },
  content: { paddingBottom: 28 },

  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF5",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    color: "#1D72F2",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  headerTitle: {
    marginTop: 5,
    color: "#0F172A",
    fontSize: 25,
    fontWeight: "900",
  },
  headerSub: {
    marginTop: 9,
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  resultCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6ECF3",
    shadowColor: "#0F172A",
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },
  riskTitle: {
    marginTop: 5,
    fontSize: 24,
    fontWeight: "900",
  },
  riskBadge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  lowTone: { color: "#12805C" },
  mediumTone: { color: "#B7791F" },
  highTone: { color: "#C2410C" },
  neutralTone: { color: "#64748B" },
  scoreRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
  },
  scoreValue: {
    color: "#0F172A",
    fontSize: 34,
    fontWeight: "900",
  },
  scoreLabel: {
    marginTop: 2,
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },
  resultDate: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
  },
  progressTrack: {
    marginTop: 14,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#E8EDF5",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    minWidth: 4,
    backgroundColor: "#94A3B8",
  },
  progressLow: { backgroundColor: "#18A06A" },
  progressMedium: { backgroundColor: "#D89B2B" },
  progressHigh: { backgroundColor: "#E0522D" },

  quickActions: { paddingHorizontal: 16, marginTop: 14 },
  primaryAction: {
    minHeight: 72,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#1D72F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionTextWrap: { flex: 1 },
  primaryActionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  primaryActionSub: {
    marginTop: 3,
    color: "#DCEBFF",
    fontSize: 13,
    fontWeight: "700",
  },

  sectionHeader: {
    marginTop: 22,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },
  sectionLink: {
    color: "#1D72F2",
    fontSize: 13,
    fontWeight: "900",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6ECF3",
  },
  metricLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  metricValue: {
    marginTop: 6,
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "900",
  },

  listItem: {
    marginHorizontal: 16,
    marginTop: 10,
    minHeight: 66,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6ECF3",
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#EEF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  listText: { flex: 1 },
  listTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },
  listSub: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  note: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 13,
    borderRadius: 8,
    backgroundColor: "#EEF2F7",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  noteText: {
    flex: 1,
    color: "#475569",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(246,248,251,0.55)",
  },
});
