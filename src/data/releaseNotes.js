// New releases go first. Published IDs stay stable: reading a patch note and
// discovering a feature are tracked independently, per account on this device.
export const RELEASE_NOTES = [{
 id:'2026-10-social-community',date:'2026-10-24',title:'Un social plus personnel et mieux protégé',
 summary:'Profils réservés aux amis, fil filtré et signalements confidentiels.',
 changes:[
  {title:'Amis uniquement',where:'Social → Profil public → Identité et partage',text:'Entre privé et public, réserve ta vitrine à tes amis confirmés. Le lien du profil respecte ce choix.'},
  {title:'Un fil à ton goût',where:'Social → Fil et Amis',text:'Filtre les activités et masque celles d’un ami sans couper le contact. Retrouve les amis masqués dans les réglages sociaux.'},
  {title:'Signaler un profil ou une publication',where:'Social → Profil ou Fil',text:'Choisis un motif et ajoute des précisions si nécessaire. Le propriétaire reçoit le signalement dans son accès développeur ; le joueur signalé ne le voit pas.'},
  {title:'Des demandes plus simples à gérer',where:'Social → Amis',text:'Recherche une invitation par nom ou identifiant. Les refus imposent des délais croissants et trois refus empêchent de nouvelles relances de ce joueur.'},
 ],fixes:['Le masquage d’un ami conserve son profil, l’amitié et les échanges.','Un ancien lien ne permet pas de contourner la visibilité du profil.'],
},{
 id:'2026-10-friend-invitations',date:'2026-10-24',title:'Un cercle d’amis plus complet',
 summary:'Invitations, confidentialité, réactions et jeux en commun.',
 changes:[{title:'Accepter ou refuser une invitation',where:'Social → Amis',text:'Envoie une invitation avec un identifiant public. Retrouve les demandes reçues et envoyées, accepte ou refuse les invitations, et annule celles que tu as envoyées. La cloche signale les demandes et les acceptations.'},
  {title:'Choisir qui peut te contacter',where:'Social → Amis → Contacts et confidentialité',text:'Désactive les invitations, recommandations, défis ou réactions. Bloque un joueur depuis son profil ou la liste d’amis, et retrouve ta liste de blocage dans ces réglages.'},
  {title:'Partager un jeu et réagir',where:'Fiche d’un jeu et Social → Fil',text:'Partage un jeu à un ami directement depuis sa fiche. Dans le fil, réagis avec « Bien joué », « Ça me tente » ou « Excellent choix ». Une réaction peut être changée ou retirée.'},
  {title:'Comparer vos collections',where:'Social → Amis → Nos jeux en commun',text:'Active le partage de ta collection avec tes amis si tu le souhaites. Comparez vos jeux, ceux terminés par un seul et les possibilités de coop. Les notes et avis privés restent masqués.'}],
 fixes:['Les nouvelles invitations ne créent plus d’amitié sans réponse. Les amis déjà enregistrés sont conservés.'],
},{
 id:'2026-10-physical-sync',date:'2026-10-23',title:'Tes boîtes et tes parties, mieux reliées',
 summary:'Scanner les jeux physiques et consulter les relevés Steam et Xbox.',
 changes:[
  {title:'Scanner un jeu physique',where:'Recherche ou Bibliothèque → Scanner un jeu physique',text:'Lis le code-barres avec la caméra ou saisis ses chiffres, puis vérifie le titre, la plateforme et l’édition avant l’ajout. Une boîte peut être associée à une fiche existante.'},
  {title:'Les relevés de tes plateformes',where:'Fiche du jeu → Activité Steam et Xbox',text:'Retrouve les temps de jeu et les succès disponibles. Demande un nouveau relevé, vérifie-le, puis choisis de l’enregistrer sans modifier tes notes ni ton statut Terminé.'},
  {title:'Des imports plus clairs',where:'Options → Profil & services',text:'Les données absentes ne sont plus remplacées par zéro. L’historique Xbox peut être chargé en plusieurs pages et reste distinct d’une liste complète d’achats.'},
 ],
 fixes:['Un import de wishlist Steam conserve les temps de jeu déjà enregistrés.','Le temps de jeu récupéré sur Steam reste séparé de la durée que tu renseignes toi-même.'],
},{
 id:'2026-10-rendezvous',date:'2026-10-23',title:'De nouveaux rendez-vous, et des jeux à partager',
 summary:'Votes de la semaine, pronostics, souvenirs et recommandations entre amis.',
 changes:[
  {title:'Les nouveautés et leurs guides',where:'Options → Nouveautés et Aide et tutoriels',text:'Retrouve les ajouts de chaque mise à jour. À ta première visite dans un onglet enrichi, un guide court présente ses nouvelles fonctions.'},
  {title:'Les rendez-vous Checkpoint',where:'Accueil → Pour toi → Les rendez-vous',text:'Vote pour ton jeu préféré de la semaine, retrouve les finales mensuelles et fais tes pronostics sur les événements gaming.'},
  {title:'Expéditions et souvenirs',where:'Accueil → Les rendez-vous',text:'Découvre de courts parcours sur l’histoire du jeu vidéo et retrouve les moments datés de ta collection.'},
  {title:'Le passage de témoin',where:'Social → Recommandations',text:'Recommande un jeu à un ami avec un petit mot. Il peut le garder pour plus tard et te répondre.'},
  {title:'Les choix cachés',where:'Social → Défis',text:'Propose deux jeux et une question à un ami. Vos réponses ne se dévoilent qu’après vos deux choix.'},
 ],
 fixes:['Les fenêtres restent ouvertes pendant un enregistrement.','Les actualisations sociales et le changement de compte sont mieux protégés.','L’import des actualités évite les doublons.'],
}];

export const FEATURE_TUTORIALS = [{
 id:'rendezvous-home-v1',releaseId:'2026-10-rendezvous',tab:'home',label:'Les rendez-vous Checkpoint',
 steps:[
  {title:'Le vote de la semaine',text:'Dans Pour toi, ouvre « Les rendez-vous », puis « Sélections ». Choisis un jeu parmi les quatre proposés.',points:['Tu peux changer de vote jusqu’à la clôture. Les résultats apparaissent après ton choix ou à la fin du vote.','Les gagnants rejoignent une finale mensuelle. Ce vote reste séparé de tes notes et de ton Arène.']},
  {title:'Faire un pronostic',text:'Dans « Pronostics », tente de prévoir une annonce ou le résultat d’un événement gaming.',points:['Ton choix est modifiable avant la clôture ; les réponses des autres restent cachées jusque-là.','Le résultat sera confirmé avec sa source. S’il n’y a aucun pronostic ouvert, le prochain sera annoncé dans la cloche.']},
  {title:'Une expédition, comment ça marche ?',text:'Dans « Expéditions », choisis un parcours disponible, puis appuie sur « Partir en expédition ». Chaque parcours raconte un petit morceau de l’histoire du jeu vidéo.',points:['Lis la courte introduction, puis réponds à deux questions. Après chaque réponse, une explication apparaît : appuie sur « Continuer » pour avancer.','À la fin, tu peux voter pour le jeu que tu préfères parmi ceux proposés, ou choisir « Terminer sans vote communautaire ». Ce vote est facultatif.','Quand tu termines, le parcours garde un souvenir de ta participation, même si tu as fait des erreurs. Il ne rapporte pas d’XP. Tu peux le revoir quand tu veux ; si tu quittes avant la fin, tu devras le recommencer.']},
  {title:'Retrouver tes souvenirs de jeux',text:'La rubrique « Souvenirs » est différente des expéditions : elle revient sur les moments datés de ta propre collection.',points:['Les souvenirs utilisent les dates connues de tes jeux.','Tu peux ajouter ce que tu en penses aujourd’hui. Ce petit mot reste privé et ne remplace pas ton avis initial.']},
 ]
},{
 id:'friend-exchanges-social-v1',releaseId:'2026-10-rendezvous',tab:'social',label:'Recommandations et choix cachés',
 steps:[
  {title:'Passer le témoin à un ami',text:'Dans « Recommandations », choisis un jeu de ta collection, un ami et quelques mots pour expliquer ce qui pourrait lui plaire.',points:['Ton ami peut garder le message dans « À découvrir », puis te donner son avis. Cela n’ajoute pas automatiquement le jeu à sa bibliothèque.','Seuls le titre et ton message sont partagés avec cet ami, même si ta collection est privée.']},
  {title:'Comparer vos choix sans vous influencer',text:'Dans « Défis », propose deux jeux et une question, puis choisis ton préféré.',points:['Ton ami répond sans voir ton choix. Les deux réponses sont ensuite révélées ensemble ; vous pouvez en discuter.','Sans deuxième réponse, le défi expire après sept jours et le choix adverse reste caché. Vos notes et vos tournois ne changent pas.']},
 ]
}];


FEATURE_TUTORIALS.push({
 id:'friend-invitations-social-v1',releaseId:'2026-10-friend-invitations',tab:'social',label:'Les invitations d’amis',steps:[
  {title:'Choisir tes amis',text:'Dans Social → Amis, recherche un joueur par son pseudo, puis ouvre son profil ou appuie sur « Inviter ». Pour envoyer une invitation, active ton profil public ou réservé aux amis : ton adresse est créée automatiquement.',points:['Dans « Reçues », accepte ou refuse une invitation. Après acceptation, vous apparaissez dans vos listes respectives.','Dans « Envoyées », retrouve tes demandes en attente et annule-les si besoin. Les amis déjà enregistrés restent dans ta liste.']},
  {title:'Garder la main sur les échanges',text:'La cloche signale les invitations et leur acceptation. Dans « Amis → Contacts et confidentialité », règle ce que tu souhaites recevoir.',points:['Pour échanger des recommandations, des défis et des réactions, vous devez tous les deux avoir accepté d’être amis. Si tu avais ajouté ce joueur avant la mise en place des invitations, ouvre « Gérer cet ami » et clique sur « Confirmer l’amitié » pour lui envoyer une invitation.','Tu peux bloquer un joueur depuis sa carte ou son profil, puis le débloquer dans les réglages. Le débloquer ne restaure pas l’amitié.']},
  {title:'Partager et jouer ensemble',text:'Dans le fil, réagis aux activités d’un ami. Depuis une fiche de jeu, « Partager à un ami » lui envoie ton titre et ton petit mot.',points:['Pour voir vos bibliothèques en commun, chacun choisit d’activer le partage de sa collection dans les réglages sociaux. Ce partage est désactivé par défaut ; les avis et notes privés ne sont pas transmis.','Ouvre « Nos jeux en commun » sur la carte d’un ami pour repérer vos jeux, ceux terminés par un seul et les modes coop renseignés. Une plateforme commune ne garantit pas le cross-play.']},
 ]
},{
 id:'physical-scanner-search-v1',releaseId:'2026-10-physical-sync',tab:'search',label:'Scanner une boîte de jeu',steps:[
  {title:'Ajouter un jeu en scannant sa boîte',text:'Ouvre « Scanner un jeu physique », autorise la caméra ou saisis les chiffres sous le code-barres.',points:['Vérifie le titre proposé, la plateforme et l’édition avant de confirmer. Si le code est inconnu, cherche le jeu par son nom.','Si le jeu est déjà dans ta bibliothèque, choisis la fiche à compléter. Ses notes et sa progression sont conservées.']},
 ]
},{
 id:'physical-platform-library-v1',releaseId:'2026-10-physical-sync',tab:'library',label:'Boîtes physiques et relevés de plateformes',steps:[
  {title:'Associer une boîte à ta collection',text:'Le bouton « Scanner un jeu physique » est aussi dans la Bibliothèque. Un jeu déjà présent peut recevoir sa boîte sans créer un doublon.',points:['Confirme la plateforme et l’édition. Un exemplaire déjà marqué comme physique n’est pas remplacé.','Une boîte associée à un jeu en wishlist le fait passer dans ta collection.']},
  {title:'Vérifier les relevés Steam et Xbox',text:'Dans la fiche d’un jeu importé, déplie « Activité Steam et Xbox » pour consulter les informations disponibles.',points:['« Actualiser les données » prépare un aperçu. Tu décides ensuite de l’enregistrer ou de conserver l’ancien relevé.','Les succès et le temps de jeu ne modifient ni tes notes, ni ta durée saisie, ni ton statut Terminé. Une donnée inconnue reste indiquée comme non communiquée.']},
 ]
},{
 id:'platform-services-options-v1',releaseId:'2026-10-physical-sync',tab:'options',label:'Vérifier les imports Steam et Xbox',steps:[
  {title:'Relier tes jeux aux plateformes',text:'Dans « Profil & services », ouvre la gestion des services. Steam utilise ton profil public ; Xbox propose une connexion Microsoft.',points:['Analyse les jeux puis vérifie l’import avant de confirmer les fiches à ajouter ou synchroniser. Les correspondances par titre demandent ta confirmation.','La liste Xbox concerne les activités de succès, pas tous tes achats. « Charger la suite des titres Xbox » complète les pages disponibles.']},
 ]
});

FEATURE_TUTORIALS.push({id:'social-community-v1',releaseId:'2026-10-social-community',tab:'social',label:'Confidentialité, fil et signalements',steps:[
{title:'Un profil réservé aux amis',text:'Dans Profil public → Identité et partage, choisis Privé, Amis uniquement ou Public.',points:['Amis uniquement donne accès à tes amis confirmés, y compris via le lien du profil. Retirer un ami retire aussi cet accès.','Ton nom et ton identifiant restent présents dans les invitations que tu envoies. Les rubriques désactivées restent masquées à tes amis.']},
{title:'Un fil qui te convient',text:'Le fil des amis reste classé du plus récent au plus ancien. Filtre les jeux terminés, notes et avis, nouveaux ajouts ou publications.',points:['Les jeux terminés utilisent les dates de fin renseignées, sans inventer de date pour les anciennes parties.','Dans Amis → Gérer cet ami, masque ses activités sans le bloquer. Réaffiche-les depuis sa carte ou Contacts et confidentialité.']},
{title:'Signaler un problème',text:'Depuis un profil ou une publication, appuie sur Signaler, choisis un motif et ajoute des précisions si besoin.',points:['Le propriétaire de Checkpoint reçoit le contenu signalé et ton identifiant pour examiner le problème. Le joueur signalé ne voit pas ton signalement.','Le signalement ne supprime pas automatiquement le contenu. Si tu souhaites arrêter les contacts, utilise aussi Bloquer.']},
{title:'Retrouver les demandes en attente',text:'Dans Amis, recherche les invitations par nom ou identifiant. Accepte, refuse ou bloque depuis une demande reçue.',points:['Après un refus, le joueur doit attendre un jour ; après le deuxième, sept jours. Trois refus empêchent de nouvelles relances de sa part.','Une invitation annulée ne peut pas être renvoyée immédiatement. Ces limites protègent les deux côtés et ne retirent pas les amis existants.']}
]});
