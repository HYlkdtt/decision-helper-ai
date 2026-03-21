import { View, Text, StyleSheet } from "react-native";
import { Recommendation } from "../services/api";

interface Props {
  recommendation: Recommendation;
}

const confidenceColors = {
  high: "#22c55e",
  medium: "#eab308",
  low: "#ef4444",
};

export default function RecommendationCard({ recommendation }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Pros</Text>
      {recommendation.pros.map((pro, i) => (
        <Text key={i} style={styles.proItem}>+ {pro}</Text>
      ))}

      <Text style={styles.sectionTitle}>Cons</Text>
      {recommendation.cons.map((con, i) => (
        <Text key={i} style={styles.conItem}>- {con}</Text>
      ))}

      <Text style={styles.sectionTitle}>Recommendation</Text>
      <Text style={styles.recText}>{recommendation.recommendation}</Text>

      <View style={styles.confidenceRow}>
        <Text style={styles.confidenceLabel}>Confidence:</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: confidenceColors[recommendation.confidence] },
          ]}
        >
          <Text style={styles.badgeText}>{recommendation.confidence}</Text>
        </View>
      </View>

      {recommendation.clarifying_questions &&
        recommendation.clarifying_questions.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Questions for you</Text>
            {recommendation.clarifying_questions.map((q, i) => (
              <Text key={i} style={styles.question}>? {q}</Text>
            ))}
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 14,
    color: "#334155",
    marginTop: 8,
    marginBottom: 4,
  },
  proItem: { color: "#16a34a", fontSize: 13, marginLeft: 8 },
  conItem: { color: "#dc2626", fontSize: 13, marginLeft: 8 },
  recText: { color: "#1e293b", fontSize: 13, lineHeight: 18 },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  confidenceLabel: { fontSize: 13, color: "#64748b", marginRight: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  question: { color: "#7c3aed", fontSize: 13, marginLeft: 8 },
});
