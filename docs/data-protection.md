# Données protégées et mode hors ligne

Les fonctions se trouvent dans **Options → Données et sauvegardes**. Le sélecteur **À quoi je joue ?** se trouve sur l’accueil, après la prochaine session.

## Corbeille

Avec le backend D1, supprimer un jeu ou du matériel écrit `_deletedAt` dans la fiche privée, au lieu de retirer la ligne. Les lectures normales excluent ces fiches. La corbeille les présente pendant 30 jours et permet de les récupérer avec leur identifiant et toutes leurs informations. Les fiches expirées restent exclues des listes ; aucun effacement physique automatique n’est effectué par cette version.

La vérification du propriétaire s’applique aux lectures, à la corbeille et aux restaurations. Une suppression rejouée après une réponse réseau perdue reste sans effet supplémentaire. Modifier une fiche supprimée ne la recrée pas implicitement.

## Versions de sauvegarde

IndexedDB conserve, par UID, une copie par jour après le chargement de la collection et les copies effectuées avant les imports, suppressions, modifications groupées, réparations, résolutions de conflit ou restaurations. Les 20 versions les plus récentes sont gardées, avec date et motif. Les sauvegardes comprennent jeux, matériel, options, profil social et amis. Elles ne constituent pas une archive indépendante de la progression du quiz ou des épreuves.

Une restauration demande confirmation, crée d’abord une copie de sécurité, puis remplace les fiches des jeux et du matériel présentes dans la version choisie. Les fiches ajoutées plus récemment et absentes de cette version sont conservées. Elle peut récupérer une fiche supprimée à partir de cette copie. Les préférences et le profil sont également restaurés lorsqu’ils sont présents. L’import JSON utilise ce même chemin pour les fichiers contenant jeux et matériel ; les anciens fichiers de préférences restent compatibles.

Les copies sont locales au navigateur et au compte. Effacer les données du navigateur les efface aussi. L’export JSON existant permet de conserver une copie ailleurs.

## Hors ligne

Le service worker conserve uniquement le code et les fichiers publics de l’application. Il exclut `/api/` et les ressources d’autres domaines. La navigation en ligne actualise la copie du code pour une prochaine ouverture hors ligne. Il faut avoir ouvert l’application en ligne, garder la session connectée et laisser l’installation du service worker se terminer.

Le cache de données et la file de modifications sont en IndexedDB, partitionnés par UID. Les lectures affichent le cache, recouvert des modifications en attente. L’ajout, la modification et le retrait de jeux ou de matériel peuvent ainsi survivre au rechargement. La reconnexion réseau, le retour dans l’application ou le bouton de synchronisation relancent l’envoi. Recherche externe, social, corbeille, nouveaux accès au compte et opérations sur d’autres collections nécessitent le réseau.

Les modifications sont envoyées dans l’ordre. Une vérification des champs de départ détecte les conflits avec un autre appareil, tout en conservant ses changements sur les autres champs. Les confirmations perdues peuvent être rejouées. Les conflits restent sur l’appareil jusqu’au choix explicite : garder la version en ligne ou réappliquer les changements locaux à une version fraîchement lue. Une sauvegarde précède ce choix. Une autre connexion ne rejoue jamais la file du compte précédent.

La désactivation du stockage des modifications hors ligne est bloquée tant que la file contient des éléments. Si le stockage local est indisponible, les lectures en ligne restent possibles, mais les sauvegardes et la conservation hors ligne ne sont pas garanties ; l’interface signale le problème.

## Vérifications

- `node scripts/test-account-api.mjs` : isolation, permissions, corbeille, expiration, restauration, conflits et rejouabilité.
- `node scripts/test-offline-shell.cjs` : cache des ressources publiques, exclusion de l’API privée, rechargement hors ligne et actualisation du code.
- Tests Jest : `d1Data.offline`, `deviceStore`, `DataProtection`, `SessionPicker`, `SaveFeedback`, ainsi que les intégrations existantes de recherche et de profil.
- Prévisualisation locale avec API D1 en SQLite mémoire et compte fictif : récupération d’une fiche, création de copie, suggestion de jeu et favori conservé après coupure, rechargement, reprise réseau et nouveau rechargement. Contrôle des dimensions mobile et paysage sans débordement horizontal.

## Consolidation du 19 octobre 2026
La file durable inclut désormais `playerPrivateSettings` en plus des fiches. Les réglages se synchronisent champ par champ, avec détection des conflits. Les champs de date technique ne créent pas de conflits artificiels. La corbeille reste limitée aux jeux et au matériel. Les sauvegardes, le duel solo, les photos de setup et les notifications masquées restent locaux à cet appareil, selon les fonctionnalités déjà documentées. Voir `consolidation-audit.md` pour les scénarios vérifiés.
