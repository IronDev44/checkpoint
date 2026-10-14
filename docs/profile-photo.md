# Photo de profil

Social → Mon profil → Identité et partage → Identité publique permet d’ajouter,
changer ou retirer une photo. L’image est recadrée au centre en carré de 320 px
et encodée en JPEG avant enregistrement. Les fichiers illisibles, SVG et les
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

Validation : 15 tests couvrent le traitement de l’image, l’ajout, le retrait,
les erreurs de lecture, les initiales de secours et l’actualisation des amis.
Le vrai SocialTab a été essayé à 390 × 844 avec une image publique de test :
import via le sélecteur de fichiers, JPEG 320 × 320, affichage dans l’en-tête et
la vitrine, retrait. Pas de débordement à 1280 × 800. Compilation réussie.
Les essais interactifs utilisent un profil fictif local, sans écriture sur un
compte de production ; la synchronisation réelle entre deux appareils n’a pas
été testée directement.
