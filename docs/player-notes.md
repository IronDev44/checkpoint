# Signatures et habitudes de jeu

Les textes de profil utilisent maintenant `src/services/playerNotes.js` :

- La signature reprend les jeux fondateurs choisis par la personne, dès le premier jeu. Aucun surnom ou trait de personnalité n’est déduit du titre d’un jeu ou de ses plateformes.
- L’analyse compte les expériences renseignées : terminées, partielles, essayées, notées ou choisies en favoris. La wishlist et les jeux simplement ajoutés à la collection n’orientent pas les habitudes.
- Une tendance de genre utilise uniquement les métadonnées de genre. Il faut au moins cinq jeux avec un genre connu, une couverture d’au moins la moitié des jeux joués, et un genre présent dans au moins 60 % de cet échantillon, sans égalité au premier rang.
- Les favoris nommés et le matériel actuel restent visibles dans le profil. Les notes ne deviennent pas un jugement sur le niveau ou l’exigence de la personne. Un jeu terminé ne signifie pas une complétion à 100 %.
- Les scores arbitraires de confiance et de remplissage de la signature ont été retirés. La progression, les niveaux, l’XP et les badges restent disponibles.
- L’analyse courte est placée après la signature, sans les anciennes cartes de statistiques répétées. La signature publique n’apparaît qu’une fois.
- Les anciens documents publics ne rendent plus leur prose enregistrée : une description factuelle est reconstruite à la lecture. Les nouvelles analyses incluent des faits versionnés, qui permettent aussi de renouveler les formulations sans attendre une nouvelle publication. Les noms des favoris et des jeux fondateurs respectent les sections masquées à l’affichage.

Vérification : 12 tests de logique (profils vides, petits échantillons, wishlist, genres, égalités, avis partiels, anciens profils et sections masquées), plus les tests existants des profils et photos. Aperçu local des vrais composants `ProfileTab` et `SocialTab` avec des données de démonstration, à 390 × 844 et sur ordinateur. Aucun profil de production modifié pour ces essais.
