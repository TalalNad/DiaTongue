import * as SecureStore from "expo-secure-store";

export const API_BASE_URL = "http://192.168.1.11:5050";

export async function apiFetch(path, options = {}) {
  const token = await SecureStore.getItemAsync("token");

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && data.message) ||
      (data && data.detail) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}