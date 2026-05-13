import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { apiFetch } from "../../src/config/api";

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const SMOKING_OPTIONS = [
  { label: "Never", value: "never" },
  { label: "Current", value: "current" },
  { label: "Former", value: "former" },
];

const YES_NO_OPTIONS = [
  { label: "Yes", value: 1 },
  { label: "No", value: 0 },
];

function firstNameFor(user) {
  return user?.firstName || user?.fullName?.trim()?.split(/\s+/)?.[0] || "User";
}

function formatMemberSince(date) {
  if (!date) return "--";
  return new Date(date).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "--";
  return String(value);
}

function yesNo(value) {
  if (value === 1) return "Yes";
  if (value === 0) return "No";
  return "--";
}

function OptionGroup({ label, value, options, onChange }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsRow}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.82}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [bmi, setBmi] = useState("");
  const [gender, setGender] = useState(null);
  const [smokingHistory, setSmokingHistory] = useState(null);
  const [hypertension, setHypertension] = useState(null);
  const [heartDisease, setHeartDisease] = useState(null);

  const hydrateForm = useCallback((u) => {
    setFullName(u?.fullName || "");
    setPhone(u?.phone || "");
    setAge(u?.age != null ? String(u.age) : "");
    setBmi(u?.bmi != null ? String(u.bmi) : "");
    setGender(u?.gender || null);
    setSmokingHistory(u?.smoking_history || null);
    setHypertension(u?.hypertension ?? null);
    setHeartDisease(u?.heart_disease ?? null);
  }, []);

  const load = useCallback(async () => {
    try {
      const me = await apiFetch("/api/users/me");
      const u = me?.data || null;
      setUser(u);
      hydrateForm(u);
    } catch {
      setUser(null);
    }
  }, [hydrateForm]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const cancelEditing = () => {
    hydrateForm(user);
    setEditing(false);
  };

  const save = async () => {
    const numericAge = parseInt(age, 10);
    const numericBmi = parseFloat(bmi);

    if (!fullName.trim()) {
      Alert.alert("Missing name", "Full name is required.");
      return;
    }

    if (Number.isNaN(numericAge) || numericAge <= 5) {
      Alert.alert("Invalid age", "Age must be greater than 5 years.");
      return;
    }

    if (Number.isNaN(numericBmi) || numericBmi <= 0) {
      Alert.alert("Invalid BMI", "Enter a valid BMI value.");
      return;
    }

    if (!gender || !smokingHistory || hypertension === null || heartDisease === null) {
      Alert.alert("Missing health data", "Complete all health profile fields.");
      return;
    }

    try {
      setSaving(true);
      const res = await apiFetch("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          age: numericAge,
          bmi: numericBmi,
          gender,
          smoking_history: smokingHistory,
          hypertension,
          heart_disease: heartDisease,
        }),
      });

      const updatedUser = res?.data || null;
      setUser(updatedUser);
      hydrateForm(updatedUser);
      await SecureStore.setItemAsync("user", JSON.stringify(updatedUser));
      setEditing(false);
      Alert.alert("Saved", "Profile and health data updated.");
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    router.replace("/auth/login");
  };

  const initials = (user?.fullName || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Account</Text>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSub}>Hi, {firstNameFor(user)}</Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={editing ? cancelEditing : () => setEditing(true)}
            activeOpacity={0.84}
          >
            <Ionicons
              name={editing ? "close-outline" : "create-outline"}
              size={19}
              color="#1D72F2"
            />
            <Text style={styles.headerButtonText}>{editing ? "Cancel" : "Edit"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileSummary}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || "U"}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.name}>{user?.fullName || "User"}</Text>
            <Text style={styles.email}>{user?.email || "No email"}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal details</Text>
        </View>

        <View style={styles.card}>
          {editing ? (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter full name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Phone number</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>
            </>
          ) : (
            <>
              <InfoRow label="Email" value={displayValue(user?.email)} />
              <InfoRow label="Phone" value={displayValue(user?.phone)} />
              <InfoRow label="Member since" value={formatMemberSince(user?.createdAt)} />
            </>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health data</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.sectionLink}>Update</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          {editing ? (
            <>
              <View style={styles.twoCol}>
                <View style={[styles.fieldGroup, styles.flexField]}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    placeholder="Age"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.fieldGroup, styles.flexField]}>
                  <Text style={styles.label}>BMI</Text>
                  <TextInput
                    style={styles.input}
                    value={bmi}
                    onChangeText={setBmi}
                    placeholder="BMI"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <OptionGroup
                label="Gender"
                value={gender}
                onChange={setGender}
                options={GENDER_OPTIONS}
              />
              <OptionGroup
                label="Smoking history"
                value={smokingHistory}
                onChange={setSmokingHistory}
                options={SMOKING_OPTIONS}
              />
              <OptionGroup
                label="Hypertension"
                value={hypertension}
                onChange={setHypertension}
                options={YES_NO_OPTIONS}
              />
              <OptionGroup
                label="Heart disease"
                value={heartDisease}
                onChange={setHeartDisease}
                options={YES_NO_OPTIONS}
              />
            </>
          ) : (
            <>
              <View style={styles.healthGrid}>
                <View style={styles.healthMetric}>
                  <Text style={styles.healthLabel}>Age</Text>
                  <Text style={styles.healthValue}>{displayValue(user?.age)}</Text>
                </View>
                <View style={styles.healthMetric}>
                  <Text style={styles.healthLabel}>BMI</Text>
                  <Text style={styles.healthValue}>{displayValue(user?.bmi)}</Text>
                </View>
              </View>
              <InfoRow label="Gender" value={displayValue(user?.gender)} />
              <InfoRow label="Smoking history" value={displayValue(user?.smoking_history)} />
              <InfoRow label="Hypertension" value={yesNo(user?.hypertension)} />
              <InfoRow label="Heart disease" value={yesNo(user?.heart_disease)} />
            </>
          )}
        </View>

        {editing && (
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={save}
            disabled={saving}
            activeOpacity={0.86}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save changes"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logout} onPress={logout} activeOpacity={0.84}>
          <Ionicons name="log-out-outline" size={20} color="#D92D20" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FB" },
  content: { paddingBottom: 30 },

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
    fontWeight: "700",
  },
  headerButton: {
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#EEF6FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerButtonText: {
    color: "#1D72F2",
    fontSize: 13,
    fontWeight: "900",
  },

  profileSummary: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E6ECF3",
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: "#1D72F2",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  profileText: { flex: 1 },
  name: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },
  email: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },

  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
  },
  sectionLink: {
    color: "#1D72F2",
    fontSize: 13,
    fontWeight: "900",
  },

  card: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E6ECF3",
  },
  fieldGroup: { marginBottom: 14 },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 7,
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDE6F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },
  twoCol: {
    flexDirection: "row",
    gap: 10,
  },
  flexField: { flex: 1 },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDE6F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  optionSelected: {
    borderColor: "#1D72F2",
    backgroundColor: "#EEF6FF",
  },
  optionText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "800",
  },
  optionTextSelected: {
    color: "#1D72F2",
  },
  infoRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EFF4FA",
  },
  infoLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "800",
  },
  infoValue: {
    flex: 1,
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
    textTransform: "capitalize",
  },
  healthGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  healthMetric: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },
  healthLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  healthValue: {
    marginTop: 5,
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "900",
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 16,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: "#1D72F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabledButton: { opacity: 0.7 },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  logout: {
    marginHorizontal: 16,
    marginTop: 18,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#FFD7D7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    color: "#D92D20",
    fontSize: 15,
    fontWeight: "900",
  },
});
