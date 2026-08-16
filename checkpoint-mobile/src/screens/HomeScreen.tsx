import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { StatCard } from "../components/StatCard";
import { useDashboardSnapshot } from "../hooks/useDashboardSnapshot";
import { colors, radius, spacing } from "../theme/theme";

export function HomeScreen() {
  const { data, loading, error } = useDashboardSnapshot();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Checkpoint mobile</Text>
        <Text style={styles.title}>Base native prête</Text>
        <Text style={styles.lead}>
          Cette version Expo est séparée de l’app web. Elle lit déjà les données
          principales et servira de terrain propre pour migrer écran par écran.
        </Text>
      </View>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.stateText}>Connexion à Firestore...</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>{error}</Text>
          <Text style={styles.stateHint}>
            L’app reste utilisable, le branchement sera renforcé pendant la
            migration.
          </Text>
        </View>
      ) : null}

      {data ? (
        <>
          <View style={styles.statsRow}>
            <StatCard label="Jeux" value={data.totalGames} />
            <StatCard label="Terminés" value={data.completedGames} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="En cours" value={data.activeGames} />
            <StatCard
              label="Note moy."
              value={data.averageRating ? `${data.averageRating}/10` : "-"}
            />
          </View>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Données reprises</Text>
            <Text style={styles.panelText}>
              {data.hardwareCount} matériels actuels détectés. Les jeux récents
              seront branchés sur les vraies vues une fois les écrans migrés.
            </Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    padding: spacing.lg,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    marginTop: spacing.sm,
  },
  lead: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  stateCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  stateText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  stateHint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  panel: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  panelText: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
});
