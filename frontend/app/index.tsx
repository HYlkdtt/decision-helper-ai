import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Recommendation,
  sendDecision,
  getSessionMessages,
  getToken,
} from "../services/api";
import ChatBubble from "../components/ChatBubble";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  recommendation?: Recommendation | null;
}

export default function HomeScreen() {
  const { sessionId: paramSessionId } = useLocalSearchParams<{
    sessionId?: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (paramSessionId && paramSessionId !== sessionId) {
      loadSession(paramSessionId);
    }
  }, [paramSessionId]);

  const loadSession = async (sid: string) => {
    if (!getToken()) return;
    setLoadingHistory(true);
    try {
      const msgs = await getSessionMessages(sid);
      const mapped: Message[] = msgs.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        text: m.content,
        recommendation: m.recommendation_json,
      }));
      setMessages(mapped);
      setSessionId(sid);
    } catch {
      // fail silently
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendDecision(
        text,
        undefined,
        undefined,
        sessionId ?? undefined
      );
      setSessionId(response.session_id);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: response.message,
        recommendation: response.recommendation,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Something went wrong. Make sure the backend is running.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Decision Helper</Text>
            <Text style={styles.subtitle}>AI-powered decision making</Text>
          </View>
          {messages.length > 0 && (
            <Pressable style={styles.newChatBtn} onPress={handleNewChat}>
              <Text style={styles.newChatText}>New Chat</Text>
            </Pressable>
          )}
        </View>
      </View>

      {loadingHistory ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            What decision do you need help with?
          </Text>
          <Text style={styles.emptyHint}>
            Describe your situation and I'll analyze the pros, cons, and give
            you a recommendation.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble
              role={item.role}
              text={item.text}
              recommendation={item.recommendation}
            />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text style={styles.loadingHint}>Analyzing your decision...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Describe your decision..."
            placeholderTextColor="#94a3b8"
            multiline
            maxLength={2000}
            onSubmitEditing={handleSend}
          />
          <Pressable
            style={[
              styles.sendBtn,
              (!input.trim() || loading) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  newChatBtn: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  newChatText: { color: "#3b82f6", fontWeight: "600", fontSize: 13 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
  emptyHint: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  messagesList: { paddingVertical: 12 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  loadingText: { marginTop: 12, color: "#64748b", fontSize: 14 },
  loadingHint: { marginLeft: 8, color: "#64748b", fontSize: 13 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: "#0f172a",
  },
  sendBtn: {
    backgroundColor: "#3b82f6",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginLeft: 8,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
