// src/components/QuestionnaireSection.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import colors from "../constants/colors";

const OPTIONS_YES_NO = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
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
 *  - values: { q1: "yes" | "no" | null, ... }
 *  - onChange: (key, value) => void
 */
export default function QuestionnaireSection({ values, onChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Health Questionnaire</Text>
      <Text style={styles.sectionSubtitle}>
        These questions help us analyse your risk of Type 2 Diabetes.
      </Text>

      <RadioGroup
        label="Do you have a family history of diabetes?"
        value={values.familyHistory}
        onChange={(v) => onChange("familyHistory", v)}
        options={OPTIONS_YES_NO}
      />

      <RadioGroup
        label="Do you smoke regularly?"
        value={values.smoker}
        onChange={(v) => onChange("smoker", v)}
        options={OPTIONS_YES_NO}
      />

      {/* TODO: Later we’ll add all your real questions here */}
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
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
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
    color: colors.primaryDark,
    fontWeight: "600",
  },
});