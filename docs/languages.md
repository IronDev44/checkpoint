# Langues de l’interface

Checkpoint propose le français, l’anglais, l’espagnol, l’allemand, l’italien et le portugais. Avant la première inscription ou connexion, un écran propose la langue du navigateur parmi les langues prises en charge, puis demande une confirmation. Le choix est conservé localement et peut être changé dans Options. Il est également synchronisé avec les réglages privés du compte ; un choix explicite effectué avant la connexion prend priorité sur la préférence du compte.

## Fonctionnement

- `src/i18n/language.js` fournit le magasin de langue et charge uniquement le catalogue demandé. Aucun service de traduction n’est appelé pendant l’utilisation.
- `LocalizedMessage` utilise des paramètres `{{0}}`, `{{1}}` pour conserver les valeurs et les éléments React sans injection de HTML.
- `LocalizedElement` traduit les attributs d’interface et permet de protéger les noms provenant du catalogue ou des utilisateurs.
- Les identifiants des onglets, les statuts enregistrés et les données métier restent inchangés. Les dates et nombres utilisent la locale sélectionnée lorsque leur affichage passe par les formateurs adaptés.
- Les catalogues JSON sont des traductions préparées en amont, avec une révision de la terminologie des parcours principaux. Une relecture linguistique complète reste utile avant une communication internationale.

## Périmètre

La traduction concerne l’interface, les formulaires, les tutoriels et les messages. Les noms de jeux, les pseudos, les contributions des utilisateurs et les descriptions fournies par les sources restent dans leur langue d’origine. Les documents juridiques restent en français et les liens l’indiquent. Certains contenus exportés (images de partage et textes dessinés dans un canvas) restent en français.

## Ajouter ou corriger une traduction

Ajouter le message français et ses traductions dans les six fichiers `src/i18n/locales/*.json`, en conservant les mêmes paramètres. Utiliser un message complet plutôt que des fragments de phrase. Protéger explicitement les noms et données variables. Le script `scripts/review-locales.cjs` applique les corrections de vocabulaire partagées. `scripts/localize-interface.cjs` est un outil de migration initiale ; il ne remplace pas la revue des modifications.

## Vérifications

Les tests `src/i18n/*.test.*` vérifient la complétude des catalogues, les paramètres, le choix initial, la persistance, les erreurs de stockage, les changements simultanés et la conservation des champs saisis. `src/App.language.test.jsx` vérifie les identifiants de navigation et la conservation d’un nom de jeu identique à un libellé d’interface. Le retour à une fiche conserve son onglet grâce à un identifiant stable, indépendant de la traduction.
