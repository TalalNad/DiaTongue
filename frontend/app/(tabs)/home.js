import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { apiFetch } from "../../src/config/api";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [latest, setLatest] = useState(null); // {riskLabel, confidence, createdAt}

  const load = async () => {
    try {
      setLoading(true);

      // ✅ you will add these endpoints in backend (I’ll give you code after UI)
      const me = await apiFetch("/api/users/me");
      setUserName(me?.data?.firstName || me?.data?.fullName?.trim()?.split(/\s+/)?.[0] || "User");

      const last = await apiFetch("/api/scans/latest"); // returns null/empty if none
      setLatest(last?.data || null);
    } catch (e) {
      // if backend endpoints not ready yet, just show "no record"
      setLatest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const riskLabel = latest?.riskLabel || "No Record";
  const confidence = latest?.confidence != null ? `${Math.round(latest.confidence * 100)}%` : "--";
  const dateText = latest?.createdAt ? formatDate(latest.createdAt) : "";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Good afternoon, {userName}</Text>
        <Text style={styles.headerSub}>How are you feeling today?</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTopLeft}>Last Scan Result</Text>
          <Text style={styles.cardTopRight}>Chances of Diabetes</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={[styles.risk, riskLabel === "Low Risk" ? styles.low : styles.muted]}>
            {riskLabel}
          </Text>
          <Text style={styles.conf}>{confidence}</Text>
        </View>

        {!!dateText && <Text style={styles.date}>{dateText}</Text>}
        {!dateText && <Text style={styles.dateMuted}>No previous scan found</Text>}
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => router.push("/(tabs)/scan")}
      >
        <Text style={styles.primaryBtnText}>📷  New Scan</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Health Overview</Text>

      <TouchableOpacity style={styles.listItem} onPress={() => router.push("/(tabs)/history")}>
        <View style={styles.iconBox}><Text style={styles.icon}>📈</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.listTitle}>Scan History</Text>
          <Text style={styles.listSub}>View your past results</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.listItem}>
        <View style={styles.iconBox}><Text style={styles.icon}>📖</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.listTitle}>Understanding T2DM</Text>
          <Text style={styles.listSub}>Learn about diabetes</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.listItem}>
        <View style={styles.iconBox}><Text style={styles.icon}>ℹ️</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.listTitle}>How to Take Good Photos</Text>
          <Text style={styles.listSub}>Tips for best results</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F9" },

  header: { backgroundColor: "#1677FF", paddingTop: 60, paddingBottom: 22, paddingHorizontal: 18 },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "white", marginTop: 6, fontSize: 14, opacity: 0.9 },

  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: -18,
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTopLeft: { color: "#666", fontSize: 13 },
  cardTopRight: { color: "#666", fontSize: 13 },

  risk: { fontSize: 22, fontWeight: "900", marginTop: 8 },
  low: { color: "#22A35A" },
  muted: { color: "#999" },

  conf: { fontSize: 26, fontWeight: "900", marginTop: 8, color: "#111" },
  date: { marginTop: 6, color: "#555" },
  dateMuted: { marginTop: 6, color: "#999" },

  primaryBtn: {
    backgroundColor: "#1677FF",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "800", fontSize: 16 },

  sectionTitle: { marginTop: 18, marginLeft: 16, fontSize: 18, fontWeight: "800", color: "#111" },

  listItem: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF1F5",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F1F6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: { fontSize: 18 },
  listTitle: { fontSize: 15, fontWeight: "800", color: "#111" },
  listSub: { marginTop: 2, fontSize: 13, color: "#666" },
  chev: { fontSize: 22, color: "#999", marginLeft: 8 },

  loadingOverlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, justifyContent: "center", alignItems: "center" },
});