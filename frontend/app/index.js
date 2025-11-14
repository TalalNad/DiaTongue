// app/index.js
import { Redirect } from "expo-router";

export default function Index() {
  // When the app opens, send user to the login screen
  return <Redirect href="/auth/login" />;
}