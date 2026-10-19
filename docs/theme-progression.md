# Thèmes et progression

51 thèmes : Checkpoint disponible dès le départ, puis un thème à chaque niveau pair de 2 à 100. Checkpoint Premium occupe le niveau 50, Checkpoint Ultime le niveau 100.

Les cinq ajouts sont Mass Effect (carte galactique / saut spatial), Skyrim (aurores et pierre gravée / souffle de givre), Street Fighter (arène et compte à rebours / impact), Splatoon (projections d’encre / recouvrement coloré), et Ori (forêt et lueur / traînée lumineuse). Les scènes sont des dessins SVG et animations CSS, sans images générées ni ressources officielles importées. Chaque univers inclut une palette, une introduction et une transition différente, ainsi qu’un mode réduit.

Le catalogue commun est dans `src/data/themeCatalog.js`, les niveaux dans `src/services/themeRewards.js`. Ne pas réordonner le catalogue sans migration des niveaux. Les déblocages sont calculés après chargement du compte et de sa progression, puis conservés dans les paramètres privés. Une baisse de niveau ne retire jamais un thème gagné. Les comptes existants reçoivent les récompenses correspondant à leur niveau courant. Le compte propriétaire authentifié, identifié exclusivement par son UID configuré, dispose des 51 thèmes dès le départ. Les autres comptes conservent les paliers de progression. Aucun nom public ou indicateur de profil modifiable ne donne cet accès.

Validation : tests des 50 seuils, unicité des niveaux et du catalogue, restauration privée, conservation après baisse de niveau, intégration des introductions/transitions et géométrie réduite. Contrôle navigateur en portrait 390×844 et paysage 844×390. Aucun appareil physique testé.
