# Bilan mensuel et sondages entre amis

## Accès
- Accueil → Ton bilan du mois → Voir mon bilan. Bloc déplaçable/masquable dans la personnalisation de l’accueil.
- Social → Sondages. Choisir 2 à 4 jeux de sa bibliothèque et 1 à 50 amis disposant d’un profil public.

## Sondages
Contrat dédié `collection=friendPolls` dans le Worker existant, sans nouvelle table D1. Les sondages sont stockés dans `documents`, avec l’audience résolue côté serveur depuis les amis sauvegardés et leurs profils publics. Les titres sont relus dans la bibliothèque du créateur ; aucune fiche privée complète n’est partagée.

Seuls le créateur et les comptes invités peuvent lire. Un vote par UID, modifiable, clôture à 7 jours contrôlée côté serveur. Le créateur peut clore plus tôt et supprimer après confirmation dans l’interface. Les UID des invités/votants ne sont jamais renvoyés au client. Les résultats sont agrégés ; le créateur ne vote pas. Les écritures utilisent une comparaison atomique de la version stockée : un conflit demande une actualisation, sans écraser un autre vote. La création garde le même identifiant lors d’une reprise réseau pour éviter les doublons. Maximum 100 sondages conservés par créateur ; la liste expose les 50 plus récents accessibles. Pas de notification externe automatique. Connexion Internet requise.

## Bilan
Calcul local depuis les fiches courantes. Mois courant + 11 précédents, et mois plus anciens contenant des dates connues. Les ajouts comprennent les imports et les passages de wishlist vers la collection. Les terminaisons et favoris nécessitent leurs dates spécifiques ; ne jamais déduire une fin de jeu d’un updatedAt/createdAt. Les actions à venir sont datées via persistPatch et les changements de progression en lot. Les anciennes fins de jeu sans date restent exclues et signalées. Ce bilan reflète les fiches actuelles : une suppression/reprise ou un retrait des favoris peut donc changer un ancien mois ; ce n’est pas un journal immuable.

Export PNG 1080 × 1350 créé sur l’appareil avec aperçu, téléchargement et partage natif si disponible (téléchargement sinon). Aucun envoi automatique ni publication dans la vitrine.

## Vérification
Tests React de sélection explicite, création, changement de vote en erreur et ouverture du bilan ; tests des dates, formats Firestore, bornes de mois et datage/annulation. Le script `node scripts/test-account-api.mjs` vérifie sur SQLite la confidentialité entre comptes, les droits, les choix et la fermeture. Contrôle navigateur local des vraies interfaces en 390 × 844 et 844 × 390 ; export PNG téléchargé et inspecté. Pas de test physique iPhone/Android ni déploiement dans cette tâche.
