# Transitions sur Android

Quand Chrome signale `prefers-reduced-motion: reduce`, les anciennes règles CSS
masquaient toutes les transitions malgré le bouton « Activée ».

Les options proposent désormais Complète, Réduite et Désactivée.
`appOptions.transitionMotion` conserve `full` (par défaut) ou `light` ;
`uiMode === "reduced"` reste le réglage existant qui désactive la transition.
L’ancien choix `system` est converti en `light`. Le stockage et la
synchronisation privée des options restent utilisés.

Complète conserve exactement les effets choisis auparavant. Réduite utilise
les variantes `calm` des thèmes et retire les filtres et les ombres dans le
portail de transition uniquement. Matrix crée 24 colonnes au lieu de 64.
Les deux modes animés peuvent fonctionner même si Android réduit les animations.

Les portails des transitions complètes portent `.checkpoint-full-tab-motion`.
Les règles de réduction des mouvements excluent uniquement ce sous-arbre.
Les intros, les arrière-plans et les autres éléments restent soumis aux
préférences d’accessibilité. « Désactivée » supprime toujours les transitions.

Validation : 31 tests de sélection, de routage et de préférence, dont Matrix et le motif
Minecraft en mode complet sous une préférence réduite simulée. Un aperçu CSS
dans le navigateur à 390 × 844 confirme que le mode complet conserve la durée
Aurora de 680 ms ; le mode système masque le motif. Les éléments hors transition
conservent la réduction globale de leur durée. Le téléphone Android physique
n’a pas été testé directement.
