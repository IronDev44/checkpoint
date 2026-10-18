const step = (title, text, points) => ({title, text, points});
export const TAB_TUTORIALS = {
  home: {label:'Accueil', summary:'Progression, prochaines parties et quiz.', steps:[
    step('Ton point de départ', 'Ton niveau et la barre d’XP ouvrent l’accueil. Plus bas, tu retrouves un aperçu de ta collection et ta prochaine session.', ['Reprends un jeu depuis sa carte.', 'Les raccourcis ouvrent directement la partie concernée de l’app.']),
    step('Avancer à ton rythme', 'Les actions proposées t’aident à compléter ta collection, tes avis ou ton matériel.', ['Actualise les propositions si elles ne te tentent pas.', 'Les récompenses sont liées aux actions accomplies, pas au nombre de fois où tu les affiches.']),
    step('Le rendez-vous quiz', 'Quelques questions reviennent chaque semaine pour tester ta culture jeu vidéo.', ['Choisis une réponse, puis valide-la.', 'Une question déjà récompensée ne rapporte pas d’XP une seconde fois.']),
    step('Tes prochains paliers', 'Les prochaines récompenses et les thèmes à débloquer suivent ta progression.', ['Le détail de ton parcours se trouve dans Profil.', 'La Salle des épreuves accompagne les grands paliers.']),
  ]},
  news: {label:'Actu', summary:'Lire les nouvelles et retrouver leur source.', steps:[
    step('Choisir une actualité', 'Parcours les cartes pour repérer un sujet qui t’intéresse.', ['Le titre et l’illustration donnent un aperçu du sujet.', 'Les actualités dépendent des sources disponibles.']),
    step('Lire la suite', 'Ouvre une actualité pour en consulter le contenu ou rejoindre sa source.', ['Le site source peut s’ouvrir en dehors de Checkpoint.', 'Reviens ensuite dans l’app pour poursuivre ta navigation.']),
    step('Faire le lien avec tes jeux', 'Un jeu te donne envie ? Retrouve-le dans Recherche.', ['Ajoute-le à ta wishlist Checkpoint pour le garder de côté.', 'Les annonces de dates se retrouvent aussi dans Sorties.']),
  ]},
  search: {label:'Recherche', summary:'Trouver, trier et ajouter un jeu.', steps:[
    step('Retrouver un titre', 'Saisis un nom, puis lance la recherche. Ouvre une carte pour en voir les détails.', ['Un titre précis aide à distinguer les suites et les rééditions.', 'Les informations peuvent varier selon le catalogue.']),
    step('Affiner les résultats', 'Ouvre les filtres pour choisir une année, une plateforme ou un genre.', ['Trie par pertinence, note, date ou nom.', 'Charge les résultats suivants si le jeu recherché n’est pas encore affiché.']),
    step('Choisir les jeux de fans', 'Le bouton « Inclure les jeux de fans » affiche les créations explicitement identifiées comme telles.', ['Ton choix est mémorisé.', 'Les titres au statut incertain restent visibles ; un mod n’est pas automatiquement un jeu de fans.']),
    step('Garder le jeu', 'Ajoute-le à ta collection si tu le possèdes, ou à ta wishlist pour plus tard.', ['Les actions de la fiche permettent de choisir sa destination.', 'Retrouve ensuite le jeu dans Bibliothèque pour suivre ta partie et donner ton avis.']),
  ]},
  upcoming: {label:'Sorties', summary:'Explorer les jeux à venir avec les bons filtres.', steps:[
    step('Voir ce qui arrive', 'Cet onglet rassemble les prochaines sorties dont la date est renseignée.', ['Les dates peuvent changer.', 'Un jeu sans date confirmée peut ne pas apparaître.']),
    step('Choisir ce qui t’intéresse', 'Utilise les filtres de plateforme, de genre et de mois pour réduire la liste.', ['« Consoles » peut inclure des jeux également prévus sur PC.', 'Réinitialise les filtres pour élargir à nouveau la sélection.']),
    step('Garder une sortie de côté', 'Ouvre un jeu pour en savoir plus ou ajoute-le à ta wishlist Checkpoint.', ['La wishlist se retrouve dans Bibliothèque.', 'L’ajout ne constitue ni une précommande ni une alerte de prix Steam ou Epic.']),
  ]},
  deals: {label:'Promos', summary:'Comparer les offres et comprendre les alertes.', steps:[
    step('Repérer une offre', 'Parcours les promotions Steam et Epic. Les boutons des boutiques permettent de consulter l’offre chez le vendeur.', ['Vérifie le prix, l’édition et la région sur la boutique.', 'Les vitrines PlayStation et Xbox ouvrent leurs pages officielles.']),
    step('Adapter les boutiques', 'Les préférences de région et de sources se règlent dans Options.', ['Le prix affiché peut évoluer entre deux actualisations.', 'Les sources disponibles n’ont pas toutes les mêmes informations.']),
    step('Distinguer les wishlists', 'Les alertes commerciales liées à Steam ou Epic concernent la wishlist de la boutique indiquée.', ['Ta wishlist Checkpoint sert à garder tes envies dans Bibliothèque.', 'Ajouter un jeu dans Checkpoint ne l’ajoute pas automatiquement chez un marchand.']),
  ]},
  live: {label:'Live', summary:'Retrouver les rendez-vous et leurs liens.', steps:[
    step('Trouver un rendez-vous', 'Les cartes présentent les lives et événements disponibles.', ['Consulte la date et l’heure avant de suivre un événement.', 'La liste dépend des rendez-vous publiés.']),
    step('Rejoindre le live', 'Ouvre la carte ou son lien pour accéder aux informations et à la diffusion.', ['Le lien peut ouvrir une plateforme externe.', 'Un événement à venir peut ne pas encore être en direct.']),
    step('Retrouver les autres nouveautés', 'Les notifications utiles restent accessibles avec la cloche en haut de l’app.', ['Actu rassemble les nouvelles du jeu vidéo.', 'Sorties présente les prochains jeux à découvrir.']),
  ]},
  social: {label:'Social', summary:'Amis, activité, photo et vitrine publique.', steps:[
    step('Suivre tes amis', 'Passe du fil de tes amis à ta propre activité et partage un moment quand tu le souhaites.', ['La rubrique Amis permet de retrouver ou d’ajouter un joueur.', 'Ouvre un ami pour consulter son profil accessible.']),
    step('Te présenter', 'Dans Mon profil, choisis ton pseudo, ta bio, ta photo et tes plateformes favorites.', ['La photo peut être recadrée avant l’enregistrement.', 'Appuie sur une photo de profil pour l’agrandir.']),
    step('Préparer ta vitrine', 'Choisis tes jeux fondateurs et les badges qui te représentent.', ['L’aperçu montre ton profil tel qu’il sera présenté aux autres.', 'Les jeux, classements et éléments choisis nourrissent la vitrine.']),
    step('Partager en choisissant la visibilité', 'Le lien de profil se copie depuis Mon profil.', ['Vérifie le réglage Privé ou Public avant de partager.', 'Partager un lien ne change pas à lui seul la visibilité du profil.']),
  ]},
  library: {label:'Bibliothèque', summary:'Organiser tes jeux et donner ton avis.', steps:[
    step('Retrouver tes jeux', 'Passe entre Collection, En cours, Wishlist et Physique selon ce que tu cherches.', ['La recherche porte sur ta bibliothèque.', 'Le tri Récent suit les derniers ajouts ; les autres tris changent l’ordre d’affichage.']),
    step('Choisir ta présentation', 'Les vues Compact, Complet et Étagère 3D présentent les mêmes jeux différemment.', ['Un filtre actif peut réduire la liste visible.', 'Ouvre une jaquette pour consulter ou modifier sa fiche.']),
    step('Raconter ton expérience', 'Indique si tu as terminé, joué ou simplement essayé le jeu. Le formulaire d’avis s’adapte.', ['Choisis ta plateforme et ton temps de jeu si tu le souhaites.', 'Les critères et la note permettent de préciser ce que tu en as pensé.']),
    step('Garder ce qui compte', 'Tu peux suivre ta progression, marquer un favori et choisir les jeux de ton Sanctuaire.', ['Les jeux fondateurs du profil se choisissent dans Social.', 'Les avis alimentent les classements et ton parcours de joueur.']),
  ]},
  series: {label:'Séries', summary:'Comprendre les épisodes suivis et ceux qui manquent.', steps:[
    step('Les sagas de ta bibliothèque', 'Les séries sont détectées à partir de tes jeux. La barre indique les épisodes terminés dans ta biblio.', ['Un remaster et son jeu d’origine ne doublent pas la progression.', 'Être à jour dans ta biblio ne signifie pas avoir terminé toute la licence.']),
    step('Voir les autres épisodes', 'Le compteur cherche aussi les titres sortis hors de ta bibliothèque.', ['Les compilations et rééditions sont écartées du catalogue des épisodes.', 'Un catalogue partiel ou indisponible est signalé.']),
    step('Compléter une série', 'Ouvre une série puis « Dans la même série… » pour voir les épisodes répertoriés.', ['Les jeux reconnus affichent leur statut.', 'Ajoute un épisode absent à ta collection ou à ta wishlist.']),
  ]},
  hardware: {label:'Matériel', summary:'Ajouter un modèle, le noter et garder son histoire.', steps:[
    step('Trouver le bon modèle', 'Choisis une catégorie, puis une marque et un appareil. La recherche aide à retrouver un modèle.', ['Les boutons de retour remontent d’un niveau dans le catalogue.', 'Les catégories couvrent les consoles et les accessoires.']),
    step('Préciser ta version', 'Ouvre le modèle pour choisir sa version et l’ajouter à ton matériel.', ['Indique l’année d’obtention si tu la connais.', 'Le statut distingue ce que tu possèdes, ce que tu as eu et ce que tu souhaites.']),
    step('Donner ton avis', 'Les critères de la fiche permettent de noter ton expérience avec l’appareil.', ['Les notes nourrissent tes classements de matériel.', 'Tu peux garder un appareil marquant dans ton Sanctuaire.']),
    step('Retrouver ton historique', 'Dans Mon matériel, utilise Tout, Actuel, Historique ou Wishlist.', ['Vendre un appareil n’efface pas le souvenir de ton équipement.', 'Le profil s’appuie aussi sur le matériel renseigné.']),
  ]},
  favorites: {label:'Sanctuaire', summary:'Choisir les jeux et objets qui comptent.', steps:[
    step('Ta sélection personnelle', 'Le Sanctuaire rassemble les jeux et le matériel que tu as choisis pour leur place dans ton parcours.', ['Ce n’est pas un classement automatique par note.', 'Tu peux aimer un objet pour le souvenir qu’il représente.']),
    step('Ajouter une pièce', 'Depuis la fiche d’un jeu ou d’un appareil, utilise son choix de Sanctuaire.', ['La sélection reste modifiable.', 'Les éléments apparaissent dans les rubriques correspondantes.']),
    step('Les montrer sur ton profil', 'La vitrine sociale peut présenter les éléments choisis pour te représenter.', ['Choisis aussi tes trois jeux fondateurs dans Social.', 'Le réglage de visibilité du profil décide de son accès public.']),
  ]},
  top5: {label:'Top 5', summary:'Notes, classements spécialisés et jeux de l’année.', steps:[
    step('Choisir ton classement', 'Passe entre jeux, matériel, bandes-son et jeux de l’année selon ce que tu veux comparer.', ['Les classements s’appuient sur les notes renseignées.', 'Une liste vide peut simplement manquer d’avis.']),
    step('Changer de point de vue', 'Les catégories permettent de comparer par plateforme, genre ou critère spécialisé.', ['Un top spécialisé utilise le critère correspondant, pas seulement la moyenne.', 'Le bouton des avis partiels décide de leur présence dans les tops concernés.']),
    step('Tes choix de l’année', 'Les GOTY personnels servent à choisir les jeux qui ont marqué tes années.', ['Ton choix personnel peut différer du jeu le mieux noté.', 'Ces moments peuvent apparaître dans la timeline du profil.']),
    step('Faire évoluer tes tops', 'Modifie une note depuis la fiche du jeu ou du matériel pour affiner les résultats.', ['Les critères non renseignés n’expriment pas un avis négatif.', 'Tu retrouves tes sélections dans ta vitrine selon les rubriques choisies.']),
  ]},
  profile: {label:'Profil', summary:'Niveau, parcours, badges et Salle des épreuves.', steps:[
    step('Ton parcours de joueur', 'Le profil rassemble ta progression, tes jeux marquants et les habitudes qui ressortent de ta collection.', ['Les informations s’enrichissent avec tes jeux, tes avis et ton matériel.', 'Ton identité publique se personnalise dans Social → Mon profil.']),
    step('Relire ta timeline', 'Filtre les moments de ton parcours par type et change l’ordre chronologique.', ['Le bouton des années permet de retrouver les périodes disponibles.', 'Les GOTY et le matériel renseigné apportent des repères à ton histoire.']),
    step('Comprendre la progression', 'L’XP fait avancer ton niveau et ouvre des récompenses.', ['La Salle des épreuves accompagne certains paliers.', 'Les actions déjà récompensées ne rapportent pas indéfiniment de l’XP.']),
    step('Choisir ce qui te représente', 'Consulte tes badges et distingue ceux que tu veux mettre en avant.', ['La sélection publique se règle dans Social.', 'La vitrine sociale est le profil à prévisualiser et partager.']),
  ]},
  options: {label:'Options', summary:'Personnalisation, services, sauvegardes et aide.', steps:[
    step('Une interface à ton goût', 'Choisis un thème, l’en-tête et les réglages sonores dans Interface.', ['Le volume et les sons se règlent ici.', 'Certains thèmes se débloquent avec la progression.']),
    step('Adapter les animations', 'Le choix de transition permet de conserver tous les effets, de les réduire ou de les désactiver.', ['Le mode réduit aide les appareils moins puissants.', 'Le choix du thème reste indépendant de ce réglage.']),
    step('Profil, services et données', 'Les sections dédiées regroupent les connexions, les imports et les sauvegardes.', ['Exporte une sauvegarde pour garder une copie de tes données.', 'La déconnexion se trouve dans Profil et services.']),
    step('Retrouver un coup de main', 'Aide et tutoriels regroupe les guides de tous les onglets.', ['Tu peux les relire autant de fois que tu veux.', 'Le formulaire de retour sert à signaler un problème ou proposer une idée.']),
  ]},
};
