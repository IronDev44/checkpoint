# Couleurs et éditions du matériel

Depuis un modèle du catalogue, « Couleur / édition spéciale » ajoute une déclinaison. Depuis une fiche existante, « Modifier la couleur / l’édition » précise ses informations et « Ajouter une autre édition » crée une fiche distincte.

- Types : standard, collector, édition limitée, anniversaire, personnalisée.
- Le nom et le coloris sont libres ; les suggestions de couleurs ne constituent pas un catalogue d’éditions officielles.
- Dans la fiche ou le formulaire d’édition, « Couleurs et éditions » ouvre les déclinaisons vérifiées du même modèle technique. La recherche filtre le nom, le coloris et la région. Les photos et les éditions encore sans photo sont distinguées. Le choix prépare un aperçu ; seule la validation enregistre le changement.
- Une sélection illustrée enregistre son identifiant dans `edition.photoId`, ainsi que l’image résolue dans `image` et l’image de base dans `catalogImage`. Métadonnées et image sont mises à jour ensemble avec la sauvegarde existante et son annulation.
- Si les métadonnées sont modifiées et ne correspondent plus à la photo sélectionnée, l’image standard reprend la place. Aucune recoloration automatique ni correspondance approximative n’est faite.
- Les notes, avis, statuts et années restent propres à chaque fiche.
- Même modèle + mêmes métadonnées d’édition + même statut : l’ajout est refusé. Un changement d’édition ne remplace pas les notes existantes.
- La complétion compte toujours les identifiants techniques distincts. Les classements conservent leur regroupement par modèle.
- Recherche personnelle et filtres matériel reconnaissent noms d’édition et couleurs.

Les anciennes fiches restent compatibles : sans métadonnées, elles correspondent à une édition standard, sans coloris renseigné. Aucune fiche existante n’est fusionnée ou renommée.

## Catalogue photo partagé

Les fichiers sont servis avec l’application depuis `public/images/hardware/editions/`, donc par le même déploiement Cloudflare Pages. Aucun bucket ou abonnement supplémentaire n’est nécessaire. `src/data/hardware/editionPhotos.json` associe chaque photo aux identifiants techniques autorisés, son nom, son coloris, sa source et son crédit affiché dans la liste.

Le catalogue contient 1 315 déclinaisons pour 229 modèles techniques : 603 avec photo (136 modèles) et 712 documentées sans photo dédiée. Il couvre notamment les familles DS/3DS, Game Boy, GameCube, Wii, Switch, PlayStation, Xbox, Sega, Atari, SNK et WonderSwan ainsi que plusieurs gammes de manettes tierces. Les sources et crédits sont conservés pour chaque entrée. Les photos produit ne sont ni recolorées ni générées.

876 entrées complémentaires proviennent de Consolevariations. La galerie indique explicitement qu’il s’agit d’une archive collaborative et conserve un lien vers la fiche de chaque édition ; ces entrées ne sont pas annoncées comme certifiées par le fabricant. Les références constructeur existantes et leurs identifiants illustrés sont conservés en priorité. 383 photos de cette archive ont été contrôlées visuellement puis intégrées avec leur crédit et leur URL source. La transparence native est conservée lorsqu’elle existe ; les autres photos retenues utilisent un détourage classique vérifié. Les emballages seuls, les appareils montrés avec leur boîte et les vues ambiguës sont restés hors du catalogue photo. Les estimations de rareté ne sont pas importées.

Les 261 références existantes figurent dans l’audit : les 229 références précises ont désormais des finitions sourcées, 18 nécessitent de préciser le modèle et 14 correspondent à des configurations personnalisables. Sur les 229, 49 ne disposent encore que de leur finition de base confirmée, ce que la galerie signale. Les 76 références auparavant sans données sont couvertes par cette passe, avec 115 entrées supplémentaires. Le recensement mondial des collectors reste ouvert ; une finition de base confirmée ne certifie pas qu’aucune autre édition n’existe. Les références génériques et personnalisables disposent d’un message spécifique dans le formulaire, défini dans `src/data/hardware/editionNotes.json`.

Les ajouts couvrent notamment Steam Deck, ROG Ally, Mac, plusieurs consoles rétro et les gammes Nacon, Razer, Hori, Victrix, GuliKit, PowerA et Turtle Beach. Les fabricants restent la source prioritaire ; `archived-manual`, `archive-reference` et `retailer` identifient les rares références documentées par un manuel d’origine archivé, une archive spécialisée ou une fiche revendeur. Le crédit reste visible sous chaque choix. `coverage: "standard-finish"` indique une finition de base confirmée et non une liste exhaustive.

Les générations restent séparées : Gambit et Gambit Prime, Pro BFG et Reloaded, Kishi V2 et V2 Pro, KK3 et KK3 Pro. L’OUYA 8 Go ne reçoit pas les coloris du modèle 16 Go ; la PC Engine Mini japonaise ne reçoit pas les châssis CoreGrafx ou TurboGrafx. Les façades interchangeables fournies ensemble constituent une seule référence.

L’[audit complet des consoles et manettes](hardware-catalog-audit.md) détaille les 261 références et les corrections. `npm run audit:hardware` contrôle les identifiants, les fichiers et les correspondances. Pour actualiser le rapport : `node scripts/audit-hardware-catalog.cjs --report docs/hardware-catalog-audit.md`.

Pour ajouter une déclinaison, enregistrer son image dans ce dossier, compléter le manifeste avec les bonnes correspondances `catalogId`, `type` et `versionIds`, conserver la source et le crédit, puis vérifier la sélection et la sauvegarde. Une édition d’un autre modèle n’est jamais proposée sur la fiche courante.

## Fonds transparents

Les 603 photos d’éditions affichées contiennent un canal alpha. Les sources déjà transparentes sont conservées ; les autres ont été préparées par détourage classique, sans génération IA. Les petites archives ne sont pas artificiellement agrandies : leur définition peut être inférieure à celle des photos récentes. Les originaux restent présents sous leur chemin initial ; `originalImage` conserve ce lien et `processing` signale le traitement. La galerie affiche le crédit accompagné de « fond retiré » lorsque la photo a été adaptée.

Les anciennes URL enregistrées dans les fiches et instantanés de profils sont résolues vers les photos transparentes à l’affichage par `hardwarePhotoUrl`. Aucune migration des comptes ni modification des photos personnelles n’est nécessaire. Les surfaces blanches ajoutées par la galerie et l’éditeur ont été supprimées.

Le script `scripts/cutout-hardware-photos.py` utilise Pillow, NumPy et OpenCV (segmentation classique, pas de modèle neuronal). Les fonds de studio simples sont séparés par connectivité puis coupe de graphe ; les photos avec décor et les coques claires délicates utilisent les tracés vérifiés de `scripts/hardware-photo-masks.json`. Les détails intérieurs restent ceux de la photo. Le cadrage retire les marges vides et conserve une bordure transparente. Toujours contrôler les contours sur un fond sombre et un fond clair après traitement.

Pour régénérer un fichier : `python scripts/cutout-hardware-photos.py --ids IDENTIFIANT`. Sans `--ids`, le script traite les sources opaques du manifeste et laisse les sources déjà transparentes intactes. Les dépendances de traitement sont séparées de l’application React.

Vérifications : tests des métadonnées, doublons, filtres, recherche, formulaire et intégration dans Matériel ; aperçu navigateur mobile 390 × 844 et paysage 844 × 390 avec données fictives. La vérification visuelle ne remplace pas un essai sur un appareil physique.

Passe du 22 octobre : 736 tests dans 96 suites réussis, compilation de production, lint ciblé et audit du catalogue réussis. Les 453 images ont été décodées et leur transparence vérifiée. Une sélection de DualShock 4 God of War a été sauvegardée puis retrouvée avec la même photo après rechargement dans l’aperçu local ; les choix Crystal Blue et Crystal Red ont été contrôlés en paysage. Ces essais utilisent uniquement des données fictives.

## Recherche des photos manquantes du 22 octobre

Les sources des 862 éditions initialement sans photo ont été consultées : 691 pages distinctes, dont 673 accessibles et 18 indisponibles. Les galeries d’archives ont fourni 986 vues alternatives examinées, jusqu’à deux par fiche ; 273 images issues de pages fabricant ont aussi été examinées. Trois vues de face GuliKit ont été retrouvées dans leurs galeries officielles. Une présence sur une page ne suffit pas à prouver la correspondance : boîtes, modèles voisins, versions personnalisées et rendus mal détourés restent exclus.

150 photos supplémentaires ont été retenues : 91 issues des galeries d’archives et 59 de fabricants. Le catalogue compte désormais 603 déclinaisons illustrées, sur 136 modèles techniques ; 712 déclinaisons restent sans photo dédiée. Les fichiers d’origine sont conservés pour les vues recadrées ou détourées. Les vues de face 8BitDo sont extraites des carrousels transparents sans modifier les pixels du produit, et la galerie distingue « vue recadrée » de « fond retiré ».

Le [suivi des recherches](hardware-photo-research.json) conserve les 862 identifiants, la source consultée, la date, la disponibilité de la page, le nombre de liens d’images relevés et le résultat. « Recherche à poursuivre » ne veut pas dire « photo introuvable » : d’autres vues de galerie et d’autres sources restent à examiner. Certaines pages chargent leurs images dynamiquement ou redirigent vers un autre produit. Les recherches ne sont pas une certification de l’exactitude de chaque page d’archive.

Validation de cette passe : 737 tests dans 96 suites, compilation de production, lint ciblé et audit réussis. Les 603 images affichées ont un canal alpha vérifié. La vue de face M30 a été régénérée à l’identique avec le script de préparation. Sélection de la finition blanche, sauvegarde puis rechargement vérifiés dans l’aperçu local ; chargement et sélection de la finition noire vérifiés en paysage 844 × 390. Les essais utilisent des données fictives, sans modifier les comptes réels.

## Éditions documentées sans photo

`src/data/hardware/editionVariants.json` complète le catalogue photo. Ces entrées possèdent les mêmes métadonnées et cibles techniques, une source constructeur ou une fiche d’archive identifiée, un crédit et parfois une région. `verification: "archive"` et `archiveId` identifient les références Consolevariations ; les ajouts issus de cette passe comportent `reviewedOn`. La galerie permet de les choisir et affiche « Photo à compléter » ; la photo standard du modèle est alors utilisée après validation. Aucune boîte ni photo d’un autre coloris ne sert de substitut. Leur sélection ne crée pas de `photoId` et ne change ni la génération, ni la capacité.

Les correspondances restent strictes : PS5 anniversaire sur Slim Digital 1 To ou Pro 2 To ; PS4 Pro 500 Million sur 2 To uniquement ; les éditions de New 3DS XL ne sont pas proposées sur New 3DS. Les coloris officiels régionaux conservent leur nom et leur région dans la source affichée. Les habillages d’un bundle sont distingués des révisions techniques.

Autres garde-fous : Tales of Xillia sur PS3 Slim 320 Go ; Final Fantasy XIII blanche sur Slim 250 Go ; Minecraft sur Xbox One S 1 To. Les capacités absentes (PS3 Fat 160 Go, Xbox 360 S 320 Go, Xbox One S 2 To, par exemple) ne sont pas remplacées par une capacité proche. Les Wii Remote Plus ne sont pas ajoutées aux Wiimote d’origine. Les châssis CoreGrafx, PC Engine LT, Game Gear Micro ou Neo Geo CDZ ne sont pas fusionnés avec une référence voisine. Les prototypes, cadeaux internes, lots de concours gratuits et simples emballages ont été écartés lorsqu’ils étaient identifiables ; les cas incertains restent hors liste.

Les photos d’archives illustrant seulement un emballage n’ont pas été intégrées comme photos du matériel. Les logos promotionnels détachés ont été retirés par sélection du sujet dans les fichiers transparents ; les sources originales restent présentes. Le détourage préserve les deux Joy-Con et les différentes vues du produit lorsqu’elles figurent ensemble.
