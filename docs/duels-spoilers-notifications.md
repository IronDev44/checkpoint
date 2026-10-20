# Duel solo, avis avec spoilers et notifications utiles

## Duel « Mon préféré ? »
Accueil → Mon préféré ?. Bloc réorganisable/masquable. Jeux de collection uniquement, terminés ou non ; wishlist exclue. Filtres plateforme, genre, série détectée et coups de cœur. Tournois de 2/4/8 jeux ; si la sélection est trop petite, proposition de la puissance de deux inférieure. Tirage sans remise, liste vérifiable avec remplacements avant le départ. Un gagnant par paire, puis demi-finales/finale : N−1 choix.

Retour au choix précédent pendant la session. Reprise du tournoi enregistrée dans accountStorage sur cet appareil, séparée par compte. Le palmarès complet est conservé localement et synchronisé dans les paramètres privés du compte (`appOptions.duelPalmares`). Les huit anciens gagnants encore enregistrés sont repris à la migration ; les résultats déjà effacés par l’ancienne limite ne peuvent pas être reconstitués. L’historique de retour arrière n’est pas conservé après fermeture de l’onglet navigateur. Les résultats n’affectent ni les notes, ni les favoris, ni l’XP ; aucun partage social du duel dans cette version. Une fiche supprimée rend la reprise invalide et une nouvelle sélection est proposée. Les jeux sans jaquette utilisent une initiale.

## Avis protégés
Éditeur de la fiche de jeu : sélectionner un passage puis « Masquer la sélection » ajoute les marqueurs texte `[spoiler]...[/spoiler]`. Option pour protéger l’avis entier. Aperçu avant sauvegarde. Avis, protection globale et choix de partage sont enregistrés ensemble via persistPatch.

Le texte masqué n’est pas rendu dans le DOM avant un clic sur Révéler le spoiler ; il peut être remasqué. Interprétation texte uniquement, sans HTML. Les marqueurs imbriqués ou non refermés restent cachés. Les extraits publics conservent la protection même à la limite de longueur. Utilisé dans le fil Social, l’activité du profil public et le fil des amis. Les extraits simples de l’accueil ne révèlent pas de contenu balisé.

Le choix « Afficher cet avis dans mon activité publique » permet de publier l’extrait lorsque le profil et l’activité sont visibles. Les avis des anciens jeux notés ne sont pas nouvellement publiés automatiquement. Pour compatibilité, les anciens avis non notés qui apparaissaient déjà dans l’activité gardent ce comportement jusqu’au choix explicite de l’utilisateur. Les nouvelles entrées ont un partage désactivé par défaut. Le masquage évite les spoilers dans l’interface ; les extraits publiés restent téléchargeables par un lecteur autorisé.

## Notifications
Cloche existante : invitation à un sondage tant que le joueur n’a pas voté ; résultat d’un sondage terminé pour son créateur et ses participants ; bilan du mois précédent si une activité datée existe. Ouvrir une invitation/résultat arrive directement dans Social → Sondages et cible la carte. Un bilan ouvre le mois exact dans une fenêtre, même si le bloc de l’accueil est masqué.

Options → Notifications : sondages, bilan, jeux sans note, sorties/wishlist, progression, disponibilité des sources. Préférences enregistrées avec les options privées existantes. Notifications masquées enregistrées par compte sur l’appareil (clé v2 sans reprise de l’ancienne clé globale). Aucune notification système, e-mail ou permission de navigateur.

Lectures de sondages au démarrage connecté, au retour sur l’appli et toutes les cinq minutes lorsqu’elle est visible, avec limitation des rafraîchissements et délai réseau de 15 secondes. Actualisation après une modification de sondage dans cette fenêtre. Les erreurs de lecture n’empêchent pas d’utiliser la collection. Les anciens résultats de plus de 30 jours ne créent plus de rappel. La cloche conserve au maximum 20 cartes visibles.

## Validation
Tests des brackets, sélection, reprise locale, annulation, absence d’écriture sur les jeux, spoilers incomplets/imbriqués/extraits, révélation et préférences. Tests d’intégration du véritable éditeur et des liens depuis la cloche vers sondage et bilan. Vérification navigateur local sur les composants réels avec données synthétiques en 390 × 844 et 844 × 390. Aucun test physique iPhone/Android ni déploiement.


## La Couronne des Champions
Le palmarès garde chaque victoire (ID stable du tournoi, jeu gagnant, date, nombre de participants et type du tournoi). Un même jeu peut compter plusieurs titres, mais n’occupe qu’une seule place dans la liste des champions. Dès quatre gagnants différents encore disponibles dans la collection, l’interface propose la Couronne : 4 participants, ou 8 à partir de huit champions. La sélection est vérifiable avant le départ et limitée aux gagnants. Les couronnes sont distinguées des victoires classiques.

L’historique n’est plus tronqué à huit résultats ; il s’affiche par pages de douze. Une fiche retirée de la collection conserve son souvenir dans le palmarès, mais ne peut plus participer. Un retour avant la validation finale annule la victoire concernée via une révision privée ; les anciennes copies synchronisées ne la réactivent pas. Un tournoi en cours n’est remplacé qu’après confirmation dans le panneau.

Tests : progression 2/4/8, reprise privée, migration historique et paramètres tardifs, absence de doublons, victoire/annulation/nouveau choix, candidatures disponibles et titres multiples. Vérification navigateur portrait et paysage sur données synthétiques.

## Le Trône Ultime
Troisième palier, réservé aux vainqueurs de la Couronne des Champions encore en collection. Quatre jeux différents ouvrent le tournoi ; huit permettent un tableau de huit. Les victoires répétées du même jeu ne créent pas de places supplémentaires. Élimination directe jusqu’à un seul vainqueur : 3 ou 7 choix. Les titres ultimes sont comptés séparément des couronnes, et le dernier vainqueur ultime figure dans le palmarès. Tous les tournois précédents restent conservés ; un nouveau tournoi ne retire pas les anciens titres. Même sauvegarde privée, reprise locale, annulation et fusion des révisions que les autres paliers.

## Le Grand Tournoi de toute la collection
Mode principal accessible sans gagner de tournoi au préalable. Le tableau inclut tous les IDs distincts de la collection au lancement (terminés ou non), sans wishlist et sans troncature à une puissance de deux. Pour N jeux, qualifications entre 2 × (N − puissance de deux inférieure) jeux et exemptions aléatoires pour les autres, puis élimination directe : exactement N − 1 choix, un seul vainqueur ultime. Chaque participant peut remporter le tournoi. Les tournois rapides et leurs paliers restent accessibles.

Chaque choix est sauvegardé dans accountStorage, séparé par compte, pour reprendre sur le même appareil. Le tableau ne grossit pas en cours de route. Un instantané minimal (ID, nom, jaquette) conserve les participants même si un jeu est ensuite retiré ou passé en wishlist. Le vainqueur est synchronisé dans le palmarès privé avec le nombre réel de participants et le type collection. La progression du tableau reste locale ; elle ne reprend pas sur un autre appareil. Annulation des 32 derniers choix pendant la session, sans historique de retour après rechargement. Aucun changement des notes, favoris ou XP.

Tests supplémentaires : tableaux de 2, 3, 5, 6, 7, 9, 17 et 570 jeux, exemptions, N − 1 choix, tous les participants gagnants possibles, résultat non tronqué, reprise après retrait et ajout de jeux, annulation du résultat final.

## L’Arène — onglet dédié
Les tournois et le palmarès s’ouvrent directement dans L’Arène (icône épées, après Recherche dans la navigation). Trois accès : Grand Tournoi, Duels rapides et Palmarès. La sauvegarde existante est reprise avec la même clé et le même compte. L’accueil conserve un raccourci « L’Arène » avec le nombre de choix et de participants restants lorsqu’un tournoi est en cours ; il n’y lance plus de fenêtre de duel. L’ancien identifiant du bloc d’accueil reste `duel` pour préserver les préférences d’affichage et d’ordre.

Onglet sélectionnable au démarrage, mémorisable comme dernier onglet et masquable dans Préférences de contenu. Son introduction et son guide suivent le fonctionnement des autres onglets (premier passage, puis Options → Aide et tutoriels). Un tournoi en cours n’est remplacé par un autre format qu’après confirmation ; consulter le palmarès n’interrompt rien.

### Présentation de L’Arène
Navigation à trois entrées avec pictogrammes, invitation avec éventail des jaquettes connues (sans image de gameplay), compteurs participants/duels/vainqueur et règles repliables. Face-à-face centré avec progression compacte et jaquettes entières en portrait comme en paysage ; écran de victoire avec couronne et palmarès allégé. Couleurs issues du thème sélectionné, pas d’animation continue ajoutée. Le tableau et les sauvegardes gardent le même fonctionnement.
