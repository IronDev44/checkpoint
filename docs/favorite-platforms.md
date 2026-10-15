# Plateformes favorites du profil

Dans Social → Mon profil → Identité et partage, la saisie libre est remplacée par une liste native regroupée par constructeur. Choisir une entrée l'ajoute aux favoris ; la croix d'une pastille la retire. Plusieurs plateformes peuvent être sélectionnées, sans doublon. Les favoris sont aussi visibles dans le profil personnel et la vitrine publique.

La valeur reste une chaîne `socialProfile.platform`, séparée par des virgules. Les sauvegardes, la synchronisation privée D1, la publication et les liens des anciens profils gardent leur format. Les anciennes saisies sont relues, certains raccourcis sont reconnus (PS5, Switch…) et les noms personnalisés sont conservés. La valeur par défaut « Multi-plateforme » représente une absence de choix. Aucune réécriture n'est effectuée avant une action de l'utilisateur.

Les choix sont dans `src/services/favoritePlatforms.js`. Les tests couvrent l'ajout multiple, les doublons, le retrait jusqu'à zéro, la compatibilité des anciennes saisies et l'affichage partagé.
