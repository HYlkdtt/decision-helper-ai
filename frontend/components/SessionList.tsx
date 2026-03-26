import { View, Text, Pressable, StyleSheet } from "react-native";
import { SessionOut } from "../services/api";

interface Props {
  sessions: SessionOut[];
  onSelect: (session: SessionOut) => void;
  onDelete: (sessionId: string) => void;
}

export default function SessionList({ sessions, onSelect, onDelete }: Props) {
  if (sessions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No past decisions</Text>
        <Text style={styles.emptyHint}>
          Your decision history will appear here after you start a conversation.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {sessions.map((session) => (
        <Pressable
          key={session.id}
          style={styles.card}
          onPress={() => onSelect(session)}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {session.title}
            </Text>
            <Text style={styles.cardDate}>
              {new Date(session.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <Pressable
            style={styles.deleteBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              onDelete(session.id);
            }}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#334155", textAlign: "center" },
  emptyHint: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#1e293b" },
  cardDate: { fontSize: 12, color: "#94a3b8", marginTop: 4 },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    marginLeft: 8,
  },
  deleteText: { color: "#ef4444", fontSize: 13, fontWeight: "500" },
});
