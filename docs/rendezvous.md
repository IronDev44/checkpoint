# Les rendez-vous Checkpoint

Les sélections, expéditions et souvenirs se retrouvent dans Accueil → Pour toi → Les rendez-vous Checkpoint. Les choix cachés sont dans Social → Défis. La cloche peut ouvrir directement leur destination ; ses catégories se désactivent dans Options → Notifications. Aucun e-mail ou push n'est envoyé.

## Sélections

- Calendrier partagé client/Worker : `src/services/rendezvousCatalog.js`, copié dans `public/rendezvous-catalog.js` par `prebuild`.
- Première sélection : lundi 19 octobre 2026, à 0 h UTC. Une nouvelle sélection chaque lundi, quatre propositions, un vote par compte ; le vote peut être modifié ou remplacé par une abstention jusqu'à la clôture.
- Le premier lundi du mois suivant ouvre une finale de sept jours. Les semaines appartiennent au mois de leur lundi de départ, y compris celles qui se terminent le mois suivant. Tous les ex æquo avec au moins une voix participent ; pas de gagnant pour une semaine sans vote ; dédoublonnage des finalistes et minimum de deux jeux.
- Les résultats actifs sont masqués jusqu'au vote ou à l'abstention. Ils sont publics aux comptes connectés après clôture. Aucun identifiant de votant n'est transmis.
- Les votes sont stockés dans D1, dans `documents` avec collection interne `selectionVotes`, propriétaire = UID, identifiant = scrutin. Aucun accès générique direct à cette collection. Les comptes et les décomptes ne peuvent pas être définis par le client.
- Le palmarès récent et la consultation par mois n'affectent pas le palmarès personnel de l'Arène.
- Le cycle initial de 16 thèmes est figé. Pour ajouter une nouvelle saison, ajouter un segment daté au calendrier ; ne pas changer rétroactivement les options ou la taille du cycle historique.

## Expéditions et souvenirs

Quatre parcours documentés sont prévus aux dates du 19 octobre, 2 novembre, 16 novembre et 1er décembre 2026. Ils combinent deux repères historiques et un choix de goûts communautaire facultatif. Un souvenir de parcours peut être conservé hors ligne ; aucune récompense XP, thème ou monnaie n'est accordée. Revoir un parcours ne multiplie pas les souvenirs.

Les commentaires rétrospectifs et les parcours terminés sont dans `appOptions.engagement` des réglages privés du compte, avec les sauvegardes existantes. Ils n'entrent pas dans le profil public et ne modifient pas l'avis initial ni la note du jeu. Les anniversaires utilisent uniquement les dates connues (fin, ajout, favori), après au moins un an, avec une fenêtre de sept jours. Le 29 février est commémoré le 28 février les années non bissextiles. On peut parcourir les autres souvenirs datés.

## Choix cachés

Le créateur choisit deux jeux de sa collection, une question prédéfinie, un ami enregistré dont le profil est disponible et son propre choix. Le serveur copie uniquement les titres ; cette transmission est expliquée avant l'envoi. L'ami ne voit pas le choix adverse avant sa propre réponse. Les deux choix sont alors révélés et verrouillés ; chaque participant peut ajouter ou modifier sa propre explication (500 caractères). Un défi expire après sept jours : si une réponse manque, le choix adverse reste caché. Maximum de vingt défis encore en attente par créateur ; historique des cent derniers défis reçus/créés.

Contrat dédié `friendChallenges`, accessible aux deux membres uniquement, sans exposition des UID ni des données de leurs fiches. Révision concurrente protégée par une mise à jour conditionnelle ; création idempotente avec un identifiant conservé lors des reprises.

## Validation et publication

1. `node scripts/sync-server-modules.cjs`
2. `node scripts/test-account-api.mjs`
3. `node scripts/test-rendezvous-api.mjs` (SQLite en mémoire : isolation, votes, clôtures, finales, archives, défis, conflits)
4. Tests React et compilation habituels.

Avant publication, appliquer `migrations/0002_rendezvous_index.sql` à D1 avec la procédure de migrations du projet, puis publier ensemble les fichiers du Worker, les modules publics synchronisés et le frontend. La migration ajoute uniquement un index ; aucun changement des collections existantes. Les votes, les finales et les ouvertures de parcours dépendent des dates et se calculent lors des requêtes : pas de cron ni d'automatisation Codex nécessaire.
