# Mario Kart · Route Arc-en-ciel

La refonte comprend la palette de l'interface, une introduction qui survole la Route Arc-en-ciel et une transition de boost. Le kart, le volant, les mains et les feux de départ ont été retirés.

## Interface

`KartTheme.css` remplace le fond bleu par un espace prune, des étoiles fixes, des panneaux violets, du texte ivoire et des bordures dorées. Les actions actives et la progression reprennent les couleurs de la piste. Les boutons gardent la hiérarchie et la disposition de l'app. La couleur des barres du navigateur est aussi mise à jour.

## Introduction et transition

`KartEffects.jsx` et `kartScene.js` dessinent une piste en perspective qui défile dans les virages, avec un léger mouvement de caméra, des dalles colorées façon vitrail, des cristaux et des nuages. Les références visuelles sont les deux premières parties de la Route Arc-en-ciel de Mario Kart World : https://www.mariowiki.com/File:MKWorld_Rainbow_Road_Lap_1.jpg et https://www.mariowiki.com/File:MKWorld_Rainbow_Road_Lap_2.jpg. Aucun fichier du jeu n'est intégré à l'app : le rendu est dessiné en Canvas.

Le ciel est précalculé sur un canevas séparé ; seul le premier plan est redessiné. Le chargement reste discret au bas de l'écran. L'intro est désormais portée par `AccountGate` et `StartupIntro` pour couvrir aussi l'attente de connexion ; `App` ne crée plus une deuxième intro. Le bouton « Passer l'intro » devient disponible une fois l'écran suivant prêt.

La transition utilise une accélération, des dalles à chevrons, un léger roulis et des traînées colorées. Sa fin à 800 ms précède le démontage existant à 840 ms. La direction est inversée quand on retourne à l'onglet précédent. Elle n'intercepte aucun clic.

## Coût et nettoyage

- Complète : jusqu'à 84 segments, 100 étoiles (140 en effets renforcés), cristaux et traînées de boost ; cible de dessin 60 images/s, résolution limitée à 1,8 million de pixels.
- Réduite : 42 segments, 38 étoiles, sans cristaux ni traînée, sans roulis ; cible de 30 images/s et maximum 650 000 pixels. La piste garde toute la taille de l'écran.
- Désactivée : l'app conserve son changement d'onglet immédiat, sans monter la transition.
- Les boucles sont annulées au démontage, suspendues quand la page est cachée et redimensionnées avec `ResizeObserver`. Le défilement bloqué pendant l'intro est restauré à sa fermeture. Si Canvas est indisponible, une piste statique et le chargement restent visibles.

Les cadences sont des plafonds de travail, pas des garanties mesurées sur un téléphone physique. Les tests couvrent les limites de résolution, les projections, la direction, les modes, le chargement, la fermeture et le nettoyage des animations. Le rendu est contrôlé dans un navigateur aux formats mobile portrait, paysage et ordinateur.
