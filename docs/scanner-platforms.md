# Scanner physique et relevés Steam/Xbox

## Scanner

Recherche et Bibliothèque proposent « Scanner un jeu physique ».

1. L'utilisateur active volontairement la caméra, ou saisit un code-barres.
2. ZXing lit les images localement. Seul le code est transmis au serveur.
3. Le serveur authentifié vérifie le GTIN et cherche son titre dans UPCitemdb.
4. La recherche du catalogue propose des jeux. L'utilisateur confirme le titre,
   la plateforme de sa boîte et son édition avant toute écriture.

Un code déjà connu dans la bibliothèque contourne le fournisseur. UPC-A et EAN
avec zéro initial partagent la même clé. En cas de code inconnu, de quota ou de
panne du fournisseur, la recherche manuelle par titre reste disponible. Un produit
mal décrit n'est jamais ajouté automatiquement comme jeu.

La caméra utilise `@zxing/browser`, chargé seulement à son ouverture. Elle est
arrêtée à la détection, à l'arrêt manuel, à la fermeture, au passage en arrière-
plan et si son démarrage finit après une annulation. Le scanner lui-même est
chargé séparément du bundle principal. Le script de préparation retire les seuls
liens de source maps cassés publiés avec la version 0.2.1 ; le code exécuté reste
inchangé et les autres source maps restent disponibles.

La boîte est soit ajoutée avec un nouveau jeu non commencé et non noté, soit
associée explicitement à une fiche existante. Les notes, avis, favoris et statuts
de jeu sont conservés ; seule une wishlist devient collection lorsque sa boîte
est acquise. Une fiche déjà physique n'est jamais remplacée par le scanner.
Les champs `physicalBarcode` et `physicalPlatform` décrivent cette boîte,
séparément des plateformes jouées. Ils sont lisibles dans la fiche du jeu.

### Fournisseur

UPCitemdb est utilisé en offre gratuite sans clé. Le backend borne les appels
externes à 90 par jour et au moins dix secondes entre deux appels, pour respecter
les limites de cette offre. Cette capacité est partagée entre les utilisateurs.
Cache interne D1 : 30 jours pour un résultat, un jour pour un code inconnu.
Les correspondances de codes, les caches et le budget fournisseur ne sont pas
modifiables par les endpoints génériques des comptes.

Sources : [offre et limites](https://www.upcitemdb.com/wp/docs/main/development/plan/),
[schéma des produits](https://www.upcitemdb.com/wp/docs/main/development/responses/),
[lecteur ZXing](https://github.com/zxing-js/browser).

## Relevés de plateformes

Dans la fiche d'un jeu lié, « Activité Steam et Xbox » affiche le dernier relevé
enregistré. L'actualisation prépare un aperçu ; l'utilisateur choisit ensuite
de le sauvegarder ou de garder les anciennes données. Aucun relevé ne modifie
la note, l'avis, le statut Terminé ou la durée de jeu renseignée manuellement.

Steam fournit le temps joué, la dernière activité lorsqu'elle est disponible et
les compteurs de succès. Les détails de jeux doivent être accessibles sur le
profil Steam. Un profil privé n'est pas interprété comme une bibliothèque vide.
Des succès indisponibles ne remettent pas leurs anciennes valeurs à zéro.
Un import de wishlist n'écrase jamais les temps de jeu et succès déjà enregistrés.
Les nouvelles fiches Steam ne copient plus les minutes du fournisseur dans le
champ de durée personnelle. Les anciennes durées ne sont pas réécrites, car on
ne peut pas distinguer avec certitude une valeur importée d'une saisie du joueur.

Xbox conserve la connexion Microsoft existante. L'historique contient les jeux
associés à des succès, pas tous les achats ou tous les titres lancés. Les pages
suivantes peuvent être chargées avant l'import, avec dédoublonnage et contrôle
du même profil Xbox. Le relevé d'un jeu récupère les compteurs de succès et de
Gamerscore quand le service les autorise. Le temps de jeu Xbox n'est pas inventé.

L'endpoint d'actualisation exige le compte Checkpoint, vérifie que la fiche lui
appartient et lit les IDs de plateforme enregistrés côté serveur. Pour Xbox, le
profil de la session doit correspondre à celui lié à cette fiche. Les requêtes
de succès parcourent au plus cinq pages ; une réponse incomplète ne remplace pas
les compteurs existants. Les valeurs inconnues restent distinctes d'un vrai zéro.

Sources : [Steam Owned Games](https://partner.steamgames.com/doc/webapi/IPlayerService),
[Steam succès](https://partner.steamgames.com/doc/webapi/ISteamUserStats),
[Xbox historique](https://learn.microsoft.com/en-us/xbox/gdk/docs/reference/live/rest/uri/titlehistory/uri-titlehistoryusersxuidhistorytitlesgetv2?view=gdk-2604),
[Xbox succès](https://learn.microsoft.com/en-us/gaming/gdk/docs/reference/live/rest/uri/achievements/uri-achievementsusersxuidachievementsgetv2?view=gdk-2510).

## Configuration et déploiement

Pas de nouvelle clé pour le scanner. D1 doit déjà être activé. Les nouvelles
collections de service utilisent la table documents existante, sans migration.
Steam utilise `STEAM_API_KEY` ; Xbox conserve `XBOX_CLIENT_ID`,
`XBOX_CLIENT_SECRET`, `XBOX_COOKIE_SECRET` et son callback existants.

Lecture publique de `/api/xbox/session` le 23 octobre 2026 :
`connected:false, setupRequired:false`. Cela confirme que le serveur ne signale
pas de configuration manquante, pas qu'une connexion réelle a été validée.
Un essai avec les comptes de plateforme du propriétaire reste nécessaire.
PlayStation reste à l'étude ; aucun jeton PSN ni outil non officiel ajouté.

Les nouveautés et guides ciblés sont enregistrés dans le journal de mises à jour.
Le compagnon de reprise est volontairement laissé de côté.

## Vérifications

- `node scripts/test-barcode-api.mjs`
- `node scripts/test-platform-activity.mjs`
- `node scripts/test-account-api.mjs`
- Tests React et services : `PhysicalGameScanner`, `GamePlatformActivity`,
  `barcodes`, `platformActivity`, intégrations `App.searchSorting`.
- Contrôles navigateur avec des données fictives : recherche/confirmation,
  conservation des données existantes, état indisponible, aperçu des relevés,
  décodeur ZXing sur un EAN généré et mise en page portrait/paysage.
- L'accès à la caméra d'un téléphone réel, le catalogue de vraies boîtes et les
  sessions Steam/Xbox réelles ne sont pas certifiés par ces tests locaux.
