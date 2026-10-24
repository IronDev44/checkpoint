# Audit des contrôles mobiles — 24 octobre 2026

## Périmètre

Parcours de l’application locale dans Chrome, avec un compte fictif, une douzaine
de jeux et deux matériels de test. Formats : 320 × 740, 390 × 844 et 844 × 390.

Les 15 onglets ont été parcourus : Accueil, Bibliothèque, Recherche, L’Arène,
Profil, Matériel, Social, Séries, Sanctuaire, Top 5, Sorties, Promos, Actu, Live
et Options. Aucun débordement horizontal de page observé dans ces états.

Les mesures des contrôles ont été complétées par des captures et une inspection
visuelle. Le compteur de notifications et les halos décoratifs du Sanctuaire
augmentent parfois scrollWidth sans cacher de texte : ils ne sont pas traités
comme des libellés coupés. Les noms accessibles des boutons à icône ne doivent
pas non plus être mesurés comme du texte affiché.

## Défauts corrigés

| Zone | Défaut constaté | Correction |
| --- | --- | --- |
| Bibliothèque | Collection et Abandonnés trop serrés à 320 px | Deux colonnes sous 380 px |
| Social | Recommandations coupé au milieu du mot | Ligne entière pour les libellés longs sous 380 px |
| Arène | Navigation trop serrée sur petit écran | Deux colonnes sous 380 px |
| Sanctuaire | Antagonistes déborde | Filtres flexibles, retour à la ligne par bouton |
| Options | Cercle de Progression hors de sa carte | Aperçu réduit à 56 px sous 380 px |
| Fiche jeu | Wishlist et Dans la collection coupés | Grille de statuts adaptée et dernier bouton sur toute la ligne |
| Fiche jeu | Difficultés trop étroites | Deux colonnes, une sous 340 px |
| Fiche jeu | Noms des figures réduits à quelques lettres | Une colonne sous 480 px, noms pouvant revenir à la ligne |

Les boutons de durée et de plateforme des fiches utilisent également des colonnes
qui respectent la place disponible. Les règles restent limitées aux contrôles
concernés dans ResponsiveControls.css ; aucune modification des animations,
illustrations, notes ou données personnelles.

## Sous-vues contrôlées

- Recherche : filtres de tri, jeux de fans, année, plateforme et genre dépliés.

- Arène : variantes et choix de participants.
- Top 5 : catégories spécialisées.
- Options : Interface, contenu, comportement, notation, profil/services,
  données/sauvegardes.
- Matériel : fiche de console et formulaire couleur/édition, sans enregistrement.
- Fiche jeu : expérience, avis, session, difficulté, rangement et figures cultes.

## Validation et limites

Les 803 tests React/services passent. Compilation de production réussie.
Les services authentifiés réels, la caméra, tous les états de compte et les
51 thèmes individuellement ne sont pas certifiés par ce contrôle. Les formats
mobiles correspondent à des tailles de fenêtre Chrome, pas à des essais sur
un appareil iPhone ou Android physique.

Pour vérifier une future modification : contrôler les quatre boutons rapides,
les statuts et difficultés, Recommandations, Antagonistes, les rubriques de
bibliothèque et les trois choix d’en-tête aux formats ci-dessus. Un libellé doit
pouvoir changer de ligne entre les mots, sans être coupé lettre par lettre.
