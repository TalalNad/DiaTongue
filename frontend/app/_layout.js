import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Home is the main/root screen after login */}
      <Stack.Screen
        name="home"
        options={{
          // No animation when switching to home via tabs
          animation: "none",
          gestureEnabled: false, // still prevents back-swipe from home to login
          fullScreenGestureEnabled: false,
        }}
      />

      {/* Scan + Profile also have no animation for tab switches */}
      <Stack.Screen
        name="scan"
        options={{
          animation: "none",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          animation: "none",
        }}
      />

      {/* You can add others similarly later, e.g.: */}
      {/* <Stack.Screen name="history" options={{ animation: "none" }} /> */}
    </Stack>
  );
}