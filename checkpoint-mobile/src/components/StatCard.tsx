import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme/theme";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 104,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    justifyContent: "center",
  },
  value: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
});
