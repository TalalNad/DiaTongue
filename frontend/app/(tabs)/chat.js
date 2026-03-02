// chat.js
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { apiFetch } from "../../src/config/api";

// A simple, clean chat UI that calls your backend:
// POST /api/chat { message: string, history: [{role, content}, ...] }

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: "m0",
      role: "assistant",
      content:
        "Hi! I’m DiaTongue Assistant. Ask me anything about diabetes, tongue-photo tips, or any usecase of the app.",
      ts: Date.now(),
    },
  ]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const historyForApi = useMemo(() => {
    // Send last N turns to keep payload small
    const last = messages.slice(-12).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    return last;
  }, [messages]);

  const scrollToEnd = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd?.({ animated: true });
    }, 50);
  };

  const onSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      role: "user",
      content: trimmed,
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setText("");
    scrollToEnd();

    setSending(true);
    try {
      const resp = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: trimmed, history: historyForApi }),
      });

      const reply = resp?.data?.reply;
      if (!reply) {
        throw new Error("No reply returned from server");
      }

      const botMsg = {
        id: `a_${Date.now()}`,
        role: "assistant",
        content: reply,
        ts: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);
      scrollToEnd();
    } catch (e) {
      Alert.alert("Chat error", e.message || "Failed to get response");
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.bubbleRow,
          isUser ? styles.rowRight : styles.rowLeft,
        ]}
      >
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Assistant</Text>
        <Text style={styles.headerSub}>Ask health questions & app guidance</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={scrollToEnd}
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message…"
            placeholderTextColor="#9AA3AF"
            value={text}
            onChangeText={setText}
            editable={!sending}
            multiline
            maxLength={1200}
          />

          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={onSend}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.sendText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F9" },

  header: {
    backgroundColor: "#1677FF",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 18,
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },
  headerSub: { marginTop: 6, color: "#fff", opacity: 0.9, fontSize: 13 },

  body: { flex: 1 },

  listContent: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },

  bubbleRow: { marginBottom: 10, flexDirection: "row" },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },

  bubble: {
    maxWidth: "82%",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  botBubble: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E9EEF5" },
  userBubble: { backgroundColor: "#1677FF" },

  bubbleText: { fontSize: 14, lineHeight: 20 },
  botText: { color: "#111827", fontWeight: "500" },
  userText: { color: "#FFFFFF", fontWeight: "600" },

  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E9EEF5",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  sendBtn: {
    marginLeft: 10,
    height: 42,
    minWidth: 72,
    borderRadius: 14,
    backgroundColor: "#1677FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: "#fff", fontWeight: "900" },
});