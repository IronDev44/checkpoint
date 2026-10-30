# Checkpoint — première série promotionnelle

Signature : **Tes jeux. Ton parcours. Ton Checkpoint.**

Le C d’origine et la typographie Orbitron sont conservés. La composition est réalisée avec des éléments graphiques natifs, sans génération d’interface ni de logo par IA.

## Images prêtes à utiliser

| Fichier | Format | Usage |
| --- | --- | --- |
| 01-presentation-publication.png | 1080 × 1350 | Présentation de l’application |
| 02-collection-publication.png | 1080 × 1350 | Collection, notes et profil |
| 03-arena-publication.png | 1080 × 1350 | Grand Tournoi / Arène |
| 01/02/03-…-story.png | 1080 × 1920 | Versions verticales |
| 04-logo-slogan-carre.png | 1080 × 1080 | Logo, nom et slogan sur fond noir |
| 04-logo-slogan-story.png | 1080 × 1920 | Signature de marque verticale |
| 04-logo-slogan-banniere.png | 1920 × 1080 | Bannière horizontale |
| 05-logo-slogan-transparent.png | 1800 × 380 | Logo, nom et slogan avec transparence |
| 06-symbole-transparent.png | 1024 × 1024 | C seul, avec transparence |

Les sources SVG sont fournies avec chaque image ; les textes y sont convertis en tracés. La version transparente 05 contient le logo vectoriel d’origine et des textes en tracés. Elle reste nette lors d’un agrandissement. Les autres SVG contiennent les captures matricielles de l’application.

`apercu-collection.png` permet de comparer les quatre directions principales. Le PNG constitue le fichier de publication le plus simple à utiliser.

## Captures et production

La bibliothèque provient de la capture fournie par le propriétaire de Checkpoint. L’Arène provient d’une capture réelle enregistrée pendant les vérifications. Les écrans sont placés dans un cadre graphique sans réinventer leur contenu ni changer leur thème. Ils peuvent être remplacés par des captures plus récentes en conservant la composition.

Le navigateur de capture n’était pas disponible pendant cette préparation ; aucune nouvelle capture de l’application n’est présentée comme telle. Les visuels ont été inspectés après export.

Le lien affiché est celui de l’application web : `checkpoint-eka.pages.dev`. Aucun badge App Store ou Google Play n’est utilisé.

## Reproduction

`prepare-brand.cjs` récupère le symbole du projet et la police Orbitron. `render.cjs` réalise la composition avec `@napi-rs/canvas` et `sharp`, puis exporte PNG et SVG. La police d’accompagnement est Segoe UI sous Windows. Orbitron est distribuée sous SIL Open Font License ; sa licence est conservée dans `assets/`.

Les fichiers d’application et les icônes installées ne sont pas remplacés. Aucun visuel n’a été publié sur un réseau social.
