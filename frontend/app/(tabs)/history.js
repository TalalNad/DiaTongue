import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import * as SecureStore from "expo-secure-store";
import * as Sharing from "expo-sharing";
import { apiFetch, API_BASE_URL } from "../../src/config/api";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function riskLabel(pFused) {
  if (pFused == null) return "No Record";
  if (pFused < 0.33) return "Low Risk";
  if (pFused < 0.66) return "Medium Risk";
  return "High Risk";
}

function riskStyle(label) {
  if (label === "High Risk") return styles.highRisk;
  if (label === "Medium Risk") return styles.mediumRisk;
  if (label === "Low Risk") return styles.lowRisk;
  return styles.neutralRisk;
}

function riskIcon(label) {
  if (label === "High Risk") return "alert-circle-outline";
  if (label === "Medium Risk") return "pulse-outline";
  if (label === "Low Risk") return "shield-checkmark-outline";
  return "document-text-outline";
}

function riskColor(label) {
  if (label === "High Risk") return "#C2410C";
  if (label === "Medium Risk") return "#B7791F";
  if (label === "Low Risk") return "#12805C";
  return "#64748B";
}

function pct(value) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "--";
}

function cleanHtmlError(txt) {
  if (!txt) return "";
  if (!txt.includes("<!DOCTYPE") && !txt.includes("<html")) return txt;
  const match = txt.match(/Cannot\s+(GET|POST|PUT|DELETE)\s+([^<\n]+)/i);
  if (match?.[2]) return `Endpoint not found: ${match[2]}`;
  return "Server returned HTML instead of a PDF. Check the backend report route.";
}

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async ({ showSpinner = false } = {}) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await apiFetch("/api/scans", { method: "GET" });
      setScans(res?.data || []);
    } catch {
      setScans([]);
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

  const downloadReport = async (scanId) => {
    try {
      setDownloadingId(scanId);

      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("Not logged in", "Please login again.");
        return;
      }

      const url = `${API_BASE_URL}/api/scans/${scanId}/report`;

      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(cleanHtmlError(txt) || `Failed (${res.status})`);
      }

      const arrayBuffer = await res.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = globalThis.btoa(binary);

      const fileUri = `${FileSystem.cacheDirectory}DiaTongue_Report_${scanId}.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Saved", `Report saved to:\n${fileUri}`);
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: "Download report",
        UTI: "com.adobe.pdf",
      });
    } catch (e) {
      Alert.alert("Report error", e?.message || "Failed to generate report");
    } finally {
      setDownloadingId(null);
    }
  };

  const deleteScan = async (scanId) => {
    try {
      setDeletingId(scanId);
      await apiFetch(`/api/scans/${scanId}`, { method: "DELETE" });
      setScans((prev) => prev.filter((scan) => scan._id !== scanId));
    } catch (e) {
      Alert.alert("Delete failed", e?.message || "Could not delete this scan.");
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (scanId) => {
    Alert.alert(
      "Delete scan?",
      "This removes the scan from your history permanently.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteScan(scanId),
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    const label = riskLabel(item?.p_fused);
    const color = riskColor(label);
    const isDownloading = downloadingId === item._id;
    const isDeleting = deletingId === item._id;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardTitleRow}>
            <View style={[styles.riskIcon, riskStyle(label)]}>
              <Ionicons name={riskIcon(label)} size={18} color={color} />
            </View>
            <View>
              <Text style={styles.cardEyebrow}>Scan #{scans.length - index}</Text>
              <Text style={[styles.title, { color }]}>{label}</Text>
            </View>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.conf}>{pct(item?.p_fused)}</Text>
            <Text style={styles.confLabel}>Fused</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-clear-outline" size={15} color="#64748B" />
          <Text style={styles.date}>{formatDate(item?.createdAt)}</Text>
        </View>

        <View style={styles.modelGrid}>
          <View style={styles.modelMetric}>
            <Text style={styles.modelLabel}>Image model</Text>
            <Text style={styles.modelValue}>{pct(item?.p_img)}</Text>
          </View>
          <View style={styles.modelMetric}>
            <Text style={styles.modelLabel}>Clinical model</Text>
            <Text style={styles.modelValue}>{pct(item?.p_clin)}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.reportBtn}
            onPress={() => downloadReport(item._id)}
            disabled={isDownloading || isDeleting}
            activeOpacity={0.84}
          >
            {isDownloading ? (
              <ActivityIndicator color="#1D72F2" />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={18} color="#1D72F2" />
                <Text style={styles.reportBtnText}>Report</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => confirmDelete(item._id)}
            disabled={isDownloading || isDeleting}
            activeOpacity={0.84}
          >
            {isDeleting ? (
              <ActivityIndicator color="#D92D20" />
            ) : (
              <Ionicons name="trash-outline" size={19} color="#D92D20" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Results</Text>
          <Text style={styles.headerTitle}>Scan history</Text>
          <Text style={styles.headerSub}>
            Review saved results, reports, and model confidence.
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countValue}>{scans.length}</Text>
          <Text style={styles.countLabel}>Scans</Text>
        </View>
      </View>

      <FlatList
        data={scans}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <ActivityIndicator color="#1D72F2" />
            ) : (
              <>
                <View style={styles.emptyIcon}>
                  <Ionicons name="scan-outline" size={28} color="#1D72F2" />
                </View>
                <Text style={styles.emptyTitle}>No scans yet</Text>
                <Text style={styles.emptySub}>
                  Run your first scan to start building your history.
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FB" },

  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 58,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF5",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
  },
  eyebrow: {
    color: "#1D72F2",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  headerTitle: {
    marginTop: 5,
    color: "#0F172A",
    fontSize: 26,
    fontWeight: "900",
  },
  headerSub: {
    marginTop: 7,
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 240,
  },
  countBadge: {
    width: 66,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#EEF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  countValue: {
    color: "#1D72F2",
    fontSize: 20,
    fontWeight: "900",
  },
  countLabel: {
    color: "#4875A8",
    fontSize: 11,
    fontWeight: "800",
  },

  list: {
    padding: 16,
    paddingBottom: 28,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E6ECF3",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    flex: 1,
  },
  riskIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  cardEyebrow: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    marginTop: 3,
    fontSize: 18,
    fontWeight: "900",
  },
  lowRisk: { color: "#12805C", backgroundColor: "#ECFDF5" },
  mediumRisk: { color: "#B7791F", backgroundColor: "#FFFBEB" },
  highRisk: { color: "#C2410C", backgroundColor: "#FFF1ED" },
  neutralRisk: { color: "#64748B", backgroundColor: "#F1F5F9" },
  scoreBox: {
    minWidth: 68,
    alignItems: "flex-end",
  },
  conf: {
    color: "#0F172A",
    fontSize: 23,
    fontWeight: "900",
  },
  confLabel: {
    marginTop: 1,
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  metaRow: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  date: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },
  modelGrid: {
    marginTop: 13,
    flexDirection: "row",
    gap: 10,
  },
  modelMetric: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },
  modelLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
  },
  modelValue: {
    marginTop: 4,
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
  },
  actionsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  reportBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: "#EEF6FF",
    borderWidth: 1,
    borderColor: "#D8E8FF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  reportBtnText: {
    color: "#1D72F2",
    fontSize: 14,
    fontWeight: "900",
  },
  deleteBtn: {
    width: 48,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#FFD7D7",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    flex: 1,
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: "#EEF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  emptySub: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#64748B",
  },
});
