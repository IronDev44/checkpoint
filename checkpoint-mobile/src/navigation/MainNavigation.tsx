import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HomeScreen } from "../screens/HomeScreen";
import { PlaceholderScreen } from "../screens/PlaceholderScreen";
import { colors, radius, spacing } from "../theme/theme";
import type { RootTab } from "../types/checkpoint";

const tabs: Array<{ id: RootTab; label: string }> = [
  { id: "home", label: "Accueil" },
  { id: "library", label: "Bibliothèque" },
  { id: "social", label: "Social" },
  { id: "top", label: "Top" },
  { id: "profile", label: "Profil" },
];

export function MainNavigation() {
  const [activeTab, setActiveTab] = useState<RootTab>("home");

  const screen = useMemo(() => {
    if (activeTab === "home") return <HomeScreen />;
    if (activeTab === "library") {
      return (
        <PlaceholderScreen
          title="Bibliothèque"
          description="Migration prévue après stabilisation des modèles jeux, notes, wishlist et collection physique."
        />
      );
    }
    if (activeTab === "social") {
      return (
        <PlaceholderScreen
          title="Social"
          description="Le fil, le profil public et le Sanctuaire seront repris avec des composants natifs séparés."
        />
      );
    }
    if (activeTab === "top") {
      return (
        <PlaceholderScreen
          title="Top 5"
          description="Les classements seront branchés sur les mêmes notes que la version web, sans dupliquer la logique."
        />
      );
    }
    return (
      <PlaceholderScreen
        title="Profil"
        description="Badges, rangs, XP et analyse de joueur seront migrés progressivement depuis les règles existantes."
      />
    );
  }, [activeTab]);

  return (
    <View style={styles.root}>
      <View style={styles.screen}>{screen}</View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tab, active && styles.activeTab]}
            >
              <Text style={[styles.tabText, active && styles.activeTabText]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
  },
  tabBar: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    minHeight: 76,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(12, 20, 38, 0.96)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: 58,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  activeTabText: {
    color: "#06101d",
  },
});
