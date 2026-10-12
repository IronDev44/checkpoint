# Retours des testeurs

Activé en production le 12 octobre 2026 sur `https://checkpoint-eka.pages.dev`. Le stockage KV est lié dans `wrangler.toml` et le secret est installé côté Cloudflare. Le code de la boîte de réception est conservé dans `.feedback-admin-secret.local.txt`, exclu de Git. Un retour de vérification a été envoyé, reçu et classé Résolu.

Dans **Options**, les testeurs disposent de « Faire un retour ». La boîte **Retours des testeurs**, en bas des Options, exige un secret vérifié par le serveur. Le code de l’ancien panneau événements ne donne pas accès aux messages.

## Activation dans Cloudflare Pages

1. Créer un espace de stockage **Workers KV** nommé `checkpoint-feedback`.
2. Dans le projet Pages Checkpoint, ajouter une liaison KV nommée **FEEDBACK_STORE** vers cet espace. Configurer l’environnement Production et, si souhaité, Preview avec un espace distinct pour les essais.
3. Ajouter un **secret** nommé **FEEDBACK_ADMIN_SECRET**, avec une valeur aléatoire d’au moins 20 caractères. Ne pas ajouter cette valeur au code ou aux variables React. C’est le code à saisir dans la boîte de réception.
4. Compiler puis déployer le projet selon le processus habituel. Les nouvelles liaisons nécessitent un nouveau déploiement.

Aucun déploiement ou changement du compte Cloudflare n’est effectué automatiquement par ces fichiers. Sans configuration, le formulaire affiche que la boîte n’est pas encore configurée et conserve le brouillon.

## Vérification après activation

- Envoyer un retour depuis Options sur un appareil de test et vérifier la confirmation.
- Ouvrir la boîte avec le secret, puis vérifier le message, l’onglet, le thème et le navigateur.
- Passer le retour en « En cours », actualiser, puis « Résolu ».
- Verrouiller et essayer un mauvais code : les messages doivent rester inaccessibles.

## Fonctionnement

`POST /api/feedback` enregistre un retour. `GET /api/feedback/admin` liste les messages par pages de 50, les plus récents d’abord. `PATCH /api/feedback/admin` modifie le suivi. Les deux opérations admin exigent `Authorization: Bearer <secret>` et ne sont jamais mises en cache. Le code est conservé uniquement en mémoire dans l’écran courant.

Les messages ne contiennent pas la collection, les notes, le matériel ou les identifiants de connexion. Le nom est facultatif. Le thème, les dimensions de l’écran et le navigateur sont annoncés au testeur avant envoi. L’adresse IP n’est pas stockée dans les retours ; un hachage temporaire, supprimé après une minute, limite les envois rapprochés. Cette limite KV est une protection légère, pas un système anti-spam strict.

Les retours restent dans KV jusqu’à suppression manuelle par le propriétaire. Les filtres portent sur les messages déjà chargés ; utiliser « Charger les retours suivants » pour accéder aux plus anciens.
