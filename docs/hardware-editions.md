# Couleurs et éditions du matériel

Depuis un modèle du catalogue, « Couleur / édition spéciale » ajoute une déclinaison. Depuis une fiche existante, « Modifier la couleur / l’édition » précise ses informations et « Ajouter une autre édition » crée une fiche distincte.

- Types : standard, collector, édition limitée, anniversaire, personnalisée.
- Le nom et le coloris sont libres ; les suggestions de couleurs ne constituent pas un catalogue d’éditions officielles.
- Dans la fiche ou le formulaire d’édition, « Voir les versions en photo » ouvre les déclinaisons illustrées du même modèle technique. Le choix prépare un aperçu ; seule la validation enregistre le changement.
- Une sélection illustrée enregistre son identifiant dans `edition.photoId`, ainsi que l’image résolue dans `image` et l’image de base dans `catalogImage`. Métadonnées et image sont mises à jour ensemble avec la sauvegarde existante et son annulation.
- Si les métadonnées sont modifiées et ne correspondent plus à la photo sélectionnée, l’image standard reprend la place. Aucune recoloration automatique ni correspondance approximative n’est faite.
- Les notes, avis, statuts et années restent propres à chaque fiche.
- Même modèle + mêmes métadonnées d’édition + même statut : l’ajout est refusé. Un changement d’édition ne remplace pas les notes existantes.
- La complétion compte toujours les identifiants techniques distincts. Les classements conservent leur regroupement par modèle.
- Recherche personnelle et filtres matériel reconnaissent noms d’édition et couleurs.

Les anciennes fiches restent compatibles : sans métadonnées, elles correspondent à une édition standard, sans coloris renseigné. Aucune fiche existante n’est fusionnée ou renommée.

## Catalogue photo partagé

Les fichiers sont servis avec l’application depuis `public/images/hardware/editions/`, donc par le même déploiement Cloudflare Pages. Aucun bucket ou abonnement supplémentaire n’est nécessaire. `src/data/hardware/editionPhotos.json` associe chaque photo aux identifiants techniques autorisés, son nom, son coloris, sa source et son crédit affiché dans la liste.

Le catalogue contient désormais 46 photos pour huit modèles techniques : DualSense, DualShock 4, Xbox Series, 8BitDo Pro 2, 8BitDo Ultimate Bluetooth, Victrix FS-12, Switch Lite et Switch OLED. Les sources et crédits sont conservés pour chaque photo. Les photos produit ne sont ni recolorées ni générées. Les autres références conservent leur image standard ; leurs éditions restent à documenter.

L’[audit complet des consoles et manettes](hardware-catalog-audit.md) détaille les 261 références et les corrections. `npm run audit:hardware` contrôle les identifiants, les fichiers et les correspondances. Pour actualiser le rapport : `node scripts/audit-hardware-catalog.cjs --report docs/hardware-catalog-audit.md`.

Pour ajouter une déclinaison, enregistrer son image dans ce dossier, compléter le manifeste avec les bonnes correspondances `catalogId`, `type` et `versionIds`, conserver la source et le crédit, puis vérifier la sélection et la sauvegarde. Une édition d’un autre modèle n’est jamais proposée sur la fiche courante.

Vérifications : tests des métadonnées, doublons, filtres, recherche, formulaire et intégration dans Matériel ; aperçu navigateur mobile 390 × 844 et paysage 844 × 390 avec données fictives. La vérification visuelle ne remplace pas un essai sur un appareil physique.
