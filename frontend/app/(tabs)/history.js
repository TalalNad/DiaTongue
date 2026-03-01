import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { apiFetch, API_BASE_URL } from "../../src/config/api";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return "";
  }
}

function riskLabel(pFused) {
  if (pFused == null) return "No Record";
  if (pFused < 0.33) return "Low Risk";
  if (pFused < 0.66) return "Medium Risk";
  return "High Risk";
}

function cleanHtmlError(txt) {
  if (!txt) return "";
  if (!txt.includes("<!DOCTYPE") && !txt.includes("<html")) return txt;
  // Most common Express default:
  // "<pre>Cannot GET /api/scans/xxx/report</pre>"
  const match = txt.match(/Cannot\s+(GET|POST|PUT|DELETE)\s+([^<\n]+)/i);
  if (match?.[2]) return `Endpoint not found: ${match[2]}`;
  return "Server returned HTML instead of a PDF. Check the backend report route.";
}

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const downloadReport = async (scanId) => {
    try {
      setDownloadingId(scanId);

      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("Not logged in", "Please login again.");
        return;
      }

      // ✅ Correct base URL: the same one apiFetch uses
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

      // bytes -> base64
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

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/scans", { method: "GET" });
      setScans(res?.data || []);
    } catch {
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }) => {
    const conf = item?.p_fused != null ? Math.round(item.p_fused * 100) : null;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>{riskLabel(item?.p_fused)}</Text>
          <Text style={styles.conf}>{conf == null ? "--" : `${conf}%`}</Text>
        </View>

        <Text style={styles.date}>{formatDate(item?.createdAt)}</Text>

        <View style={styles.subRow}>
          <Text style={styles.sub}>
            Image: {item?.p_img == null ? "--" : item.p_img.toFixed(3)}
          </Text>
          <Text style={styles.sub}>
            Clinical: {item?.p_clin == null ? "--" : item.p_clin.toFixed(3)}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.reportBtn}
            onPress={() => downloadReport(item._id)}
            disabled={downloadingId === item._id}
          >
            {downloadingId === item._id ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.reportBtnText}>Download PDF report</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>History</Text>
            <Text style={styles.headerSub}>Your past diabetes scan results</Text>
          </View>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => {
              if (!scans?.length) {
                Alert.alert("No scans", "Run a scan first to generate a report.");
                return;
              }
              downloadReport(scans[0]._id);
            }}
          >
            <Text style={styles.headerBtnText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={scans}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptySub}>Run your first scan from the Scan tab.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F9" },

  header: { backgroundColor: "#1677FF", paddingTop: 60, paddingBottom: 16, paddingHorizontal: 18 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "900" },
  headerSub: { marginTop: 6, color: "#fff", opacity: 0.9, fontSize: 13 },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  headerBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  list: { padding: 14 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9EEF5",
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  title: { fontSize: 18, fontWeight: "800", color: "#111827" },
  conf: { fontSize: 18, fontWeight: "900", color: "#111827" },

  date: { marginTop: 6, fontSize: 12, color: "#6B7280" },

  subRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  sub: { fontSize: 12, color: "#374151", fontWeight: "600" },

  actionsRow: { marginTop: 12 },
  reportBtn: {
    backgroundColor: "#F3F6FF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8E3FF",
  },
  reportBtnText: { fontSize: 13, fontWeight: "900", color: "#0F172A" },

  empty: { paddingTop: 40, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  emptySub: { marginTop: 6, fontSize: 13, color: "#6B7280" },
});