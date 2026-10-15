# Jaquettes et badges du profil public

Les jeux fondateurs utilisent désormais `FounderGames`, avec une vraie jaquette et un format portrait qui conserve l’image entière. Sur mobile, la jaquette accompagne le titre et la plateforme ; sur ordinateur, les trois choix restent côte à côte.

`gameCovers` réutilise une jaquette déjà connue, puis consulte le proxy IGDB de Checkpoint si un ancien jeu ne contient qu’un fond RAWG. La correspondance exige le même titre ; l’année et la plateforme permettent de distinguer les éditions. Sans précision, la version originale est privilégiée. Les requêtes simultanées sont partagées et les résultats restent en mémoire (un jour pour une jaquette, cinq minutes pour une absence). Une jaquette introuvable ou une image cassée affiche un emplacement neutre, sans reprendre une capture d’écran ni bloquer le profil.

Les nouveaux documents publics conservent les informations de jaquette et de correspondance. Les anciens profils sont corrigés à la lecture, sans migration des collections ni modification d’un profil pendant les essais.

« Marqueurs du profil » est remplacé par « Badges à la une ». La vitrine réutilise `BadgeVisualIcon` et les mêmes classes de rareté et de forme que la collection de badges du profil. Les badges sont des éléments de présentation, sans bouton de sélection dans le profil d’un ami. `publicBadges` restaure les métadonnées manquantes des anciens documents à partir du catalogue et préserve la famille et la plateforme lors des nouvelles publications. Les libellés de rareté sont en français.

Vérification : tests de correspondance exacte, d’édition, de cache, de panne réseau, de changement de jeu pendant une requête, de repli d’image et de sérialisation des badges. Contrôle visuel des vrais composants dans le navigateur à 390 × 844 et 1366 × 1100, avec les jaquettes IGDB de Metal Gear Solid, Def Jam: Fight for NY et Steambot Chronicles. Logos PlayStation, Créateur, sceau 75, Univers personnel et badge PS4 vérifiés. Pas de débordement horizontal ni d’erreur de console observés.
