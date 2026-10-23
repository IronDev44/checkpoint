# Passage de témoin et pronostics

Ces fonctionnalités complètent les rendez-vous. Aucun événement réel n'est
inventé ni publié automatiquement. Elles sont livrées localement avec les
changements de `docs/rendezvous.md` ; la mise en production reste à effectuer.

## Emplacements

- Social → Recommandations : reçues, à découvrir, envoyées, archivées.
- Accueil → Pour toi → Les rendez-vous → Pronostics.
- Options → Accès développeur → Pronostics : propriétaire uniquement,
  après le déverrouillage habituel de l'espace développeur.
- Options → Notifications : recommandations désactivables séparément ; les
  pronostics suivent le réglage des rendez-vous.

## Recommandations

Le serveur vérifie que l'expéditeur a cet ami enregistré, que le profil est
disponible et que le jeu appartient à sa collection (hors wishlist/corbeille).
Seuls le titre et le message sont copiés, jamais les notes ou avis privés.
Limite de dix envois par compte sur 24 heures. Un identifiant stable rend les
reprises réseau idempotentes. Chaque membre peut archiver/restaurer de son côté.
Le destinataire peut conserver la recommandation et envoyer/modifier un retour.
Conserver ne crée pas de fiche dans sa bibliothèque. Un lien ouvre la Recherche
pour retrouver le bon jeu et choisir son édition avant un éventuel ajout.

Collections internes : `gameRecommendations` (partagées entre deux membres).
Le point d'entrée dédié renvoie les 200 derniers échanges du compte, sans UID.
Les autres comptes n'ont accès ni aux messages ni aux retours.

## Pronostics

Le propriétaire crée une question, un événement, 2 à 6 options distinctes, une
date future et une source HTTPS. La question devient fixe après publication.
Une voix par compte, modifiable avant la date de clôture contrôlée par le
serveur. Les réponses collectives sont cachées jusqu'à la clôture ; le choix
personnel reste visible. Aucune récompense, argent ou modification des notes.

Après clôture, le propriétaire indique la bonne réponse et sa source. Le verdict
est définitif ; si la question ne peut pas être tranchée, il peut l'annuler avant
le verdict. Les archives conservent le choix personnel et le résultat (100
derniers pronostics). Les totaux agrégés ne dévoilent pas les identités.

Collections internes : `gamingPredictions` et `predictionVotes`.
Les votes passent par une écriture conditionnelle vérifiant l'état de la
question dans la même instruction. Les outils d'administration vérifient
`ACCOUNT_OWNER_UID` côté serveur, indépendamment du mot de passe d'interface.

## Mise en production

Construire avec `npm run build`, publier l'ensemble de `build` avec le worker,
et appliquer l'index décrit dans `docs/rendezvous.md` s'il manque encore.
Aucune nouvelle migration de données. Ne pas créer de pronostic de démonstration
en production : attendre un événement réel et sa source officielle.

## Vérifications

- `node scripts/test-social-moments-api.mjs`
- `node scripts/test-rendezvous-api.mjs`
- `node scripts/test-account-api.mjs`
- Tests React `SocialMoments`, `useCommunityResource`, `Rendezvous`,
  `useRendezvousUpdates`, `SocialHub`, `DeveloperTools`.
- Parcours navigateur local avec deux comptes fictifs ; aucune recommandation
  ou notification envoyée à de vrais utilisateurs.
