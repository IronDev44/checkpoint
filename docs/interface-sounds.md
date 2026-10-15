# Sons de l’interface

Options → Interface → Sons de l’interface propose huit ambiances procédurales originales : Checkpoint doux, Arcade 8-bit, Console portable, Aventure fantasy, RPG cristal, Station orbitale, Course arcade et Combat arcade. Chaque ambiance décline les actions navigation, ajout, retrait, badge et niveau. Les aperçus sont explicites et restent disponibles quand les sons sont désactivés ; ils ne réactivent pas les effets.

Le volume de 0 à 100 % et les boutons −/+ règlent tous les effets. À 0 %, aucun son n’est joué. Le curseur garde ses changements en local pendant un glissement et enregistre à la fin pour éviter de recalculer toute l’application à chaque mouvement. Le volume du téléphone reste un réglage séparé.

Les préférences sont dans `appOptions.sound` : `{enabled, style, volume}`. Elles suivent les options du compte, leur sauvegarde D1, les imports/exports et la remise à zéro. Les anciennes clés du compte `checkpoint-sound-enabled`, `checkpoint-sound` et `checkpoint-sound-volume` servent uniquement à la migration ; le style `retro` devient `nes`.

Le moteur Web Audio est créé au premier son, réutilise son contexte, limite les superpositions à quatre effets et libère ses nœuds après lecture. Couper le son, changer d’ambiance ou quitter le compte arrête les lectures en cours. Les aperçus se remplacent entre eux. Un navigateur sans Web Audio ou refusant la lecture ne bloque pas les actions de l’application.

Validation ciblée : `soundEffects.test.js` et `SoundSettings.test.jsx` couvrent migration, volume, coupure, limites de superposition, nettoyage, reprise du contexte, aperçu et glissement du curseur. Le mode complet/réduit des transitions ne change pas l’ambiance sonore.

Contrôle navigateur du 16 octobre 2026 : les 40 combinaisons ambiance/action ont été rendues avec OfflineAudioContext à 100 %, avec un signal non nul et sans écrêtage (crêtes de 0,0231 à 0,0639). Les aperçus ont aussi démarré dans un AudioContext réel. Panneau vérifié à 320, 390 et 1366 px de large, avec Aurora Neon, Xbox et Mario Kart ; ces vérifications ne remplacent pas une écoute sur téléphone physique.
