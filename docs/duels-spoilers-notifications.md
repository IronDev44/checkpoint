# Duel solo, avis avec spoilers et notifications utiles

## Duel « Mon préféré ? »
Accueil → Mon préféré ?. Bloc réorganisable/masquable. Jeux de collection uniquement, terminés ou non ; wishlist exclue. Filtres plateforme, genre, série détectée et coups de cœur. Tournois de 2/4/8 jeux ; si la sélection est trop petite, proposition de la puissance de deux inférieure. Tirage sans remise, liste vérifiable avec remplacements avant le départ. Un gagnant par paire, puis demi-finales/finale : N−1 choix.

Retour au choix précédent pendant la session. Reprise du tournoi enregistrée dans accountStorage sur cet appareil, séparée par compte. Le palmarès complet est conservé localement et synchronisé dans les paramètres privés du compte (`appOptions.duelPalmares`). Les huit anciens gagnants encore enregistrés sont repris à la migration ; les résultats déjà effacés par l’ancienne limite ne peuvent pas être reconstitués. L’historique de retour arrière n’est pas conservé après fermeture de l’onglet navigateur. Les résultats n’affectent ni les notes, ni les favoris, ni l’XP ; un récapitulatif peut être enregistré ou partagé manuellement à la fin. Les instantanés des participants permettent de continuer après le retrait d’une fiche. Les jeux sans jaquette ont un emplacement neutre.

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

Chaque choix est sauvegardé dans accountStorage, séparé par compte, pour reprendre immédiatement hors ligne ; le compte connecté permet aussi la reprise sur un autre appareil. Le tableau ne grossit pas en cours de route. Un instantané minimal (ID, nom, jaquette) conserve les participants même si un jeu est ensuite retiré ou passé en wishlist. Le vainqueur est synchronisé dans le palmarès privé avec le nombre réel de participants et le type collection. La progression du tableau est synchronisée avec le compte connecté, via un document privé distinct et une révision conditionnelle (voir ci-dessous). Annulation des 32 derniers choix pendant la session, sans historique de retour après rechargement. Aucun changement des notes, favoris ou XP.

Tests supplémentaires : tableaux de 2, 3, 5, 6, 7, 9, 17 et 570 jeux, exemptions, N − 1 choix, tous les participants gagnants possibles, résultat non tronqué, reprise après retrait et ajout de jeux, annulation du résultat final.

## L’Arène — onglet dédié
Les tournois et le palmarès s’ouvrent directement dans L’Arène (icône épées, après Recherche dans la navigation). Quatre accès : Grand Tournoi, Duels rapides, Variantes et Palmarès. La sauvegarde existante est reprise avec la même clé et le même compte. L’accueil conserve un raccourci « L’Arène » avec le nombre de choix et de participants restants lorsqu’un tournoi est en cours ; il n’y lance plus de fenêtre de duel. L’ancien identifiant du bloc d’accueil reste `duel` pour préserver les préférences d’affichage et d’ordre.

Onglet sélectionnable au démarrage, mémorisable comme dernier onglet et masquable dans Préférences de contenu. Son introduction et son guide suivent le fonctionnement des autres onglets (premier passage, puis Options → Aide et tutoriels). Un tournoi en cours n’est remplacé par un autre format qu’après confirmation ; consulter le palmarès n’interrompt rien.

### Présentation de L’Arène
Navigation à trois entrées avec pictogrammes, invitation avec éventail des jaquettes connues (sans image de gameplay), compteurs participants/duels/vainqueur et règles repliables. Face-à-face centré avec progression compacte et jaquettes entières en portrait comme en paysage ; écran de victoire avec couronne et palmarès allégé. Couleurs issues du thème sélectionné, pas d’animation continue ajoutée. Le tableau et les sauvegardes gardent le même fonctionnement.

### Jaquettes de L’Arène
Toutes les images de jeu de L’Arène passent par ArenaGameCover : duel, victoire, palmarès et éventail. Aucune image de gameplay générique ne sert de remplacement. En l’absence de jaquette connue, recherche via le résolveur IGDB partagé (ID explicite ou titre exact, puis année/plateformes pour départager les homonymes), avec son cache de requêtes. Recherche limitée aux éléments proches de la zone visible ; une réponse tardive du duel précédent est ignorée. Une image cassée ou une jaquette introuvable donne un emplacement neutre. Les instantanés des nouveaux tournois conservent aussi les métadonnées de recherche pour les jeux retirés de la collection, sans garder leur image de gameplay.

### Palmarès séparés et retrait de jeux
Le Grand Tournoi (`collection`) possède son propre palmarès. Les duels rapides et leurs paliers (`classic`, `champions`, ancien `ultimate`) partagent un second palmarès. Le même jeu peut figurer dans les deux avec des compteurs distincts ; chaque historique est séparé et paginé. Les victoires du Grand Tournoi ne qualifient plus un jeu pour les tournois de champions des duels rapides.

Retirer un jeu demande une confirmation indiquant le nombre de victoires concernées. Seules ses entrées du format choisi sont révoquées ; bibliothèque, notes, autre palmarès et tableau en cours sont conservés. Les révisions des entrées retirées restent synchronisées pour qu’une ancienne copie locale/cloud ne les réintroduise pas. Un résultat final retiré reste visible comme résultat du tournoi terminé, avec une mention précisant qu’il n’est plus dans le palmarès ; il n’est pas recréé au rechargement.


### Reprise entre appareils, sessions et parcours
Dans L’Arène connecté sur le backend D1, `playerProgress/arena` stocke le dernier tableau avec une révision privée. Les nouvelles révisions utilisent une écriture conditionnelle : deux appareils ayant avancé différemment affichent un choix explicite entre leurs progressions. Aucune fusion de choix ni remplacement silencieux. Une version distante propre peut être reprise au montage, au retour dans l’app et toutes les 30 secondes quand L’Arène est visible. Attendre « Tournoi synchronisé » avant de changer d’appareil. Sans connexion réseau, le tableau et les écritures en attente restent dans accountStorage ; reprise à la prochaine ouverture de L’Arène ou au retour du réseau. Le palmarès reste dans les paramètres privés existants. Une erreur de quota ou de taille est signalée, le tableau local est conservé.

« Je ne sais pas choisir » déplace la paire à la fin des duels restants du tour, sans vote ni élimination. Si c’est la dernière paire du tour, une pause est proposée. Les exemptions et les duels déjà joués restent identiques. Une session compte dix choix réels maximum, puis propose de continuer ; la pause peut aussi être prise manuellement. Le compteur et la pause sont propres à cet appareil ; le tableau global reste synchronisé. La finale terminée prend priorité sur une pause.

Le journal du tournoi courant enregistre chaque choix, son tour, le gagnant et le perdant. « Parcours des jeux de ce tournoi » permet de les consulter, y compris pour les jeux retirés de la bibliothèque. Les anciens tournois signalent un parcours partiel : leurs adversaires passés ne sont pas inventés. Démarrer un nouveau tournoi remplace ce journal ; le palmarès des titres reste conservé.

La finale reçoit une présentation distincte. Le résultat affiche le finaliste et offre un PNG avec le vainqueur, le finaliste et le parcours enregistré du gagnant. Génération locale au clic, sans export automatique ni publication dans le fil social. L’image utilise du texte et des formes pour rester exportable sans dépendre de serveurs d’images. La feuille de partage native est utilisée si disponible, sinon téléchargement. Aucun classement de troisième place n’est inventé.


### Variantes thématiques de L’Arène
Cinq variantes : Claque visuelle (graphismes et direction artistique), Monde à explorer, Bande-son, Histoire mémorable et Ambiance. L’écran Variantes prépare une sélection indépendante du tableau courant ; le lancement d’un nouveau tableau demande confirmation si un tournoi est en cours. Les jeux sont vérifiables et décochables, avec recherche sans accents, pagination de 12 et sélection de tous les résultats. Les filtres ne retirent pas implicitement les jeux déjà sélectionnés. Deux participants minimum ; aucune troncature à 2/4/8 pour ces tournois.

Monde à explorer présélectionne uniquement les mentions explicites de monde ouvert dans les métadonnées (ou les booléens dédiés). RPG, aventure, sandbox ou un mot dans le titre ne suffisent pas. Le filtre peut être désactivé pour ajouter manuellement un jeu dont les informations sont incomplètes. Wishlist exclue dans tous les cas ; aucun changement sur les fiches de la bibliothèque.

Le tableau conserve `kind: collection` et un identifiant `variant` validé dans une liste fermée. Cet identifiant accompagne sauvegarde locale, synchronisation privée conditionnelle, choix, retour arrière, pauses, résultat final, export et historique. Un identifiant inconnu ou une variante sur un duel rapide est rejeté, sans reclassement dans le Grand Tournoi. Chaque variante possède son propre groupe de palmarès `variant:<id>` ; un même jeu peut gagner plusieurs catégories. Retirer ses titres d’une catégorie n’affecte pas les autres. Ces victoires ne qualifient pas pour la Couronne des Champions et ne comptent pas comme titres ultimes du tournoi des préférés.

La question thématique reste visible et fait partie de la description accessible de chaque carte. Le résultat et l’image exportée indiquent la catégorie. Le raccourci d’accueil et les conflits entre appareils identifient également la variante. Le guide de L’Arène est mis à jour dans Options → Aide et tutoriels.


### Liens entre éditions et participation dans L’Arène
Avant un nouveau tournoi, « Éditions des jeux » propose des rapprochements fondés sur les identifiants de source, le lien IGDB `versionParent` ou des titres proches après retrait de suffixes d’édition. Il s’agit toujours de suggestions à approuver : un titre identique peut désigner un reboot. Le lien générique `parentGame` n’est pas utilisé, car il peut concerner un DLC. Les IDs numériques de fournisseurs différents ne sont pas confondus. Un sélecteur manuel couvre les éditions avec des noms différents.

Les liens approuvés et la version préférée sont stockés dans `appOptions.editionLinks`, avec un cache local séparé par compte. Une révision par groupe et des entrées révoquées protègent les séparations contre les anciennes copies synchronisées. Relier une nouvelle édition à une famille conserve les membres existants et sa préférence ; aucun enregistrement de bibliothèque, statut, note, favori ou achèvement n’est modifié. Si la version préférée manque parmi les candidats admissibles, une version disponible la représente et l’interface le précise.

Grand Tournoi, duels rapides, variantes et tournois de champions utilisent une seule version admissible de chaque famille approuvée. Dans les modes de champions, la représentation est choisie parmi les versions qualifiées, sans faire disparaître le jeu parce que la préférence n’a pas gagné de titre. Le bouton « Comparer toutes les versions dans le prochain tournoi » désactive ce regroupement pour préparer une comparaison d’éditions ; ce choix de préparation est local à la visite, tandis que les liens sont synchronisés avec le compte. Une recherche dans les variantes ne modifie pas les participants cachés et changer de représentant conserve la sélection de la famille.

Le tableau conserve les IDs réels des participants, leurs instantanés et le mode d’éditions utilisé au lancement. Les tournois déjà lancés, les résultats historiques et les palmarès ne sont pas recalculés. Les anciens tournois contenant plusieurs éditions continuent avec leurs participants d’origine. Les liens sont une relation de préférence, jamais une fusion de données.
