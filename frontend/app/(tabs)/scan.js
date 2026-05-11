import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "http://192.168.1.9:5050"; // ✅ Mac IP + backend port

export default function ScanScreen() {
  const [loading, setLoading] = useState(false);

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
        // ❌ do NOT manually set Content-Type for FormData in React Native
      },
      body: form,
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      throw new Error(data?.message || "Prediction failed");
    }

    return data.data; // { id, p_img, p_clin, p_fused, createdAt }
  };

  const handleImage = async (imageUri) => {
    try {
      setLoading(true);

      const result = await runPrediction(imageUri);
      if (!result) return;

      const percent = typeof result.p_fused === "number"
        ? (result.p_fused * 100).toFixed(1)
        : "--";

      // ✅ For now: show result (no UI destruction)
      Alert.alert(
        "Result",
        `You have ${percent}% chance of diabetes.\n\n(Stored in database as well)`,
      );
    } catch (err) {
      Alert.alert("Scan failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Camera permission is needed to take a photo."
      );
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
      Alert.alert(
        "Permission required",
        "Gallery permission is needed to choose a photo."
      );
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

  return (
    <View style={styles.container}>
      {/* Loading Overlay */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingBackdrop}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#1677FF" />
            <Text style={styles.loadingTitle}>Analyzing…</Text>
            <Text style={styles.loadingSub}>
              Uploading image and running prediction
            </Text>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Scan</Text>
        <Text style={styles.headerSub}>Capture or upload tongue image</Text>
      </View>

      <View style={styles.body}>
        <TouchableOpacity style={styles.primaryBtn} onPress={takePhoto} disabled={loading}>
          <Text style={styles.primaryBtnText}>📷  Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={pickFromGallery} disabled={loading}>
          <Text style={styles.secondaryBtnText}>⬆️  Choose from Gallery</Text>
        </TouchableOpacity>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>🖼️  Tips for Best Results</Text>
          <Text style={styles.tip}>• Use natural or bright lighting</Text>
          <Text style={styles.tip}>• Stick your tongue out fully</Text>
          <Text style={styles.tip}>• Position camera directly in front</Text>
          <Text style={styles.tip}>• Ensure tongue fills most of the frame</Text>
          <Text style={styles.tip}>• Keep the image in focus</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F9" },

  header: {
    backgroundColor: "#1677FF",
    paddingTop: 60,
    paddingBottom: 18,
    paddingHorizontal: 18,
  },
  headerTitle: { color: "white", fontSize: 26, fontWeight: "900" },
  headerSub: { marginTop: 6, color: "white", fontSize: 14, opacity: 0.9 },

  body: { padding: 16 },

  primaryBtn: {
    backgroundColor: "#1677FF",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "900", fontSize: 16 },

  secondaryBtn: {
    marginTop: 12,
    backgroundColor: "white",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#C9D7F5",
  },
  secondaryBtnText: { color: "#111", fontWeight: "800", fontSize: 16 },

  tipsCard: {
    marginTop: 16,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEF1F5",
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
    color: "#111",
  },
  tip: { marginTop: 6, color: "#555", fontSize: 14 },

  loadingBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  loadingTitle: { marginTop: 12, fontSize: 16, fontWeight: "900", color: "#111" },
  loadingSub: { marginTop: 6, fontSize: 13, color: "#666", textAlign: "center" },
});