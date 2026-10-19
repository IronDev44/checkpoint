# Fiches, historique, filtres et comparatif

## Listes depuis une fiche
Dans ta bibliothèque → Mes listes : cocher plusieurs listes existantes ou en créer une avec le jeu déjà inclus. Les références sont comparées comme identifiants, les doublons sont évités, les limites existantes restent appliquées. Les listes sont toujours dans les réglages privés du compte et utilisent la file de sauvegarde existante.

## Historique des parties
La fiche affiche les étapes connues : ajout, début, pause, reprise, abandon, fin, essai ou réinitialisation. Les nouvelles transitions sont enregistrées dans le même document et la même écriture que la progression, y compris pour les modifications en lot. Une répétition du même état ou un changement de note ne crée pas d’étape supplémentaire. Les dates d’ajout et de fin déjà connues sont conservées ; les anciennes étapes sans date ne sont pas inventées. L’historique stocke au plus 200 transitions. Annuler une modification restaure aussi son historique précédent. Il n’est pas inclus dans les copies publiques du jeu.

## Matériel
Rechercher et filtrer mon matériel, sous les filtres Tout / Actuel / Historique / Wishlist : nom, marque, gamme ou génération connue, année d’obtention (y compris non renseignée), statut précis. Les filtres se combinent avec le filtre de collection existant dans la catégorie active. Une nouvelle catégorie remet ces filtres à zéro. Le nombre d’appareils est dédoublonné entre les groupes de collection et de classement. Le catalogue d’ajout a toujours sa recherche séparée ; aucun filtre ne modifie de données.

## Comparatif entre amis
Une règle CSS masquait le comparatif pendant la visite d’un profil ; cette règle autorise maintenant son affichage. Les jeux communs et les différences de notes portent uniquement sur les jeux publics effectivement visibles.

Jouer ensemble propose les filtres Tous les jeux communs, Coopératifs et Plateforme en commun. Les modes connus sont lus sans requête supplémentaire ; le bouton Vérifier les modes de jeu consulte sinon le détail IGDB, sur demande, une requête à la fois. La recherche de secours exige un titre et une année connus, puis un résultat unique correspondant, pour ne pas confondre les éditions. Une information absente ou une erreur reste explicite et peut être vérifiée de nouveau. La vérification ne modifie pas les jeux et ne contacte pas l’ami. Les plateformes sont comparées avec des alias limités (PS5, PlayStation 5, PC, Windows) ; elles ne permettent pas de conclure au cross-play ou au fonctionnement des serveurs. Les modes peuvent varier selon la plateforme et l’édition.

Le proxy IGDB demande maintenant game_modes.name et les champs coop/multijoueur du détail. Source du schéma : https://api-docs.igdb.com/#multiplayer-mode. Les plateformes sont également incluses dans les favoris publics sélectionnés, comme elles l’étaient déjà dans les jeux fondateurs. Les notes privées, listes et historique restent exclus.

## Validation
514 tests réussis dans 78 suites, compilation de production réussie, 13 tests du proxy IGDB et tests SQLite de l’API de comptes réussis. Navigateur local : listes depuis une fiche, début/pause/reprise, conservation après rechargement, filtres de matériel combinés, ouverture d’un profil ami et vérification coop. Portrait 390 × 844 et paysage 844 × 390 sans débordement sur les vues contrôlées. Profils, catalogue coop et données synthétiques ; aucun test sur des comptes de production ni sur un téléphone physique. Aucun commit, push ou déploiement.
