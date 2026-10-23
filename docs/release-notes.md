# Nouveautés et guides des nouvelles fonctionnalités

## Parcours

- Une carte « Du nouveau dans Checkpoint » apparaît sous le niveau sur l'accueil
  tant que des notes de mise à jour sont non lues.
- Une notification dans la cloche ouvre les mêmes notes. Son groupe se règle
  dans Options → Notifications → Nouveautés de Checkpoint.
- Options → Nouveautés conserve l'historique, même après lecture.
- La lecture est explicite (« J'ai lu les nouveautés » ou « Marquer comme lu »).
  Fermer la fenêtre ne marque pas les notes comme lues.
- Les notes contiennent les emplacements des fonctions, les corrections et des
  liens vers les guides concernés.

Un joueur qui connaît déjà l'onglet reçoit seulement les étapes des nouvelles
fonctionnalités, à sa première visite après la mise à jour. Un nouveau joueur
reçoit le guide complet actuel, sans second guide en doublon. Fermer ou finir
un guide suffit pour arrêter ses ouvertures automatiques. Les guides restent
consultables dans Options → Aide et tutoriels → Les nouvelles fonctionnalités.
Lire les notes ne consomme pas les guides : les deux progressions sont séparées.

## Ajouter une mise à jour

1. Ajouter une entrée en tête de `src/data/releaseNotes.js` → `RELEASE_NOTES` :
   identifiant stable, date, titre, résumé, changements et corrections. Garder les
   anciennes entrées pour l'historique. Les notes décrivent uniquement ce qui est
   livré dans cette version, sans annoncer une fonction encore indisponible.
2. Pour une nouvelle fonction, ajouter un élément `FEATURE_TUTORIALS` : ID unique,
   `releaseId`, `tab` existant, intitulé et étapes adaptées au besoin. L'ID concerne
   cette découverte précise ; une correction de formulation ne doit pas le
   changer. Une nouvelle fonction sur un onglet déjà connu reçoit un nouvel ID.
3. Compléter aussi le guide général de l'onglet dans `src/data/tabTutorials.js`
   pour les nouveaux joueurs et la relecture complète. Ne pas réinitialiser
   `checkpoint-tab-tutorials-v1` et ne pas déclencher les guides des autres onglets.
4. Tester les notes, un ancien compte, un premier passage et un second passage.

Les notes sont embarquées dans le build : elles deviennent disponibles quand
la nouvelle version de l'app est chargée. Elles ne sont pas déduites des commits
et ne demandent ni connexion réseau supplémentaire ni service de notification.

## Persistance

`checkpoint-release-progress-v1` passe par `accountStorage`, donc l'état est
isolé par compte et conservé sur cet appareil. Il n'est pas synchronisé entre
appareils. Les clés des guides généraux restent compatibles. Un stockage invalide
ou indisponible n'empêche pas de lire les notes ni les guides.

## Vérification

Tests `ReleaseNotes`, `TabTutorials` et `App.searchSorting` : lecture explicite,
notification et historique, guides ciblés, absence de doublon pour un nouveau
joueur, relecture, préservation des guides déjà terminés et clavier dans les
fenêtres superposées. Vérification visuelle sur petit écran et en paysage.
