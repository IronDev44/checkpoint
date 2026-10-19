# Coups de cœur argumentés et À redécouvrir

## Une phrase sur un coup de cœur
Éditeur dans la fiche d’un jeu favori et Social → Profil public → Ma vitrine. Une phrase de 160 caractères maximum, sauvegarde explicite. Le choix « Afficher cette phrase dans ma vitrine » est désactivé par défaut. Enregistrer ne modifie pas la note ou le statut du jeu. Les champs `favoriteReason`, `favoriteReasonShared`, `favoriteReasonUpdatedAt` sont privés sur la fiche, synchronisés par persistPatch (avec la file hors ligne existante).

Le profil public ne reçoit la phrase que si son partage est activé et que le jeu est toujours favori et hors wishlist. Jusqu’à trois favoris publics sont exportés ; les phrases publiques passent en premier, les plus récemment enregistrées d’abord. L’aperçu local et le profil publié utilisent la même sélection. Affichage sous « Ses coups de cœur, avec ses mots », dépendant de la rubrique Vitrine (`publicSections.essential`). Une phrase peut être effacée ou rendue privée ; retirer le favori la retire de la sélection publique. Les avis personnels ne sont pas copiés dans ce champ. Les marqueurs de spoilers sont protégés par le composant existant.

## À redécouvrir
Bloc de l’accueil masquable et réorganisable. Conditions : jeu de collection terminé, noté au moins 8/10 ou favori ; exclusion wishlist et parties en cours. Une date de fin connue doit remonter à 180 jours minimum (environ six mois). Les dates de création/mise à jour ne servent jamais à inventer une fin de partie. Les jeux sans date de fin peuvent être proposés avec « Date de fin non renseignée », après les propositions datées.

« Garder pour rejouer » épingle jusqu’à trois jeux dans ce bloc, avec `rediscoverPinned` sur la fiche privée. Les épingles sont conservées quand on fait tourner les autres propositions. Les anciennes épingles manuelles peuvent rester même si la note baisse ou la date ne répond plus au délai ; elles disparaissent de ce bloc si le jeu est repris en cours, supprimé ou mis en wishlist. Aucun changement automatique du statut, de la note, de la wishlist ou du journal de progression. Les fiches peuvent être ouvertes depuis les cartes. Affichage élargi paginé pour parcourir tous les jeux admissibles.

## Vérifications
Tests de confidentialité des phrases privées, ordre des phrases publiques, limites de texte, critères des propositions, dates inconnues, rotation et épingles. Tests de saisie/erreur/reprise, cartes et limite de trois jeux. Tests d’intégration dans l’éditeur réel et l’accueil réel. Aperçus navigateur avec données synthétiques en portrait et paysage ; pas de test physique iPhone/Android et pas de déploiement.
