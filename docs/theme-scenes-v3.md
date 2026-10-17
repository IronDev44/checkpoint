# Scènes originales — 17 octobre 2026

Les cinq illustrations générées de la version précédente sont retirées du
répertoire public et du nouveau déploiement. Une copie locale est conservée dans
le dossier ignoré `.account-backups/retired-theme-scenes-2026-10-17/`.

Les sept univers récemment revus reposent maintenant sur des décors dessinés et
animés dans le code, sans fichier image, modèle de personnage ou logo importé.
Les noms de référence restent dans le sélecteur de thèmes pour retrouver les
ambiances ; les scènes portent leurs propres titres Checkpoint.

| Référence dans les options | Création Checkpoint | Animation d’introduction |
| --- | --- | --- |
| Halo | Orbites lointaines | Vallée, habitat orbital, monument lumineux et signaux dans le ciel |
| Portal | Laboratoire des passages | Chambre en perspective, fenêtres spatiales, éclairage et ouverture du sas |
| God of War | Les brumes du Nord | Fjord, reliefs enneigés, pierre gravée, voile et ruban rouges, neige et aurore |
| Red Dead Redemption | Pistes du couchant | Mesas, soleil bas, voie ferrée, oiseaux et poussière |
| Assassin’s Creed | Mémoires des toits | Toits Renaissance, dôme original, oiseau et bannière au vent |
| Retour vers le futur | Le temps déraille | Tour horloge originale, aiguilles à rebours, éclairs et chaussée lumineuse |
| Jurassic Park | Réserve des origines | Canopée, entrée à lanternes, portes mobiles, silhouette de sauropode, pluie et brume |

Les personnages et objets repris directement ont été remplacés : casque Mark VI,
emblème des Assassins, enseigne du film, compteur 88 mph, cœurs du cube compagnon
et symbole Omega. Le prisme, le motif de givre entrelacé et les toits filaires des
transitions sont dessinés pour Checkpoint. La traversée de feuillages du thème
tropical diffère de son introduction au portail.

## Fichiers

- `src/services/inspiredWorlds.js` : géométrie, éclairage, décors et mouvements.
- `src/components/InspiredWorldCanvas.jsx` : cycle de dessin et ressources.
- `src/components/InspiredWorldCanvas.css` : adaptation et fondu vers le contenu.
- `src/components/ThemeSceneRevision.jsx` : scènes d’introduction et transitions.
- `src/data/gameUniverseThemes.js`, `moreGameThemes.js`, `popCultureThemes.js` :
  titres des scènes, en conservant les identifiants et choix enregistrés.

## Fluidité et vérifications

Le décor fixe est dessiné une fois dans un canevas en mémoire. Seuls les éléments
mobiles sont redessinés : 24 images par seconde en mode complet, 12 en mode réduit,
avec moins de particules et une résolution inférieure. La résolution est plafonnée
sur les grands écrans. Le dessin s’arrête lorsque la page est masquée ; les tâches
d’animation et observateurs sont libérés au changement de scène ou à la fermeture.

Les modes complet, réduit et désactivé gardent leurs réglages existants. Le
démarrage, la progression du chargement et l’accès aux données des comptes ne sont
pas modifiés.

Les tests ciblés couvrent les scènes, la géométrie aux tailles mobile/paysage/bureau,
le budget réduit, la libération des ressources et les protections du démarrage.
Les vérifications visuelles sont faites dans un navigateur aux tailles 390×844,
320×568, 844×390 et 1440×900 ; elles ne constituent pas une mesure sur téléphone
physique.
