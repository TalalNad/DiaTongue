// app/auth/signup.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import colors from "../../src/constants/colors";
import QuestionnaireSection from "../../src/components/QuestionnaireSection";

const API_BASE_URL = "http://192.168.1.11:5050"; // 👈 your Mac IP

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");

  const [questionnaire, setQuestionnaire] = useState({
    bmi: "",
    gender: null,
    smokingHistory: null,
    hypertension: null,
    heartDisease: null,
  });

  const handleQuestionChange = (key, value) => {
    setQuestionnaire((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignup = async () => {
    const numericAge = parseInt(age, 10);
    if (Number.isNaN(numericAge) || numericAge <= 5) {
      Alert.alert("Invalid age", "Age must be greater than 5 years.");
      return;
    }

    const numericBmi = questionnaire.bmi ? parseFloat(questionnaire.bmi) : null;

    const payload = {
      fullName,
      email,
      password,
      phone,
      age: numericAge,
      bmi: numericBmi,
      gender: questionnaire.gender,
      smoking_history: questionnaire.smokingHistory,
      hypertension: questionnaire.hypertension,
      heart_disease: questionnaire.heartDisease,
    };

    console.log("Sending signup payload:", payload);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Signup response:", data);

      if (!response.ok || !data.success) {
        console.log("Signup failed:", data.message || "Unknown error");
        Alert.alert("Signup failed", data.message || "Something went wrong.");
        return;
      }

      const { token, user } = data.data;
      console.log("User created:", user);
      console.log("JWT token:", token);

      // Show success and navigate to login
      Alert.alert("Account created", "You can now log in.", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/auth/login");
          },
        },
      ]);
    } catch (err) {
      console.log("Network or server error:", err.message);
      Alert.alert(
        "Error",
        "Network or server error occurred. Please try again."
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Blue header area - scrolls with content */}
          <View style={styles.headerWrapper}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <View style={styles.headerTextWrapper}>
                <Text style={styles.brand}>DiaTongue</Text>
                <Text style={styles.headerSubtitle}>Create your account</Text>
              </View>
            </View>
          </View>

          {/* Main body background */}
          <View style={styles.body}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Personal Information</Text>
              <Text style={styles.cardSubtitle}>
                Tell us about yourself
              </Text>

              {/* Full name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Phone */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* Age */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your age"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
                <Text style={styles.helperText}>
                  You must be older than 5 years.
                </Text>
              </View>

              {/* Health questionnaire */}
              <QuestionnaireSection
                values={questionnaire}
                onChange={handleQuestionChange}
              />

              {/* Submit button */}
              <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerWrapper: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 24,
    color: "#FFFFFF",
    marginRight: 12,
  },
  headerTextWrapper: {
    flexDirection: "column",
  },
  brand: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#E5ECFF",
  },
  body: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    marginTop: -8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  card: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },
  button: {
    marginTop: 24,
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});