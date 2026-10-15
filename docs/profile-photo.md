# Photo de profil

Social → Mon profil → Identité et partage → Identité publique permet d’ajouter,
changer ou retirer une photo. Le choix d’une image ouvre maintenant un aperçu :
on peut la déplacer, ajuster le zoom de 100 à 400 %, pincer avec deux doigts,
utiliser les flèches du clavier et revenir au cadrage initial avec « Recentrer ».
La photo ne remplace l’ancienne qu’après « Enregistrer la photo » ; « Annuler »
conserve la photo précédente. L’export est un carré JPEG de 512 px. Le calcul
du cadre affiché est partagé avec celui des pixels exportés.

« Recadrer » permet aussi de modifier une photo existante. Le fichier d’origine
reste uniquement en mémoire pendant l’édition : pour élargir un cadrage déjà
enregistré, il faut sélectionner à nouveau l’original. Les fichiers illisibles, SVG et les
images de plus de 20 Mo sont refusés avec un message ; la photo précédente reste.

`socialProfile.photoURL` utilise le stockage privé et la synchronisation des
paramètres déjà existants. Le champ est inclus dans la sauvegarde et dans le
document public uniquement lorsque le profil est publié. Aucun nouvel hébergeur
d’images n’est nécessaire.

La photo est affichée dans l’en-tête Social, le profil joueur, la vitrine publique
et les auteurs du fil des amis. La liste d’amis relit les profils publics par
groupes de 20 pour actualiser les photos au lieu de réutiliser une copie périmée.
Un profil devenu privé ne réaffiche pas son ancienne photo en cache. En cas
d’image manquante, l’avatar revient aux initiales.

Toucher une photo dans le profil joueur, un profil public ou l’éditeur l’ouvre
en grand, avec déplacement et zoom. La visionneuse affiche l’image entière au
départ et ne modifie pas la photo enregistrée. Les petits avatars qui servent
déjà à ouvrir un profil gardent ce rôle, sans imbriquer de boutons.

Les fenêtres sont rendues dans un portail au-dessus de la navigation, avec
fermeture par croix, Échap ou clic sur le fond. Le focus reste dans la fenêtre,
puis revient au bouton d’origine. Le contenu de fond est inactif et le défilement
est rétabli à la fermeture. Les commandes restent visibles sur petit écran ;
le contenu de l’éditeur peut défiler indépendamment si nécessaire.

Validation : tests du traitement d’image, des limites de cadrage sur images
portrait/paysage/carrées, du pincement, du déplacement, de la validation, de
l’annulation, des erreurs, du focus et de la compatibilité des avatars.
Essais des vrais composants à 390 × 844, 320 × 568 et au format ordinateur :
ouverture en grand depuis l’éditeur, le profil joueur et le profil public ;
import via le sélecteur de fichiers, déplacement dans le cadre et JPEG 512 × 512
enregistré avec le cadrage choisi. Le pincement est couvert par une simulation
de deux pointeurs dans les tests ; pas d’essai sur un téléphone physique.
Les essais interactifs utilisent un profil fictif local, sans écriture sur un
compte de production ; la synchronisation réelle entre deux appareils n’a pas
été testée directement.
