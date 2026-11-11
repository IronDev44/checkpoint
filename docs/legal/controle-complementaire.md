> Mise à jour : la publication des corrections prêtes est effectuée. Le cadre parental, l’effacement complet et les droits des ressources restent ouverts. Voir exploitation.md ; les mentions d’attente ci-dessous décrivent l’état antérieur.

# Contrôles complémentaires : images, mineurs et effacement

11 novembre 2026. Contrôles locaux et sources publiques. Aucun changement supplémentaire de production dans cette passe. La publication de la version préparée précédemment reste en attente de l’accord explicite demandé après le refus du contrôle automatique.

## Droits des photos : un cas désormais documenté

La section 3 des [conditions du site PlayStation](https://www.playstation.com/en-us/legal/website-terms-of-use/) encadre la modification et la republication des contenus et ne donne pas une autorisation générale pour les intégrer à un autre site ou une base de données. Dix-huit fiches du manifeste d’éditions pointent vers des pages PlayStation. Il faut examiner une autorisation distincte ou un remplacement ; un crédit Sony et la gratuité de Checkpoint ne suffisent pas à établir cette permission.

L’inventaire `inventaire-droits-photos.csv` comporte désormais une colonne des conditions examinées et une suite à donner pour ces fiches. Il contient 603 fiches illustrées d’éditions et 23 références Tritton. L’absence de champ de licence reste un manque documentaire, pas une preuve juridique d’infraction.

Les pages Consolevariations ont répondu en 403 à l’outil de consultation, et les pages RAWG API n’ont pas pu être récupérées intégralement. Aucun contournement ni autorisation implicite n’a été supposé. Les permissions des autres fabricants et des contributeurs restent non établies. Les conditions de jeux, de streaming ou de capture d’écran ne sont pas automatiquement des licences sur les photos de matériel.

## Social : contrôles techniques réussis

Les scripts suivants passent sur des bases SQLite isolées avec des identités fictives :

- `node scripts/test-profile-search.mjs` : recherche authentifiée, identité minimale des profils privés, visibilité amis et blocages.
- `node scripts/test-social-safety-api.mjs` : amis confirmés, réglages de contact, blocages et accès à la collection partagée.
- `node scripts/test-social-community-api.mjs` : révocation d’accès, masquage d’amis, confidentialité des signalements et droits du propriétaire.

Ces tests valident les règles actuelles. Ils ne constituent pas une validation du volet mineurs :

- `public/profile-search.js` peut renvoyer le pseudo et le nom de profil d’un compte privé ; sa photo et son contenu restent protégés. Ce comportement avait été choisi pour la recherche des joueurs.
- `public/social-access.js` active par défaut les invitations, recommandations, défis et réactions. Les trois dernières fonctions exigent des amis confirmés ; les invitations ne sont pas restreintes de la même façon.
- Aucun statut enfant/parent vérifié ni règle spécifique aux interactions adulte-enfant n’est présent dans les contrôles examinés.

Il faut donc préserver les protections existantes tout en ajoutant un cadre enfant distinct, sans déclarer les règles actuelles adaptées aux moins de 15 ans.

## Parcours mineurs à construire avant de le déclarer opérationnel

Les recommandations [4](https://www.cnil.fr/fr/recommandation-4-rechercher-le-consentement-dun-parent-pour-les-mineurs-de-moins-de-15-ans) et [7](https://www.cnil.fr/fr/recommandation-7-verifier-lage-de-lenfant-et-laccord-des-parents-dans-le-respect-de-sa-vie-privee) de la CNIL distinguent l’accord conjoint sur les traitements facultatifs et les limites des mécanismes de vérification. Une adresse e-mail vérifiée ne prouve pas à elle seule l’autorité parentale. Le choix du mécanisme doit être proportionné, sans collecte d’identité excessive.

Spécification proposée, non encore implémentée ni juridiquement validée :

1. Définir précisément les âges accueillis et la capacité à souscrire au service ; ne pas déduire une base contractuelle valable de la seule inscription d’un enfant.
2. Déterminer une méthode proportionnée pour distinguer les situations et vérifier le parent lorsque nécessaire. Ne pas enregistrer une date de naissance complète, une pièce d’identité ou une image du visage par défaut.
3. Séparer les fonctions nécessaires à la collection des partages facultatifs. Pour un enfant, prévoir un état privé, non découvrable et sans contact non sollicité tant que les autorisations requises ne sont pas établies.
4. Associer les accords de l’enfant et du parent aux finalités concernées, à une version d’information et à une date. Prévoir refus et retrait sans transformer un accord en autorisation générale.
5. Faire respecter ces états côté serveur, y compris depuis un ancien client ; distinguer les interactions adultes/enfants et les comptes dont la situation n’est pas établie.
6. Fournir des explications adaptées à l’âge, un signalement facilement accessible et des modalités d’exercice des droits. Tester les demandes contradictoires, le retrait, le changement de parent, les invitations en cours et les liens publics déjà partagés.

Le lecteur YouTube à activation volontaire et la pause de statistiques préparée ne règlent pas à eux seuls le parcours parental. La protection des mineurs et le périmètre DSA doivent être examinés sur le service réel avant activation de ce parcours.

## Effacement : vérification des copies et outil de repérage

Le code confirme des données au-delà des lignes `owner=UID` : profils partagés, membres et votes des défis, réactions détenues par un autre joueur, listes d’amis par pseudo et index de recherche. Une suppression limitée aux lignes propres au compte laisse des références.

Un outil **strictement en lecture seule** a été ajouté : `scripts/audit-erasure-references.cjs`. Sur un export préparé par un administrateur, il repère les documents du compte et certaines références exactes à son UID ou à ses pseudos, y compris les clés d’objets de votes. Il ne se connecte à aucun service et ne supprime aucune donnée.

Format d’entrée privé :

```json
{"uid":"UID_DU_COMPTE","handles":["ancien-pseudo"],"documents":[{"owner":"UID_DU_COMPTE","collection":"games","id":"fiche","data":{"name":"Exemple"}}]}
```

Ne pas exporter par défaut toute la base de production. Commande à exécuter seulement sur un export autorisé et limité, conservé hors Git :

```text
node scripts/audit-erasure-references.cjs .account-backups/export-prive.json
```

L’outil n’inclut pas les contenus des messages dans son résultat, mais les identifiants et chemins peuvent rester des données personnelles : conserver également le résultat hors Git. Une correspondance n’autorise pas à effacer arbitrairement le document d’un autre joueur. Les mentions en texte libre, photos et anciens pseudos inconnus nécessitent encore un examen manuel.

Le test `node scripts/test-erasure-audit.cjs` démontre, sur sept documents fictifs, que supprimer les deux documents propres laisse quatre documents référents. Il vérifie la détection des votes par UID, des références chez un ami et des pseudos, sans modifier l’export ni inclure arbitrairement le jeu sans lien d’un autre joueur.

`src/services/deviceStore.js` conserve aussi jusqu’à 20 versions de sauvegarde par compte sur l’appareil, en plus des caches et des écritures en attente de `d1Data.js`. Aucun effacement coordonné complet du stockage d’un compte n’est présent dans ce module. Il faut les prendre en compte, avec les préférences `localStorage`, KV, les messages d’assistance et les sauvegardes fournisseurs. Les données restent séparées par UID ; cela ne signifie pas qu’elles sont effacées.

Une recette complète doit encore prouver : fermeture des accès, gestion des jetons déjà délivrés, arrêt des écritures hors ligne, effacement D1 et index, traitement des références sociales, suppression Authentication, nettoyage local lorsque possible et réapplication des effacements après restauration. Aucun compte de production n’a été utilisé pour cette recette.

## Conservation : écarts précis

- Corbeille : 30 jours de restauration ne déclenchent pas une purge physique générale dans le code examiné.
- Retours KV : le quota anti-spam expire au bout de 60 secondes, mais le message de retour n’a pas de TTL général. Les deux ne doivent pas être confondus.
- Signalements sociaux : statuts et dates sont conservés ; aucune purge générale des dossiers clos n’a été trouvée.
- Sauvegardes locales : limite de 20 versions, sans durée absolue d’expiration constatée.

La [CNIL](https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees) exige de déterminer la conservation selon la finalité. Il faut fixer une politique par catégorie et l’exécuter, avec des exceptions documentées pour les litiges, plutôt qu’annoncer une purge qui n’existe pas. Aucune durée arbitraire n’a été publiée comme une obligation légale pendant cet audit.

## Étapes de résolution

1. Déployer les corrections déjà préparées après l’autorisation explicite demandée.
2. Faire examiner et arrêter le cadre d’accueil des enfants, puis implémenter les contrôles et leur recette.
3. Construire l’effacement complet avec une recette isolée avant de le présenter comme automatique.
4. Appliquer les durées décidées aux corbeilles, retours, signalements et copies.
5. Obtenir ou documenter les droits des visuels ; remplacer ceux dont la republication ne peut pas être justifiée. Les demandes d’autorisation éventuelles doivent être adressées séparément, avec l’accord du créateur.

## Périmètre restant

Le flux d’actualité de `public/account-api.js` importe aussi titres, résumés et vignettes de JeuxVideo.com via rss2json. Ces contenus, les images de matériel hors manifeste et les jaquettes distantes ne sont pas juridiquement validés par l’examen des seules photos d’éditions. Les conditions et les droits des sources correspondantes restent à documenter.
