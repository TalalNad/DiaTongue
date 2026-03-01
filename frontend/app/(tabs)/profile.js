import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { apiFetch } from "../../src/config/api";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("User");
  const [editing, setEditing] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const load = async () => {
    try {
      const me = await apiFetch("/api/users/me");
      const u = me?.data;
      setUser(u);
      setFirstName(u?.firstName || u?.fullName?.trim()?.split(/\s+/)?.[0] || "User");
      setFullName(u?.fullName || "");
      setPhone(u?.phone || "");
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      const payload = { fullName, phone };
      await apiFetch("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      Alert.alert("Saved", "Profile updated.");
      setEditing(false);
      await load();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    router.replace("/auth/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSub}>Hi, {firstName}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 24 }}>👤</Text>
          </View>

          <View style={{ flex: 1 }}>
            {!editing ? (
              <>
                <Text style={styles.name}>{user?.fullName || "Demo User"}</Text>
                <Text style={styles.email}>{user?.email || "No email"}</Text>
              </>
            ) : (
              <>
                <Text style={styles.label}>Full Name</Text>
                <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
                <Text style={[styles.label, { marginTop: 10 }]}>Phone</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} />
              </>
            )}

            {!editing && (
              <>
                <View style={styles.row}>
                  <Text style={styles.rowKey}>Email:</Text>
                  <Text style={styles.rowVal}>{user?.email || "—"}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowKey}>Member since:</Text>
                  <Text style={styles.rowVal}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "—"}
                  </Text>
                </View>
              </>
            )}
          </View>

          {!editing ? (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.editBtn} onPress={save}>
              <Text style={styles.editBtnText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemIcon}>⚙️</Text>
          <Text style={styles.itemText}>Account Settings</Text>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemIcon}>📈</Text>
          <Text style={styles.itemText}>Health Data</Text>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={styles.logoutText}>⎋  Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F9" },

  header: { backgroundColor: "#1677FF", paddingTop: 60, paddingBottom: 18, paddingHorizontal: 18 },
  headerTitle: { color: "white", fontSize: 26, fontWeight: "900" },
  headerSub: { marginTop: 6, color: "white", fontSize: 14, opacity: 0.9 },

  body: { padding: 16 },

  profileCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "#EEF1F5",
    alignItems: "flex-start",
  },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#EAF2FF", alignItems: "center", justifyContent: "center" },
  name: { fontSize: 18, fontWeight: "900", color: "#111" },
  email: { marginTop: 2, color: "#666" },

  row: { flexDirection: "row", marginTop: 10 },
  rowKey: { width: 110, color: "#666" },
  rowVal: { color: "#111", fontWeight: "700" },

  editBtn: { backgroundColor: "#1677FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  editBtnText: { color: "white", fontWeight: "900" },

  label: { color: "#666", fontSize: 12, marginTop: 6 },
  input: { backgroundColor: "#F7F8FA", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#E6E9EF" },

  item: {
    marginTop: 12,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF1F5",
  },
  itemIcon: { fontSize: 18, marginRight: 10 },
  itemText: { flex: 1, fontWeight: "800", color: "#111" },
  chev: { fontSize: 22, color: "#999" },

  logout: { marginTop: 22, alignItems: "center" },
  logoutText: { color: "#D53B3B", fontSize: 16, fontWeight: "900" },
});