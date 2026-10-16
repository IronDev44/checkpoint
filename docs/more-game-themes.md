# Deuxième série de thèmes de jeu vidéo

Six thèmes s’ajoutent aux précédents dans Options → Interface → Thème.

| Univers | Palette | Introduction | Transition |
| --- | --- | --- | --- |
| Hollow Knight | Bleu nocturne, ivoire et gris perle | Petit chevalier, arches souterraines et lueurs d’âme | Ruée du chevalier et balayage lumineux |
| Red Dead Redemption | Rouge brûlé, sable et cuivre | Cavalier devant le soleil, reliefs de l’Ouest | Passage du cavalier et bandes cinématographiques |
| Assassin’s Creed · Animus | Pierre, ivoire et rouge discret | Capuche, lame et géométrie de l’Animus | Décomposition en fragments puis synchronisation |
| Hades | Pourpre, bronze et vert sauge | Crâne, couronne de laurier et colonnes grecques | Montée des flammes et apparition de la couronne |
| Resident Evil · Salle de sauvegarde | Bois, vert patiné et papier | Lampe et machine à écrire | Avance du papier et frappe de Checkpoint |
| Metal Gear Solid · Codec | Phosphore, vert militaire et ambre | Codec, radar et niveau de signal | Connexion, balayage et point d’exclamation |

Les scènes utilisent des dessins SVG et des animations CSS. Aucun média externe n’est chargé. Les modes complet et réduit, la vraie progression au démarrage, le verrouillage temporaire du défilement et le retrait des transitions à 840 ms sont réutilisés depuis la série précédente.

Les nouveaux thèmes sont déclarés dans `moreGameThemes.js`, puis intégrés au registre existant. Les palettes sont appliquées aux surfaces de l’application et à la navigation opaque d’Android. Les thèmes précédents ne sont pas remplacés.

Validation du 16 octobre 2026 : 118 tests ciblés passent ; les 65 tests des scènes et de leur mémorisation ont été rejoués après les retouches visuelles. Les six intros ont été contrôlées dans le navigateur à 320 × 568, 390 × 844, 844 × 390 et 1366 × 900. Les douze variantes de transition couvrent le viewport et disparaissent après lecture, sans erreur console. Les fonds des panneaux et de navigation correspondent aux six nouvelles palettes. Ces contrôles n’utilisent pas de téléphone physique.

Références : [Hollow Knight, Team Cherry](https://www.teamcherry.com.au/games), [Hades, Supergiant](https://www.supergiantgames.com/games/hades/), [Codec, manuel Konami](https://metalgear.konami.net/manual/mc1/mgs1_integral/pc/en/page05.html), [Animus, Ubisoft](https://www.ubisoft.com/en-us/games/assassins-creed-animus-pack).
