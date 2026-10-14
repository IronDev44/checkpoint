# Vérification des palettes mobiles

Le fond de `.app-shell` peint directement `--bg-main` et isole les couches
pseudo-éléments du thème. Les contrôles non sélectionnés utilisent `--surface-bg`
au lieu d’un dégradé bleu fixe. Leur bordure dispose d’un repli utilisant
`--surface-border` lorsque `color-mix()` n’est pas disponible.

Les choix spécialisés et matériel du Top 5 utilisent des lignes de grille
d’au moins 84 px, avec le titre et le critère dans deux lignes séparées.

Vérification avec les styles de production compilés : les 27 thèmes de la liste
d’options ont été comparés dans des aperçus de 390 px de large. Les fonds sont
tous distincts et présents, les surfaces reprennent leurs palettes, les textes
des huit boutons restent dans leurs cadres et aucune page d’aperçu ne déborde
horizontalement. L’animation d’apparition des cartes est figée uniquement dans
les aperçus pour permettre la comparaison visuelle. Les transitions de thème
ne sont pas modifiées par cette correction.

La compilation réussit. Le téléphone Android physique n’a pas été contrôlé
directement ; ces vérifications ne garantissent pas le rendu de son moteur
Chrome ou les couleurs de son écran.
