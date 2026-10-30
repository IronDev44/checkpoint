# Consolidation du social

## Recherche

L’API initialise automatiquement les tables `social_directory*` dans D1. Aucun changement manuel des comptes n’est nécessaire. Elles contiennent les identités et des fragments de recherche normalisés, sans photos, biographies ou bibliothèques.

Des déclencheurs SQL placent les profils modifiés ou supprimés dans une file durable. Chaque recherche traite jusqu’à 50 entrées ; tant que la file n’est pas vide, la recherche précédente sert de repli pour éviter de masquer un compte pendant la préparation. Une fois prête, la recherche utilise la clé indexée des fragments plutôt que de charger toutes les identités. La visibilité et les blocages sont toujours contrôlés avant de retourner un profil.

Options → Accès développeur → Fiabilité du social indique les profils indexés et les mises à jour en attente. « Préparer l’index de recherche » traite jusqu’à vingt lots par clic. Il reste utilisable si le nombre de comptes nécessite plusieurs passages.

## Historique et synchronisation

Les recommandations utilisent des pages de 50 échanges et un curseur date + identifiant. Les rubriques sont filtrées côté serveur, notamment À découvrir, afin que les anciens échanges conservés ne soient pas cachés derrière les récents. Les pages déjà ouvertes sont rechargées après une modification, sans revenir automatiquement à la première page. Une ouverture depuis une notification garde le parcours de sélection automatique de la bonne rubrique.

Les invitations sont actualisées toutes les 30 secondes au premier plan, au retour sur l’application et après une action. Les autres onglets du même navigateur sont avertis sans transmettre de contenu. Un conflit entre appareils recharge l’état serveur tout en conservant une explication visible.

## Protection et suivi

Les compteurs atomiques portent sur une fenêtre glissante : 30 recherches/minute, 20 invitations/24 h, 10 recommandations/24 h, 20 défis/24 h et 10 sondages/24 h. Les contrôles existants restent actifs, dont les 50 invitations en attente. Une opération déjà enregistrée avec le même identifiant reste idempotente.

Le suivi conserve uniquement la fonction, le code technique, l’origine appareil/serveur, un compteur et la date du dernier incident. Aucun contenu libre, identifiant de compte, pseudo, adresse IP ou jeton n’est stocké dans les diagnostics. Les incidents sont regroupés par jour et supprimés après 30 jours lors d’une nouvelle remontée ; les plus anciens sont toujours exclus de l’affichage. Les signalements réseau sont limités par appareil et par compte, et restent au mieux de la connexion disponible.

Seul le compte propriétaire authentifié peut consulter les diagnostics ou préparer l’index. Le code de l’espace développeur est un verrou d’interface supplémentaire.

Validation : `node scripts/test-social-reliability.mjs`, tests sociaux existants, tests React des invitations, recommandations, outils développeur et compilation.

Références D1 : [SQL et déclencheurs](https://developers.cloudflare.com/d1/sql-api/sql-statements/), [fonctions JSON](https://developers.cloudflare.com/d1/sql-api/query-json/).
