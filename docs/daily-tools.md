# Outils du quotidien

## Accueil

« Personnaliser l’accueil » masque et réorganise les blocs avec des commandes monter/descendre utilisables au clavier et sur écran tactile. Le niveau et les premiers pas restent en tête. Le choix `appOptions.homeLayout` est normalisé, sauvegardé dans les préférences du compte et inclus dans les sauvegardes. Les identifiants inconnus ou dupliqués sont ignorés ; les futurs blocs s’ajoutent en fin de liste. Rétablir l’accueil par défaut ne touche pas aux jeux.

## Actions rapides

Le bouton ••• des cartes Compact et Complet ouvre une petite fenêtre : passer en cours, terminer ou noter. Les actions utilisent les mêmes mutations que la fiche complète, avec les retours d’enregistrement et la cohérence entre statut et progression. Les clics dans cette fenêtre ne déclenchent pas l’ouverture de la carte en arrière-plan. L’étagère 3D conserve son comportement d’ouverture de la fiche.

## Imports Steam et Xbox

Les imports de bibliothèque et de wishlist Steam, ainsi que les titres Xbox, passent par un aperçu avec sélection, recherche et filtres. L’aperçu, les compteurs et l’exécution utilisent `planGameImport`.

Les identifiants de boutique font foi. Deux identifiants différents avec le même titre restent deux jeux distincts. Les doublons de l’import et les rapprochements ambigus entre plusieurs fiches ne sont pas importés. Une correspondance fondée sur le titre seul est décochée par défaut et doit être sélectionnée explicitement. Les caractères non latins restent pris en charge. Le plan utilise des index de noms et d’identifiants, afin de ne pas normaliser toute la bibliothèque pour chaque ligne entrante.

La validation recontrôle les fiches présentes et crée une sauvegarde avant les écritures. Les synchronisations préservent notes, avis, statut personnel, progression et favoris. Un changement de compte interrompt la boucle. L’import JSON de sauvegarde reste un parcours de restauration distinct dans Données et sauvegardes.

## Comparaison avec un ami

La comparaison exploite uniquement les sélections que le profil public expose déjà. Elle indique le nombre de jeux visibles, les jeux possédés en commun, les notes proches et les différences de notes. Les jeux présents uniquement dans la wishlist sont signalés comme tels dans les suggestions, sans compter comme jeux possédés en commun. Les boutons ouvrent la fiche personnelle ou recherchent le titre dans le catalogue. Aucun score global de compatibilité n’est inféré.

L’appariement utilise un identifiant de catalogue partagé, ou le nom et l’année disponibles. Les identifiants privés des documents de deux comptes ne sont jamais comparés. Les métadonnées de catalogue et l’année accompagnent désormais les jeux déjà partagés parmi les favoris et les tops.

## Recherche dans mon espace

Un bouton sous le logo ouvre une recherche locale parmi les jeux, le matériel, les séries détectées et les amis enregistrés du compte. La recherche ignore la casse et les accents, propose des catégories et ouvre directement le résultat choisi. Le catalogue externe n’est sollicité que par le bouton prévu à cet effet ; l’ouverture d’une fiche peut ensuite effectuer ses chargements habituels. Ouvrir le profil public d’un ami nécessite Internet.

## Vérification

`DailyTools.test.jsx` couvre les réglages d’accueil, la sélection des imports, leurs identifiants contradictoires, les titres non latins, les actions rapides, la recherche et les filtres de comparaison. Les intégrations `App.searchSorting.test.jsx` vérifient la persistance de l’accueil, les ouvertures directes, la progression rapide et la conservation des données personnelles durant un import Steam. Les tests des tutoriels, thèmes, social et stockage hors ligne accompagnent ces contrôles.

## Accueil consolidé
Les activités sont regroupées dans « Pour toi » par défaut. Seule l’activité ouverte est montée. Le choix `homeLayout.groupActivities=false` restaure les blocs séparés et leur ordre personnalisé. Les réglages d’accueil suivent désormais la file durable des préférences privées.
