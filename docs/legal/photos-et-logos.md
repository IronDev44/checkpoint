# Photos et logos : vérification approfondie du 11 novembre 2026

Rapport interne, établi à partir du dépôt et des politiques officielles consultées. Il documente les preuves disponibles et leurs limites ; il ne certifie ni une conformité globale ni une interdiction de chaque fichier. Aucun visuel de l’application n’a été remplacé ou supprimé pendant cet audit. Aucun ayant droit n’a été contacté.

## Résultat de l’inventaire

Le [CSV complet](inventaire-visuels-complet.csv) et sa [version JSON](inventaire-visuels-complet.json) couvrent **1 810 fichiers sous `public/images`, dont 74 fichiers de marques**. Chaque entrée comporte son chemin, son empreinte SHA-256, les références statiques détectées et, lorsqu’elles sont connues, ses sources et les politiques examinées.

- 862 fichiers ont une provenance retrouvée dans les catalogues de photos examinés. Une provenance ne constitue pas une licence.
- 300 fichiers ont été rapprochés d’une politique examinée. Ce nombre ne signifie pas « 300 fichiers interdits » : certaines politiques ne couvrent justement pas le type de visuel concerné.
- Les 1 510 autres fichiers restent sans droits documentés par cette méthode. Ils ne sont pas pour autant déclarés contrefaisants.
- 604 fichiers n’ont pas de référence littérale détectée. Un usage dynamique reste possible : aucune suppression automatique ne doit en découler.
- 53 chemins littéraux ne correspondent pas à un fichier local. Certains proviennent de chemins de sites tiers ou de mécanismes de repli ; ce n’est pas un constat de 53 images cassées en production.
- Deux groupes contiennent des fichiers strictement identiques. Le script n’a signalé aucune erreur d’analyse des sources.

L’inventaire est régénérable avec `node scripts/audit-visual-assets.cjs`. Il ne couvre pas exhaustivement les images distantes, les photos des utilisateurs, les éléments SVG dessinés dans le code, les supports Instagram ou les droits des bases de données.

## Ce que signifie « peut-on l’utiliser ? »

Il faut séparer la marque, la création graphique et la photographie. Le droit français admet certains usages loyaux d’une marque pour identifier les produits de son titulaire. Cette règle ne constitue pas une licence générale de reproduction des photographies ou de tous les dessins de logos. La qualification dépend de l’usage réel, des droits en cause et du territoire. [Code de la propriété intellectuelle, article L713-6](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000039381590/).

Télécharger une image depuis le fabricant, citer son nom, détourer la photo, enlever son fond ou maintenir l’application gratuite ne suffit pas à établir une autorisation. Un kit presse doit lui aussi être lu : sa destination peut être limitée à la presse, à un programme ou à certains supports.

Les politiques ci-dessous expriment les permissions et restrictions publiées par les titulaires ; leur rattachement à un fichier local ne prouve pas la chaîne de provenance. Une autorisation séparée ou une exception applicable peut modifier l’analyse.

## Ressources à examiner en priorité

Les nombres portent sur les fichiers locaux rapprochés automatiquement des politiques, pas sur des interdictions juridiquement établies. Tous les chemins concernés se trouvent dans le CSV, sous l’identifiant indiqué.

| Groupe / identifiant CSV | Fichiers | Constat et suite proposée |
| --- | ---: | --- |
| PlayStation / `playstation` | 37 | Sources de photos et `public/images/brands/sony.png`. La permission générale du site ne couvre pas la republication dans un autre service. Rechercher un accord applicable ou une autre provenance autorisée. `sony-corporate.png` est distinct et n’est pas automatiquement régi par ces conditions. [Conditions PlayStation, §3](https://www.playstation.com/en-us/legal/website-terms-of-use/). |
| Apple / `apple` | 3 | Dont `public/images/brands/apple.png`. Les consignes distinguent les noms, le logo graphique et les photos Apple. Établir séparément les droits de chaque fichier ; à défaut, préparer un nom en texte ordinaire et des images dont les droits sont établis. [Consignes Apple](https://www.apple.com/legal/intellectual-property/guidelinesfor3rdparties.html). |
| Microsoft, photos / `microsoft-photos` | 12 | Les permissions de certains visuels de boîtes ne constituent pas une permission générale pour les photos de consoles et accessoires. Vérifier le type exact et la source. [Permissions Microsoft](https://www.microsoft.com/en-us/legal/intellectualproperty/copyright/permissions). |
| Xbox, logo / `xbox-logo` | 1 | `public/images/brands/xbox.png`. Le programme fansite est conditionnel et limité ; l’absence de paiement ne prouve pas que Checkpoint y entre. Vérifier le contexte et les conditions, ou utiliser le nom en texte. [Programme Xbox](https://www.xbox.com/en-AU/legal/fansiteguidelines), [marques Microsoft](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks). |
| Logitech / `logitech` | 3 | Dont `public/images/brands/logitech.png`. Les conditions examinées n’accordent pas une permission générale de republication ; confirmer également leur portée sur les sources Logitech G. [Conditions Logitech](https://www.logitech.com/en-us/tos/terms?id=6286.html). |
| Razer / `razer` | 3 | Dont `public/images/brands/razer.png`. La référence au nom du produit et l’usage du logo ou des créations visuelles suivent des règles distinctes. Documenter les permissions ou préparer les remplacements. [Consignes Razer](https://www.razer.com/legal/trademark-use-guidelines). |
| Corsair / SCUF / `corsair` | 2 | `public/images/brands/corsair.png` et `scuf.png`. Les conditions couvrent notamment l’intégration de contenus dans une application ; l’usage personnel prévu n’équivaut pas à la republication. [Conditions Corsair, §8](https://www.corsair.com/us/en/s/terms-of-use). |
| Valve / `valve-logo` | 1 | **Inspection visuelle : `public/images/brands/steam.png` contient le mot-symbole Valve, pas Steam.** Corriger cette confusion et établir les droits. Les consignes partenaires Steam ne régularisent pas ce fichier Valve. [Conditions Valve](https://www.valvesoftware.com/en/legal), [consignes Steam](https://partner.steamgames.com/doc/marketing/branding). |
| Nintendo / `nintendo-captures` | 238 | Dont le logo Nintendo. Le document consulté traite des captures et vidéos de jeux, pas d’une licence générale de photos matérielles ou de logos. Aucune autorisation pour ces fichiers ne doit être déduite de ce document. [Consignes Nintendo](https://www.nintendo.co.jp/networkservice_guideline/en/index.html). |

Les politiques et leurs limites sont structurées dans [politiques-visuels.json](politiques-visuels.json). L’examen n’a pas établi les droits des autres marques : elles restent à traiter, sans conclusion automatique de licéité ou d’illicéité.

## Le thème Checkpoint 2077 est un dossier séparé

Le [dossier technique](../checkpoint-2077.md) documente une police annoncée pour un usage personnel et des tracés P/K provenant d’une référence officielle. Cette provenance ne suffit pas à autoriser leur intégration publique. Les règles de fan content encadrent les utilisations dans d’autres produits ; elles ne permettent pas de présumer que ce thème applicatif est couvert. [Règles CD PROJEKT RED](https://www.cdprojektred.com/en/fan-content).

Recommandation : obtenir une autorisation qui couvre cet usage, ou créer une identité cyberpunk propre à Checkpoint, avec un lettrage original et une police dont la licence couvre l’intégration web. Aucun changement du thème n’a été effectué pendant l’audit.

## Jaquettes, photos externes et contenus sociaux

Les jaquettes/captures provenant de RAWG ou IGDB, les images d’actualités et les photos venant de Consolevariations nécessitent un examen de leurs conditions et de celles des ayants droit. **Un accès API ou un crédit n’établit pas à lui seul tous les droits sur les images.** Le précédent [inventaire des photos d’éditions](inventaire-droits-photos.csv) contient les sources retrouvées, mais pas de preuve de permission pour chaque entrée.

Une éventuelle autorisation pour le catalogue de l’application ne doit pas être étendue sans examen aux publicités, posts Instagram, montages, exportations et partages. Les images choisies par les utilisateurs demandent aussi un dispositif de signalement et de traitement des demandes ; les CGU ne remplacent pas les droits de la personne qui téléverse.

## Ce qui peut servir de base aux remplacements

Les icônes génériques Lucide utilisées sous leur licence et la police Orbitron accompagnée de son OFL constituent des ressources documentées pour leurs propres créations. Conserver les mentions de licence applicables, y compris celles des éléments dérivés de Feather. Cela n’autorise pas les marques tierces représentées ailleurs. [Licence Lucide](https://lucide.dev/license), fichier `public/fonts/Orbitron-OFL.txt`.

Pour des photos de matériel : photographies personnelles avec examen des éléments représentés, accord écrit de l’auteur et des titulaires pertinents, ou ressource sous licence adaptée avec attribution et preuve archivées. Pour un logo non régularisé : privilégier le nom de marque en texte ordinaire et une icône générique indépendante, sans suggérer un partenariat.

## Plan de régularisation

1. Pour chaque fichier retenu, conserver l’original, l’URL, l’auteur, la licence ou l’accord, sa date, les supports autorisés, les transformations permises et l’attribution requise. Relier cette preuve à l’empreinte du fichier livré.
2. Traiter d’abord le thème 2077, la confusion Valve/Steam et les groupes dont les conditions examinées ne couvrent pas l’intégration prévue. Pour les autres, compléter les preuves sans les déclarer autorisés par défaut.
3. Préparer les remplacements en conservant les libellés, les fiches et les données de collection ; vérifier l’application sur mobile avant publication. Éviter un simple redessin imitant le logo litigieux.
4. Examiner séparément les licences RAWG/IGDB, les sources d’actualités et les supports promotionnels. Le présent inventaire local ne solde pas ces dossiers.
5. En cas de contestation ou de doute persistant sur une exception, faire examiner le contexte par un professionnel du droit avant de maintenir le visuel concerné.

Pour demander une autorisation, préparer un message indiquant les fichiers exacts, l’application publique, l’usage de catalogue, le stockage, le détourage, les supports promotionnels éventuels et le projet de monétisation. Demander une réponse écrite sur ce périmètre. **Aucun message n’a été envoyé.**

Les contrôles de confidentialité, mineurs et effacement restent consignés dans [controle-complementaire.md](controle-complementaire.md). Cet audit d’images ne les clôt pas. Les corrections applicatives en attente restent locales ; ce rapport n’a entraîné aucun déploiement.
