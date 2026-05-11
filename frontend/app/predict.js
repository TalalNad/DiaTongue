import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "http://192.168.1.9:5050"; // your Node backend (same as login/signup)

export default function PredictScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const openCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Camera permission is required.");
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      quality: 0.9,
      allowsEditing: false,
    });

    if (res.canceled) return;

    const uri = res.assets?.[0]?.uri;
    if (!uri) return;

    setImageUri(uri);
    setResult(null);
  };

  const runPrediction = async () => {
    if (!imageUri) {
      Alert.alert("Missing image", "Please take a tongue photo first.");
      return;
    }

    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const filename = imageUri.split("/").pop() || "tongue.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const ext = match?.[1]?.toLowerCase();
      const mime = ext ? `image/${ext === "jpg" ? "jpeg" : ext}` : "image/jpeg";

      const form = new FormData();
      form.append("file", {
        uri: imageUri,
        name: filename,
        type: mime,
      });

      const resp = await fetch(`${API_BASE_URL}/api/predict/run`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT set Content-Type manually for multipart in RN fetch
        },
        body: form,
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.message || "Prediction failed");
      }

      setResult(data.data);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tongue Prediction</Text>

      <TouchableOpacity style={styles.btn} onPress={openCamera}>
        <Text style={styles.btnText}>Open Camera</Text>
      </TouchableOpacity>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <Text style={styles.hint}>No image yet.</Text>
      )}

      <TouchableOpacity style={[styles.btn, !imageUri && styles.btnDisabled]} onPress={runPrediction} disabled={!imageUri || loading}>
        {loading ? <ActivityIndicator /> : <Text style={styles.btnText}>Run Prediction</Text>}
      </TouchableOpacity>

      {result ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Result</Text>
          <Text>p_img: {Number(result.p_img).toFixed(4)}</Text>
          <Text>p_clin: {Number(result.p_clin).toFixed(4)}</Text>
          <Text style={styles.fused}>p_fused: {Number(result.p_fused).toFixed(4)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: "#F5F5F5" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  btn: { height: 48, backgroundColor: "#2E6EF7", borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  preview: { width: "100%", height: 280, borderRadius: 12, backgroundColor: "#ddd", marginVertical: 12 },
  hint: { color: "#555", marginVertical: 12 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  fused: { marginTop: 8, fontWeight: "800" },
});