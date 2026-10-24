# Retours des testeurs

Dans Options, les testeurs gardent « Faire un retour ». La boîte de réception est regroupée dans **Accès développeur → Retours**, visible uniquement pour le compte propriétaire.

## Un seul verrou dans l’interface

Le code 1102 ouvre l’espace développeur (tests, lives et retours). Il reste en mémoire pour cette ouverture uniquement. « Verrouiller », fermer le groupe ou quitter les Options détruit les outils montés et demande à nouveau le code. Les rubriques déjà visitées gardent leurs formulaires lors d’un simple changement de rubrique.

Ce code est un verrou d’interface pour le propriétaire connecté. Il ne donne aucun accès à l’API et ne remplace pas l’authentification du compte.

## Accès serveur

La nouvelle version utilise `Authorization: Bearer <Firebase ID token>` pour GET, PATCH et DELETE `/api/feedback/admin`. La signature du jeton est vérifiée avec le même vérificateur que les données de compte, puis son UID doit correspondre à `ACCOUNT_OWNER_UID`. Absence ou jeton invalide : 401 ; autre compte ou propriétaire non configuré : 403. Aucun secret de boîte de réception n’est envoyé depuis React. L’ancien `FEEDBACK_ADMIN_SECRET` n’est plus utilisé par ce code.

Configuration nécessaire : liaison KV `FEEDBACK_STORE` et variable serveur `ACCOUNT_OWNER_UID`. La migration nécessite de publier le frontend et son Worker ensemble. Les retours KV existants sont conservés, sans migration de stockage.

POST `/api/feedback` garde son fonctionnement pour les testeurs. Le message, l’onglet, le thème et le navigateur permettent de reproduire les soucis ; le prénom/pseudo est facultatif. Aucun identifiant de connexion, collection ou matériel n’est stocké avec le retour. Les accès admin ne sont jamais mis en cache.

La liste affiche 50 retours par page avec suivi Nouveau, En cours ou Résolu. Les filtres portent sur les messages chargés. Le déverrouillage de l’espace ne charge pas les retours avant la première ouverture de la rubrique ; verrouiller annule la requête en cours et vide les données de l’écran.

## Vérification locale

`node scripts/test-feedback-api.mjs` vérifie le dépôt d’un retour, la pagination de base et le suivi, le rejet des visiteurs, codes simples et autres comptes, et l’accès du propriétaire vérifié. Les tests React couvrent le verrou unique, la conservation des brouillons entre rubriques, la boîte sans code secondaire et la séparation propriétaire/joueurs.

Chaque retour propose « Supprimer ce retour », suivi d’une confirmation ou d’une annulation. DELETE sur la route admin supprime le retour du stockage KV après vérification du compte propriétaire. En cas d’erreur, le retour reste affiché et la suppression peut être retentée.
