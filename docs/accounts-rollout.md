# Comptes et découverte

Activation le 13 octobre 2026 : comptes par e-mail, pseudo, mot de passe oublié, déconnexion et découverte en quatre étapes avec Passer et reprise depuis Options. Chaque compte démarre avec son espace privé ; les données sont stockées dans D1. Firebase conserve uniquement la connexion pour cette version.

Google n’est pas encore configuré et son bouton est masqué. Les options de personnalisation du profil restent accessibles dans l’application. La découverte est mémorisée par appareil et compte.

L’écran de connexion sépare la récupération du mot de passe et la création de compte. « Rester connecté » est coché par défaut et utilise la persistance locale Firebase. Décoché, il utilise la persistance de session du navigateur. Ce choix est appliqué avant la connexion ou l’inscription et sa préférence est mémorisée sur l’appareil, sans stocker le mot de passe dans l’application.

« Mot de passe oublié » reste accessible quand l’adresse est vide : il ouvre un formulaire dédié qui demande uniquement l’e-mail. L’envoi du lien est une action distincte, avec confirmation et retour à la connexion ; aucun ancien mot de passe n’est demandé.

La langue Firebase Auth est fixée à fr pour les e-mails de récupération et les actions de compte hébergées.

Le nom d’expéditeur du modèle de récupération a été réglé sur Checkpoint et relu via l’API. Le nom dans le texte (%APP_NAME%) dépend du « Nom public » du projet, distinct du nom interne déjà Checkpoint. La modification de l’objet/du corps via l’API renvoie EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED. La console Firebase du navigateur intégré affiche une erreur de chargement des conditions ; le réglage du nom public reste à effectuer via une console accessible. Ne pas déclarer cette partie terminée.

Le compte propriétaire bodyjordan@gmail.com retrouve les 570 jeux, 70 matériels, son profil et ses options fournis dans la sauvegarde. Les données non exportées attendent leur récupération dans Firestore, sans suppression des originaux.

Voir d1-migration.md pour les validations, les limites et la configuration des prochaines publications.
