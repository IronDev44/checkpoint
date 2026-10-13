# Transitions sur Android

Quand Chrome signale `prefers-reduced-motion: reduce`, les anciennes règles CSS
masquaient toutes les transitions malgré le bouton « Activée ».

L’option `appOptions.transitionMotion` propose désormais `full` (animations
complètes, par défaut) ou `system` (suivre l’appareil). Elle utilise le même
stockage et la même synchronisation privée que les autres options.

Les portails des transitions complètes portent `.checkpoint-full-tab-motion`.
Les règles de réduction des mouvements excluent uniquement ce sous-arbre.
Les intros, les arrière-plans et les autres éléments restent soumis aux
préférences d’accessibilité. « Désactivée » supprime toujours les transitions.

Validation : 29 tests de routage et de préférence, dont Matrix et le motif
Minecraft en mode complet sous une préférence réduite simulée. Un aperçu CSS
dans le navigateur à 390 × 844 confirme que le mode complet conserve la durée
Aurora de 680 ms ; le mode système masque le motif. Les éléments hors transition
conservent la réduction globale de leur durée. Le téléphone Android physique
n’a pas été testé directement.
