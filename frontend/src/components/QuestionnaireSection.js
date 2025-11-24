
// src/components/QuestionnaireSection.js
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import colors from "../constants/colors";

const YES_NO_OPTIONS = [
  { label: "Yes", value: 1 },
  { label: "No", value: 0 },
];

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const SMOKING_OPTIONS = [
  { label: "Never", value: "never" },
  { label: "Current", value: "current" },
  { label: "Former", value: "former" },
];

function RadioGroup({ label, value, onChange, options }) {
  return (
    <View style={styles.group}>
      <Text style={styles.questionLabel}>{label}</Text>
      <View style={styles.optionsRow}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionChip,
                selected && styles.optionChipSelected,
              ]}
              onPress={() => onChange(opt.value)}
            >
              <View
                style={[
                  styles.radioOuter,
                  selected && styles.radioOuterSelected,
                ]}
              >
                {selected && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[
                  styles.optionText,
                  selected && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Props:
 *  - values: {
 *      bmi: string,
 *      gender: "male" | "female" | null,
 *      smokingHistory: "never" | "current" | "former" | null,
 *      hypertension: 0 | 1 | null,
 *      heartDisease: 0 | 1 | null,
 *    }
 *  - onChange: (key, value) => void
 */
export default function QuestionnaireSection({ values, onChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Health Questionnaire</Text>
      <Text style={styles.sectionSubtitle}>
        These questions are based on clinical risk factors used in your
        diabetes prediction model.
      </Text>

      {/* BMI */}
      <View style={styles.group}>
        <Text style={styles.questionLabel}>Body Mass Index (BMI)</Text>
        <Text style={styles.helperText}>
          Enter your BMI value (e.g. 27.5). We will validate the number on the
          server.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your BMI"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={values.bmi}
          onChangeText={(text) => onChange("bmi", text)}
        />
      </View>

      {/* Gender */}
      <RadioGroup
        label="Gender"
        value={values.gender}
        onChange={(v) => onChange("gender", v)}
        options={GENDER_OPTIONS}
      />

      {/* Smoking history */}
      <RadioGroup
        label="Smoking history"
        value={values.smokingHistory}
        onChange={(v) => onChange("smokingHistory", v)}
        options={SMOKING_OPTIONS}
      />

      {/* Hypertension */}
      <RadioGroup
        label="Do you have hypertension?"
        value={values.hypertension}
        onChange={(v) => onChange("hypertension", v)}
        options={YES_NO_OPTIONS}
      />

      {/* Heart disease */}
      <RadioGroup
        label="Do you have a history of heart disease?"
        value={values.heartDisease}
        onChange={(v) => onChange("heartDisease", v)}
        options={YES_NO_OPTIONS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
  },
  group: {
    marginBottom: 18,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    backgroundColor: "#F9FAFB",
    fontSize: 14,
    color: colors.textDark,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F9FAFB",
    marginRight: 8,
    marginBottom: 8,
  },
  optionChipSelected: {
    borderColor: colors.primary,
    backgroundColor: "#E5F0FF",
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.textDark,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
});