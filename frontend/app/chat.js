// app/chat.js
import React, { useState, useRef, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Keyboard,
} from "react-native";
import colors from "../src/constants/colors";
import BottomTabBar from "../src/components/BottomTabBar";
import API_BASE_URL from "../src/config/api";

const QUICK_PROMPTS = [
    "What are symptoms of T2DM?",
    "How does BMI affect diabetes risk?",
    "What foods should I avoid?",
    "What is HbA1c?",
];

function MessageBubble({ item }) {
    const isUser = item.role === "user";
    return (
        <View
            style={[
                styles.bubbleWrapper,
                isUser ? styles.bubbleWrapperUser : styles.bubbleWrapperBot,
            ]}
        >
            {!isUser && (
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarEmoji}>🤖</Text>
                </View>
            )}
            <View
                style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleBot,
                ]}
            >
                <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
                    {item.text}
                </Text>
                {item.timestamp && (
                    <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
                        {item.timestamp}
                    </Text>
                )}
            </View>
        </View>
    );
}

export default function ChatScreen() {
    const [messages, setMessages] = useState([
        {
            id: "welcome",
            role: "model",
            text: "👋 Hi! I'm your DiaTongue Assistant. I'm here to help you with any questions about diabetes — symptoms, diet, risk factors, and more.\n\nHow can I help you today?",
            timestamp: formatTime(new Date()),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef(null);

    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const sendMessage = useCallback(
        async (text) => {
            const trimmed = (text || inputText).trim();
            if (!trimmed || isLoading) return;

            Keyboard.dismiss();
            setInputText("");

            const userMessage = {
                id: Date.now().toString(),
                role: "user",
                text: trimmed,
                timestamp: formatTime(new Date()),
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);
            scrollToBottom();

            // Build history for the API (exclude the welcome message)
            const history = messages
                .filter((m) => m.id !== "welcome")
                .map((m) => ({ role: m.role, text: m.text }));

            try {
                const response = await fetch(`${API_BASE_URL}/api/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: trimmed, history }),
                });

                const data = await response.json();

                const botMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "model",
                    text:
                        data.success && data.reply
                            ? data.reply
                            : data.message || "Sorry, I couldn't get a response. Please try again.",
                    timestamp: formatTime(new Date()),
                };

                setMessages((prev) => [...prev, botMessage]);
            } catch (err) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: "model",
                        text: "⚠️ Network error. Please check your connection and try again.",
                        timestamp: formatTime(new Date()),
                    },
                ]);
            } finally {
                setIsLoading(false);
                scrollToBottom();
            }
        },
        [inputText, isLoading, messages, scrollToBottom]
    );

    const handleQuickPrompt = (prompt) => {
        sendMessage(prompt);
    };

    const renderItem = useCallback(
        ({ item }) => <MessageBubble item={item} />,
        []
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.headerAvatar}>
                                <Text style={styles.headerAvatarEmoji}>🤖</Text>
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>DiaTongue Assistant</Text>
                                <Text style={styles.headerSubtitle}>
                                    Diabetes health chatbot
                                </Text>
                            </View>
                        </View>
                        <View style={styles.onlineDot} />
                    </View>

                    {/* Messages */}
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.messageList}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={scrollToBottom}
                        ListFooterComponent={
                            isLoading ? (
                                <View style={styles.typingIndicator}>
                                    <View style={styles.avatarCircle}>
                                        <Text style={styles.avatarEmoji}>🤖</Text>
                                    </View>
                                    <View style={styles.typingBubble}>
                                        <ActivityIndicator
                                            size="small"
                                            color={colors.primary}
                                        />
                                        <Text style={styles.typingText}>Typing...</Text>
                                    </View>
                                </View>
                            ) : null
                        }
                    />

                    {/* Quick prompts — shown only at start */}
                    {messages.length === 1 && !isLoading && (
                        <View style={styles.quickPromptsWrapper}>
                            <Text style={styles.quickPromptsLabel}>Quick questions</Text>
                            <View style={styles.quickPromptsRow}>
                                {QUICK_PROMPTS.map((prompt) => (
                                    <TouchableOpacity
                                        key={prompt}
                                        style={styles.quickChip}
                                        onPress={() => handleQuickPrompt(prompt)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.quickChipText}>{prompt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Input area */}
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ask about diabetes..."
                            placeholderTextColor={colors.textMuted}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                            returnKeyType="send"
                            onSubmitEditing={() => sendMessage()}
                            blurOnSubmit
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                            ]}
                            onPress={() => sendMessage()}
                            disabled={!inputText.trim() || isLoading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.sendIcon}>➤</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <BottomTabBar activeTab="chat" />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    safeArea: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    container: {
        flex: 1,
        backgroundColor: "#F4F6FA",
    },

    // Header
    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    headerAvatarEmoji: {
        fontSize: 22,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    headerSubtitle: {
        color: "#D0E4FF",
        fontSize: 12,
        marginTop: 1,
    },
    onlineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#4ade80",
        borderWidth: 2,
        borderColor: "#fff",
    },

    // Messages
    messageList: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    bubbleWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 12,
    },
    bubbleWrapperUser: {
        justifyContent: "flex-end",
    },
    bubbleWrapperBot: {
        justifyContent: "flex-start",
    },
    avatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#E9F1FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
        flexShrink: 0,
    },
    avatarEmoji: {
        fontSize: 16,
    },
    bubble: {
        maxWidth: "78%",
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    bubbleBot: {
        backgroundColor: "#FFFFFF",
        borderBottomLeftRadius: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    bubbleUser: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    bubbleText: {
        fontSize: 14,
        lineHeight: 20,
        color: "#111827",
    },
    bubbleTextUser: {
        color: "#FFFFFF",
    },
    timestamp: {
        fontSize: 10,
        color: "#9CA3AF",
        marginTop: 4,
        alignSelf: "flex-end",
    },
    timestampUser: {
        color: "rgba(255,255,255,0.6)",
    },

    // Typing
    typingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        paddingHorizontal: 0,
    },
    typingBubble: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 8,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    typingText: {
        fontSize: 13,
        color: colors.textMuted,
        marginLeft: 6,
    },

    // Quick prompts
    quickPromptsWrapper: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    quickPromptsLabel: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 8,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    quickPromptsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    quickChip: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 4,
    },
    quickChipText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: "500",
    },

    // Input
    inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: 10,
    },
    input: {
        flex: 1,
        minHeight: 44,
        maxHeight: 110,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: "#F9FAFB",
        fontSize: 14,
        color: "#111827",
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    sendButtonDisabled: {
        backgroundColor: "#D1D5DB",
    },
    sendIcon: {
        color: "#FFFFFF",
        fontSize: 16,
        marginLeft: 2,
    },
});
