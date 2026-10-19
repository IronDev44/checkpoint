# Duel solo, avis avec spoilers et notifications utiles

## Duel « Mon préféré ? »
Accueil → Mon préféré ?. Bloc réorganisable/masquable. Jeux de collection uniquement, terminés ou non ; wishlist exclue. Filtres plateforme, genre, série détectée et coups de cœur. Tournois de 2/4/8 jeux ; si la sélection est trop petite, proposition de la puissance de deux inférieure. Tirage sans remise, liste vérifiable avec remplacements avant le départ. Un gagnant par paire, puis demi-finales/finale : N−1 choix.

Retour au choix précédent pendant la session. Reprise du tournoi et huit derniers gagnants enregistrés dans accountStorage sur cet appareil, séparés par compte. L’historique de retour arrière n’est pas conservé après fermeture de l’onglet navigateur. Les résultats n’affectent ni les notes, ni les favoris, ni l’XP ; aucun partage social du duel dans cette version. Une fiche supprimée rend la reprise invalide et une nouvelle sélection est proposée. Les jeux sans jaquette utilisent une initiale.

## Avis protégés
Éditeur de la fiche de jeu : sélectionner un passage puis « Masquer la sélection » ajoute les marqueurs texte `[spoiler]...[/spoiler]`. Option pour protéger l’avis entier. Aperçu avant sauvegarde. Avis, protection globale et choix de partage sont enregistrés ensemble via persistPatch.

Le texte masqué n’est pas rendu dans le DOM avant un clic sur Révéler le spoiler ; il peut être remasqué. Interprétation texte uniquement, sans HTML. Les marqueurs imbriqués ou non refermés restent cachés. Les extraits publics conservent la protection même à la limite de longueur. Utilisé dans le fil Social, l’activité du profil public et le fil des amis. Les extraits simples de l’accueil ne révèlent pas de contenu balisé.

Le choix « Afficher cet avis dans mon activité publique » permet de publier l’extrait lorsque le profil et l’activité sont visibles. Les avis des anciens jeux notés ne sont pas nouvellement publiés automatiquement. Pour compatibilité, les anciens avis non notés qui apparaissaient déjà dans l’activité gardent ce comportement jusqu’au choix explicite de l’utilisateur. Les nouvelles entrées ont un partage désactivé par défaut. Le masquage évite les spoilers dans l’interface ; les extraits publiés restent téléchargeables par un lecteur autorisé.

## Notifications
Cloche existante : invitation à un sondage tant que le joueur n’a pas voté ; résultat d’un sondage terminé pour son créateur et ses participants ; bilan du mois précédent si une activité datée existe. Ouvrir une invitation/résultat arrive directement dans Social → Sondages et cible la carte. Un bilan ouvre le mois exact dans une fenêtre, même si le bloc de l’accueil est masqué.

Options → Notifications : sondages, bilan, jeux sans note, sorties/wishlist, progression, disponibilité des sources. Préférences enregistrées avec les options privées existantes. Notifications masquées enregistrées par compte sur l’appareil (clé v2 sans reprise de l’ancienne clé globale). Aucune notification système, e-mail ou permission de navigateur.

Lectures de sondages au démarrage connecté, au retour sur l’appli et toutes les cinq minutes lorsqu’elle est visible, avec limitation des rafraîchissements et délai réseau de 15 secondes. Actualisation après une modification de sondage dans cette fenêtre. Les erreurs de lecture n’empêchent pas d’utiliser la collection. Les anciens résultats de plus de 30 jours ne créent plus de rappel. La cloche conserve au maximum 20 cartes visibles.

## Validation
Tests des brackets, sélection, reprise locale, annulation, absence d’écriture sur les jeux, spoilers incomplets/imbriqués/extraits, révélation et préférences. Tests d’intégration du véritable éditeur et des liens depuis la cloche vers sondage et bilan. Vérification navigateur local sur les composants réels avec données synthétiques en 390 × 844 et 844 × 390. Aucun test physique iPhone/Android ni déploiement.
