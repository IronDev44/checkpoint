# D1 : état du 13 octobre 2026

La version D1 est publiée sur https://checkpoint-eka.pages.dev (déploiement b61317d2). Firebase Authentication gère les comptes par e-mail et mot de passe. Google reste désactivé tant que son fournisseur OAuth n’est pas configuré.

## Données récupérées

Sauvegarde fournie par le propriétaire : checkpoint-backup-2026-10-12.json. Import D1 : 570 jeux, 70 matériels et 1 document de paramètres privés. Les 641 documents ont été relus depuis D1 et comparés intégralement à la sauvegarde ; les lectures de l’API authentifiée de production ont aussi été comparées. Le profil et les options ont été conservés. Copies privées dans .account-backups, exclues de Git.

La sauvegarde ne contient pas gameCollections, les événements historiques ni toute la progression cloud des épreuves. Ces éléments ne sont pas déclarés migrés. Les originaux Firestore sont conservés ; le quota bloque encore leur lecture administrative. Les anciennes préférences et récompenses locales de l’appareil propriétaire sont copiées une seule fois dans son stockage par compte à sa première connexion.

## Protection

ACCOUNT_DB : checkpoint-accounts (39d1ae1f-8781-4fb4-92e3-16db19671a71), WEUR. Propriétaire : pAcrkmTs1tN8Kfv9C2IdNICKLOi2 (bodyjordan@gmail.com). L’API déduit l’UID du jeton Firebase signé ; le client ne peut pas choisir un autre propriétaire. Les profils publics sont modifiables uniquement par leur titulaire. Les écritures partagées et les outils d’administration sont réservés au propriétaire. Le compte QA temporaire et ses paramètres D1 ont été retirés.

Les anciennes règles Firestore ont été sauvegardées dans .account-backups/firestore-rules-before.json avant déploiement de firestore.rules. Les lectures clientes sont désormais réservées au propriétaire et les écritures clientes sont fermées. Aucune donnée historique supprimée. Les accès administratifs Firebase restent possibles pour une récupération ultérieure.

## Connexion propriétaire

Le compte propriétaire est réservé. Choisir « J’ai déjà un compte », saisir bodyjordan@gmail.com et utiliser « Mot de passe oublié » pour définir soi-même son mot de passe. Le mot de passe temporaire technique n’est ni affiché ni inclus dans Git.

## Vérifications

Compilation réussie. Tests SQLite réels : isolation des comptes, droits administrateur, propriété des profils, transformations et import sans remplacement silencieux. Vérification de jetons RS256 signés, expiration et mauvais projet. Tests des retours et du tutoriel réussis. Inscription d’un compte temporaire, collection vide, tutoriel, passage et reprise vérifiés dans le navigateur. Tutoriel inspecté à 390 × 844 ; aucun test sur iPhone physique.

Les changements se rechargent après une mutation locale ou un retour au premier plan, sans abonnement permanent. Les actualités publiques se rafraîchissent depuis le flux déjà utilisé par l’application, au plus toutes les six heures si disponible. Aucun nouveau plan payant activé.

Configuration par défaut suivie dans src/services/accountConfig.js : comptes actifs, D1 et UID propriétaire. Elle fonctionne aussi lors d’une compilation Cloudflare sans .env.production.local. Les variables REACT_APP_ACCOUNTS_ENABLED=false et REACT_APP_DATA_BACKEND=firestore restent disponibles pour un retour explicite à l’ancien fonctionnement ; ne pas les utiliser lors d’une publication courante. Google reste désactivé par défaut.

Pour terminer la récupération historique : exporter Firestore après rétablissement du quota, importer uniquement les collections/documents absents avec un contrôle de contenu. Ne pas relancer un import initial sur des documents D1 modifiés depuis la bascule.
