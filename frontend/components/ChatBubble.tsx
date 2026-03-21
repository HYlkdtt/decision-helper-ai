import { View, Text, StyleSheet } from "react-native";
import { Recommendation } from "../services/api";
import RecommendationCard from "./RecommendationCard";

interface Props {
  role: "user" | "assistant";
  text: string;
  recommendation?: Recommendation | null;
}

export default function ChatBubble({ role, text, recommendation }: Props) {
  const isUser = role === "user";
  const displayText = isUser
    ? text
    : text.replace(/```json[\s\S]*?```/, "").trim();

  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.assistantRow]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text style={isUser ? styles.userText : styles.assistantText}>
          {displayText}
        </Text>
        {recommendation && <RecommendationCard recommendation={recommendation} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginVertical: 4, paddingHorizontal: 12 },
  userRow: { alignItems: "flex-end" },
  assistantRow: { alignItems: "flex-start" },
  bubble: { maxWidth: "85%", borderRadius: 16, padding: 12 },
  userBubble: { backgroundColor: "#3b82f6" },
  assistantBubble: { backgroundColor: "#f1f5f9" },
  userText: { color: "#fff", fontSize: 15 },
  assistantText: { color: "#1e293b", fontSize: 15, lineHeight: 22 },
});
