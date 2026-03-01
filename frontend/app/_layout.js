import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* auth screens */}
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />

      {/* tabs group */}
      <Stack.Screen name="(tabs)" />

      {/* default */}
      <Stack.Screen name="index" />
    </Stack>
  );
}