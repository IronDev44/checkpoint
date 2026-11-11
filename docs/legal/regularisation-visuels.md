> État publié : nom et lettrage Checkpoint 2077 conservés ; masquage global des logos annulé, registre de substitutions vide. Les crédits et corrections légales prêtes sont publiés sur https://58998b34.checkpoint-eka.pages.dev. Les descriptions du masquage et des versions locales ci-dessous sont historiques. Aucune autorisation d’image ou de police n’est déduite de cette publication.

> Mise à jour : à la demande du créateur, le nom Checkpoint 2077 et le lettrage antérieur (police Cyberpunk Regular et composition SVG) sont rétablis localement. Le retrait de la police décrit ci-dessous est donc annulé ; les vérifications du build sans cette police sont historiques. Les logos restent dans leur état précédent et aucune publication n’a été effectuée.

# Régularisation des visuels — préparation locale du 11 novembre 2026

## Changements effectués

- Le thème conserve le nom **Checkpoint 2077** à la demande du créateur. Le renommage provisoire en Signal 2077 a été annulé : l’audit n’a établi aucune interdiction spécifique de ce nom. Le titre partagé par l’intro, les transitions et l’en-tête utilise actuellement Orbitron ; les imports de la police Cyberpunk et des tracés de référence ont été retirés. Les fichiers historiques sont conservés dans les sources, sans import dans le bundle.
- Les 74 fichiers sous `public/images/brands` sont remplacés à l’affichage par un symbole générique propre à Checkpoint. Les noms de marques et les données restent disponibles. Cela inclut la confusion Valve/Steam.

**Portée de cette mesure :** le masquage global des logos est excessivement large au regard des seules preuves de l’audit. Il ne démontre pas que ces usages sont interdits ; une analyse individualisée doit distinguer référence loyale, droits sur le dessin et conditions de provenance. La mesure locale reste techniquement en place tant que son réexamen n’est pas effectué. Aucun retrait n’a été publié.
- `CatalogImage` résout les remplacements avant de créer l’image DOM et retire le `srcSet` correspondant. Les photos personnelles et les URL non listées restent inchangées. Le composant est employé dans App et les composants qui rendaient des images.
- `src/data/catalogVisualRights.json` est le registre des substitutions. Il s’agit d’une mesure provisoire choisie pour les fichiers sans permission documentée, pas d’un jugement de contrefaçon.
- Le script `postbuild` retire uniquement ces fichiers du dossier généré `build`. Les originaux restent dans `public` pour la recherche de permissions. **Utiliser `npm run build` puis déployer son résultat**, pas le dossier public ni une compilation qui saute `postbuild`.
- Un pied de page fournit des liens RAWG, IGDB et vers les crédits détaillés depuis les onglets.

La mesure ne révoque pas d’anciennes versions déjà déployées, les téléchargements ou les caches qui auraient conservé un fichier. Aucune ancienne version distante n’a été supprimée.

## Photos et jaquettes : état distinct

Le remplacement des photos du catalogue non documentées a fait l’objet d’un choix présenté au créateur : masquer provisoirement ces photos, ou les conserver pendant les demandes de permission. **En l’absence de réponse explicite, elles restent affichées et leur régularisation reste ouverte.** L’illustration originale `public/images/checkpoint-device.svg` est prête comme repli. Elle n’a pas été substituée globalement aux photos.

La documentation RAWG exige une attribution avec lien sur les pages où ses données sont utilisées. Les textes consultés présentent des formulations différentes sur l’usage commercial entre la grille tarifaire et les conditions : demander une confirmation avant monétisation. Le fournisseur indique ne pas posséder tous les droits sur les images ; le lien de crédit ne remplace donc pas l’examen des droits de tiers. [Documentation RAWG](https://rawg.io/apidocs), [conditions API](https://rawg.io/tos_api).

La documentation IGDB consultée décrit un usage non commercial sous l’accord développeur Twitch et propose un contact pour les projets commerciaux. L’accès effectif et le contrat applicable doivent être vérifiés avant monétisation. Ne pas assimiler cette documentation à une autorisation universelle sur chaque jaquette. [Documentation IGDB](https://api-docs.igdb.com/#about).

Les photos matérielles, Consolevariations, les images d’actualités et les supports Instagram ne sont pas tous régularisés par ces changements. Voir [l’inventaire](inventaire-visuels-complet.csv) et [le rapport](photos-et-logos.md).

## Restaurer un visuel après vérification

Archiver l’accord ou la licence, l’auteur, les fichiers et empreintes, la date, les usages permis, les territoires, les transformations, la durée et les crédits. Retirer ensuite uniquement l’entrée correspondante du registre, mettre à jour les crédits, reconstruire et vérifier. Une permission pour le catalogue ne vaut pas nécessairement pour une publicité ou un post promotionnel.

## Modèle de demande, non envoyé

Objet : Autorisation de réutilisation de visuels pour Checkpoint

Bonjour,

Je développe Checkpoint, une application web de collection de jeux et de matériel accessible à https://checkpoint-eka.pages.dev/. Elle est actuellement proposée gratuitement, sans abonnement payant. Une monétisation pourrait être envisagée ultérieurement et ferait l’objet d’une confirmation séparée si nécessaire.

Je souhaite connaître les conditions permettant d’utiliser les fichiers dont les URL et aperçus seront joints à ce message. L’usage envisagé est l’identification des modèles dans le catalogue et les collections des utilisateurs, avec hébergement de copies optimisées, redimensionnement et, pour certaines photos, suppression du fond. Merci de préciser les droits concernés et si vous pouvez autoriser cet usage, avec les crédits, limites, durée et territoires applicables.

Pouvez-vous également préciser si une autorisation distincte est nécessaire pour les cartes exportées, captures de démonstration et publications promotionnelles sur les réseaux sociaux ?

Je peux fournir une liste exacte des fichiers et des écrans concernés. Aucun partenariat officiel ne sera annoncé sans accord.

Body Jordan — Checkpoint
checkpoint.appgaming@gmail.com

Avant tout envoi : joindre une sélection précise pour le destinataire, vérifier qu’il est titulaire des droits ou habilité, et adapter les usages demandés. Aucun message n’a été envoyé pendant cette préparation.

## Validation et publication

Les 23 tests ciblés du composant image, de l’intro/transition, des galeries, de l’éditeur et des actions d’édition matérielle passent. JSDOM signale sa limitation `window.scrollTo` dans deux suites, sans échec de test ; aucune régression du défilement réel n’est déduite de ces tests. L’aperçu isolé des composants est contrôlé dans Chrome sur ordinateur et à 390 × 844 ; ce n’est pas un audit visuel de tous les écrans connectés. La compilation réussit et le contrôle du build confirme les 74 exclusions, la conservation des originaux et l’absence de l’ancienne police dans le CSS livré.

Cette version reste locale. Elle n’a pas été commitée, poussée ni déployée. Elle inclut également les modifications juridiques antérieures en attente, notamment la mise en pause de la mesure individuelle d’activité ; ne pas présenter ces mesures comme actives en production.
