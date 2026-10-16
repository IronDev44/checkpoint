# Six univers de jeu vidéo

Disponibles dans Options → Interface → Thème, sans remplacer les thèmes existants.

| Thème | Palette | Introduction | Transition |
| --- | --- | --- | --- |
| Elden Ring | Or patiné, olive et pierre sombre | Anneaux gravés, arbre doré et braises | Tracé des anneaux et ouverture de la grâce |
| Halo | Armure olive, bleu spatial et ivoire | Casque Spartan, anneau-monde, relief et interface HUD | Approche de l’anneau et balayage du HUD |
| BioShock · Rapture | Pétrole, laiton et crème | Hublot sur Rapture, architecture Art déco et bulles | Plongée à travers le hublot |
| Portal | Graphite, orange et bleu | Cube compagnon entre deux portails | Traversée du cube d’un portail à l’autre |
| God of War · Nordique | Glace, acier et rouge terre | Hache, montagnes, neige et marque rouge | Rappel de la hache et éclats de givre |
| Animal Crossing · Soir d’été | Vert doux, bois et crème | Petite île, maison, cadeau volant et lucioles | Passage d’une grande feuille |

Les scènes sont dessinées dans le projet en SVG et CSS, sans image ou vidéo externe. Les palettes couvrent les fonds, panneaux, champs, boutons, logo et navigation, y compris le fond opaque de Chrome Android.

Le cadre de chargement réutilise la mise en page responsive des nouveaux thèmes de cinéma. La progression dépend du démarrage réel et le bouton Passer est disponible uniquement quand son contrôleur l’autorise. Les introductions bloquent le défilement jusqu’à leur fermeture.

Les modes complet et réduit sont conservés. Le mode réduit diminue les particules et la géométrie, supprime les ombres des portails et simplifie certains mouvements. Les transitions sont retirées à 840 ms par le contrôleur existant ; aucun moteur d’animation JavaScript n’est ajouté.

Validation du 16 octobre 2026 : 88 tests ciblés passent, dont les anciens thèmes et le démarrage des comptes. Les tests des nouvelles scènes et de leur mémorisation ont été rejoués après les dernières retouches. La compilation de production réussit. Les six intros ont été contrôlées dans le navigateur à 320 × 568, 844 × 390 et 1366 × 900 ; les scènes ont aussi été examinées à 390 × 844. Les douze variantes de transition couvrent l’écran et se retirent après lecture, sans erreur console. Les fonds de panneaux et de navigation correspondent aux six palettes. Ces contrôles utilisent le navigateur, pas un téléphone physique.

Références : [Elden Ring](https://www.bandainamcoent.com/games/elden-ring), [Halo](https://www.halowaypoint.com/), [BioShock](https://support.2k.com/hc/en-us/categories/200108353-BioShock), [Portal](https://www.thinkwithportals.com/), [God of War](https://www.playstation.com/en-us/god-of-war/), [Animal Crossing](https://animalcrossing.nintendo.com/).
