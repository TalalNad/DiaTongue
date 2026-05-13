import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../../src/config/api";

function riskLabel(pFused) {
  if (typeof pFused !== "number") return "No Record";
  if (pFused < 0.33) return "Low Risk";
  if (pFused < 0.66) return "Medium Risk";
  return "High Risk";
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

export default function ScanScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runPrediction = async (imageUri) => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      Alert.alert("Not logged in", "Please login again.");
      return null;
    }

    const form = new FormData();
    form.append("file", {
      uri: imageUri,
      name: "scan.jpg",
      type: "image/jpeg",
    });

    const res = await fetch(`${API_BASE_URL}/api/predict/run`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      throw new Error(data?.message || "Prediction failed");
    }

    return data.data;
  };

  const handleImage = async (imageUri) => {
    try {
      setLoading(true);

      const prediction = await runPrediction(imageUri);
      if (!prediction) return;
      setResult(prediction);
    } catch (err) {
      Alert.alert("Scan failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Camera permission is needed to take a photo.");
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });

    if (res.canceled) return;

    const uri = res.assets?.[0]?.uri;
    if (!uri) {
      Alert.alert("Error", "No image captured.");
      return;
    }

    await handleImage(uri);
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Gallery permission is needed to choose a photo.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: false,
    });

    if (res.canceled) return;

    const uri = res.assets?.[0]?.uri;
    if (!uri) {
      Alert.alert("Error", "No image selected.");
      return;
    }

    await handleImage(uri);
  };

  const label = riskLabel(result?.p_fused);
  const color = riskColor(label);

  return (
    <View style={styles.container}>
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#1D72F2" />
            <Text style={styles.loadingTitle}>Analyzing scan</Text>
            <Text style={styles.loadingSub}>
              Uploading the image and combining clinical data.
            </Text>
          </View>
        </View>
      </Modal>

      <Modal visible={!!result} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.resultModal}>
            <View style={[styles.resultIcon, { backgroundColor: `${color}16` }]}>
              <Ionicons name="pulse-outline" size={28} color={color} />
            </View>
            <Text style={[styles.resultLabel, { color }]}>{label}</Text>
            <Text style={styles.resultScore}>{pct(result?.p_fused)}</Text>
            <Text style={styles.resultSub}>Final fused diabetes chance</Text>

            <View style={styles.resultMetrics}>
              <View style={styles.resultMetric}>
                <Text style={styles.resultMetricLabel}>Image</Text>
                <Text style={styles.resultMetricValue}>{pct(result?.p_img)}</Text>
              </View>
              <View style={styles.resultMetric}>
                <Text style={styles.resultMetricLabel}>Clinical</Text>
                <Text style={styles.resultMetricValue}>{pct(result?.p_clin)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.resultPrimary}
              onPress={() => {
                setResult(null);
                router.push("/(tabs)/history");
              }}
              activeOpacity={0.86}
            >
              <Text style={styles.resultPrimaryText}>View history</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resultSecondary}
              onPress={() => setResult(null)}
              activeOpacity={0.86}
            >
              <Text style={styles.resultSecondaryText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>Capture</Text>
        <Text style={styles.headerTitle}>New scan</Text>
        <Text style={styles.headerSub}>Use a clear tongue image for the best model signal.</Text>
      </View>

      <View style={styles.body}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={takePhoto}
          disabled={loading}
          activeOpacity={0.86}
        >
          <View style={styles.primaryIcon}>
            <Ionicons name="camera-outline" size={24} color="#1D72F2" />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.primaryBtnText}>Take photo</Text>
            <Text style={styles.actionSub}>Open camera and run a scan</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={pickFromGallery}
          disabled={loading}
          activeOpacity={0.86}
        >
          <View style={styles.secondaryIcon}>
            <Ionicons name="image-outline" size={23} color="#1D72F2" />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.secondaryBtnText}>Choose from gallery</Text>
            <Text style={styles.secondarySub}>Upload an existing image</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Photo checklist</Text>
          {[
            "Use bright, even lighting",
            "Face the camera directly",
            "Keep the tongue centered and in focus",
            "Avoid heavy shadows or blur",
          ].map((tip) => (
            <View style={styles.tipRow} key={tip}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#12805C" />
              <Text style={styles.tip}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FB" },

  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 58,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF5",
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
  },

  body: { padding: 16 },
  primaryBtn: {
    minHeight: 82,
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#1D72F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  primaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: { flex: 1 },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "900", fontSize: 17 },
  actionSub: { marginTop: 4, color: "#DCEBFF", fontWeight: "700", fontSize: 13 },

  secondaryBtn: {
    marginTop: 12,
    minHeight: 78,
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0EAF6",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  secondaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: "#EEF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { color: "#0F172A", fontWeight: "900", fontSize: 16 },
  secondarySub: { marginTop: 4, color: "#64748B", fontWeight: "700", fontSize: 13 },

  tipsCard: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E6ECF3",
  },
  tipsTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 10,
    color: "#0F172A",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 7,
  },
  tip: { color: "#475569", fontSize: 14, fontWeight: "700", flex: 1 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  loadingTitle: { marginTop: 14, fontSize: 17, fontWeight: "900", color: "#0F172A" },
  loadingSub: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "700",
  },
  resultModal: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 18,
    alignItems: "center",
  },
  resultIcon: {
    width: 58,
    height: 58,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  resultLabel: {
    marginTop: 13,
    fontSize: 21,
    fontWeight: "900",
  },
  resultScore: {
    marginTop: 4,
    fontSize: 38,
    fontWeight: "900",
    color: "#0F172A",
  },
  resultSub: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "800",
  },
  resultMetrics: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  resultMetric: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },
  resultMetricLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
  },
  resultMetricValue: {
    marginTop: 4,
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
  },
  resultPrimary: {
    width: "100%",
    minHeight: 48,
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: "#1D72F2",
    alignItems: "center",
    justifyContent: "center",
  },
  resultPrimaryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  resultSecondary: {
    width: "100%",
    minHeight: 44,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  resultSecondaryText: { color: "#64748B", fontSize: 15, fontWeight: "900" },
});
