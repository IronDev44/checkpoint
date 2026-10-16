# Nouveaux thèmes de pop culture

Les quatre thèmes sont dans Options → Interface → Thème. Leur palette s’applique aux fonds, panneaux, champs, boutons, logo et barre de navigation, y compris aux surfaces opaques utilisées sur Android.

| Thème | Interface | Introduction | Transition |
| --- | --- | --- | --- |
| Tron · 1982 | Bleu électrique, contours filaires et touches rouges | Grille en perspective, reliefs polygonaux, Recognizer et traînées à angles droits | Approche du Recognizer et transfert sur la Grille |
| Tron : L’Héritage | Noir bleuté, cyan et orange | Disque d’identité, architecture sombre et traînées lumineuses | Disque qui tourne puis traverse l’écran |
| Retour vers le futur | Brun cuivré, ambre et bleu électrique | Circuits temporels, convecteur et compteur 88 MPH | Tunnel temporel, éclair et traces de feu |
| Jurassic Park | Vert forêt, ambre et rouge terre | Moustique dans l’ambre, jungle sous la pluie et portail | Ouverture des portes et passage entre les feuillages |

Les formes sont dessinées en SVG/CSS dans le projet. Aucun poster, extrait de film ou fichier vidéo n’est nécessaire. Les intros affichent la vraie progression de démarrage et peuvent rester visibles pendant une connexion lente. Le bouton Passer dépend du contrôleur de démarrage existant.

La version réduite conserve les motifs mais diminue le nombre de particules, bâtiments, rayons et cadres. Les transitions passent par le portail existant et se terminent avant son retrait à 840 ms. Elles n’utilisent ni filtre de flou plein écran ni boucle JavaScript. Les préférences système sont respectées sauf si l’utilisateur a explicitement choisi les transitions complètes, comme pour les autres thèmes.

`popCultureThemes.js` partage les identifiants, libellés et couleurs du navigateur entre Options et la validation des préférences de démarrage. Les anciens thèmes et réglages sonores sont conservés.

Validation du 16 octobre 2026 : 60 tests ciblés passent et la compilation de production réussit. Dans le navigateur, les quatre intros ont été contrôlées à 320 × 568 et 844 × 390 ; les formats 390 × 844 et 1366 × 900 ont également été examinés. Le logo reste dans l’écran et le texte précède la barre de chargement. Les fonds des panneaux et de la navigation suivent les quatre palettes. Chaque transition complète et réduite disparaît après sa lecture, sans erreur console. Aucun téléphone physique n’a été utilisé pour ces contrôles.

Références visuelles : [Tron, Disney](https://movies.disney.com/tron), [Tron: Legacy, Disney](https://movies.disney.com/tron-legacy), [circuits temporels, Back to the Future](https://www.backtothefuture.com/news/2018/12/27/an-interview-with-back-to-the-future-special-effects-consultant-michael-fink), [Jurassic Park, Universal](https://www.universalpicturesathome.com/movies/jurassic-park).
