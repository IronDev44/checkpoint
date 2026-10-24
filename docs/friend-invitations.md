# Invitations d’amis

Social → Amis propose les invitations reçues (Accepter, Refuser) et envoyées (Annuler). L’ajout depuis un profil public envoie aussi une invitation. Un compteur dans la navigation sociale signale les demandes reçues. Le tutoriel Social et les nouveautés expliquent le fonctionnement.

Une seule relation par paire de comptes est stockée côté D1 dans `documents`, collection interne `friendships`. L’identifiant est le SHA-256 des deux UID triés ; les UID ne sont pas exposés dans la réponse. L’API authentifiée `/api/account-data?collection=friendships` propose GET et POST (`send`, `accept`, `decline`, `cancel`, `remove`). Les clients ne peuvent pas écrire directement cette collection avec l’API générique.

Seul le destinataire peut accepter/refuser, seul l’expéditeur peut annuler, seuls les deux participants peuvent retirer une relation acceptée. Les invitations croisées restent en attente : elles ne valent pas acceptation. Une modification compare la version précédente pour éviter l’écrasement d’une réponse simultanée. Une réponse retentée est idempotente. Les refus sont comptés par expéditeur : 24 heures après le premier, sept jours après le deuxième, aucune nouvelle relance après le troisième. Une annulation impose une heure avant un nouvel envoi. La liste est limitée à 50 invitations en attente et les créations à vingt destinataires par jour. Une acceptation explicite remet les refus à zéro.

L’envoi nécessite deux profils partagés (publics ou réservés aux amis), en tenant compte des réglages privés faisant autorité sur la visibilité. Seules l’identité publique du joueur, la direction et le statut de la relation sont renvoyés aux participants. Aucun jeu ni contenu privé n’est partagé par cette API.

L’acceptation est réciproque dans l’enregistrement serveur. Chaque appareil actualise sa liste à l’ouverture, au retour dans l’application et toutes les 60 secondes lorsqu’elle est visible ; un bouton permet d’actualiser immédiatement. Les amis antérieurs sont conservés sans nouvelle validation. Les nouvelles invitations ne rejoignent la liste d’amis qu’après acceptation ; les relations annulées/refusées/retirées n’y apparaissent pas. Le suivi serveur est conservé pour synchroniser une suppression entre appareils. Les erreurs conservent les demandes et permettent de réessayer.

Pas de nouvelle migration ni de service externe. Le frontend et les fichiers Worker de `public/` doivent être publiés ensemble. Aucun push, déploiement ou envoi à de vrais joueurs n’est effectué pendant les tests.

Validation : `node scripts/test-friendships-api.mjs`, tests React `FriendRequests`, `useFriendships`, `friendships`, ainsi que les régressions SocialHub, tutoriels, comptes, sondages, recommandations et retours testeurs. Les tests utilisent des comptes fictifs.
