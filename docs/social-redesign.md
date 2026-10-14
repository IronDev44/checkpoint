# Social : fil, amis et profil

La navigation principale comporte Fil, Amis et Mon profil. Identité et partage
et Ma vitrine sont des sections du profil. Le bloc de rédaction et l’aperçu de
la vitrine s’ouvrent à la demande pour laisser le contenu au premier plan.

Les cartes d’amis possédaient uniquement une action Retirer. Leur identité et
le bouton Voir le profil chargent maintenant le document public actuel avec
le même accès D1 authentifié que l’ajout d’amis. Le profil est affiché seul,
avec Retour au Social. Un document absent ou privé affiche un message et
permet de réessayer. Les données copiées lors de l’ajout ne servent pas de
substitut au profil distant.

Le fil Mes amis lit les activités récentes des profils publics, respecte
`publicSections.activity === false`, trie les événements par date et propose
Actualiser. Les profils sont chargés par groupes de 20, avec une action pour
charger les autres amis. Les interactions sur les publications personnelles
restent dans Mon activité ; aucune interaction distante fictive n’est ajoutée.

Références de présentation : listes d’amis et accès aux profils de Discord,
séparation des fils suivis de Bluesky. Les couleurs restent celles de Checkpoint.

Validation : huit tests pour les profils actuels, absents ou privés, la recherche
d’amis, l’ouverture, le retour d’erreur, les destinations de navigation et le
fil qui respecte les sections masquées. Le vrai composant SocialTab a été
vérifié dans un navigateur avec des données fictives à 390 × 844 et 1280 × 800 :
profil ami, retour, profil privé, publication locale, identité et vitrine à la
demande. Aucun compte de production n’a été modifié pour ces essais.
La compilation de production réussit. Le téléphone physique n’a pas été testé.
