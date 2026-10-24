# Le cercle social

## Parcours

- La cloche signale une invitation reçue et l’acceptation d’une invitation envoyée. Le bouton mène à Social → Amis. La catégorie « Invitations et nouveaux amis » peut être désactivée dans Options → Notifications.
- Social → Amis → Contacts et confidentialité contrôle les invitations, recommandations, défis et réactions. Les contacts hors invitations exigent une relation acceptée sur le serveur, ou une ancienne amitié réellement réciproque. Les simples entrées locales ne suffisent plus. Une ancienne liste unilatérale peut être confirmée par invitation depuis sa carte.
- « Bloquer » sur une carte d’ami ou un profil demande confirmation. Le blocage s’applique côté serveur dans les deux sens pour les profils et échanges. Débloquer ne rétablit pas l’amitié.
- « Partager à un ami » dans la fiche d’un jeu possédé ouvre un formulaire de recommandation, sans changer d’onglet. Seuls le titre et un message explicite sont envoyés. L’identifiant d’envoi reste identique après une erreur réseau pour éviter les doublons.
- Le fil d’amis propose trois réactions réelles : Bien joué, Ça me tente, Excellent choix. Un compte peut avoir une seule réaction par activité, la remplacer ou la retirer. L’auteur peut consulter les totaux sur ses activités publiées. Les anciens boutons de likes locaux ne sont pas affichés dans ce parcours.
- « Nos jeux en commun » ouvre la comparaison autorisée par un ami. Le partage de collection est désactivé par défaut et doit être choisi dans les réglages sociaux. Seuls les titres, plateformes, modes et statuts sont partagés. Les fiches supprimées et wishlist sont exclues, ainsi que notes, avis, souvenirs et identifiants privés des fiches. Les statuts inconnus ne sont pas considérés comme des jeux non terminés. La vitrine publique reste une sélection, distincte d’une bibliothèque partagée.

## Serveur et confidentialité

Les routes authentifiées `socialControls`, `socialReactions` et `sharedGames` sont traitées par le Worker D1 ; aucune de ces collections internes n’est accessible à l’API générique. Les UID proviennent uniquement du jeton vérifié et des profils stockés. Les réglages et blocages sont privés au compte. Les réactions vérifient que l’activité est toujours publiée et autorisée par les réglages faisant autorité. Les totaux n’exposent pas l’identité des votants.

Un blocage masque également les invitations, recommandations, défis et sondages reçus de ce joueur. Les échanges déjà ouverts ne permettent pas de contourner un blocage en répondant à un ancien identifiant. La suppression d’une amitié interdit les nouveaux échanges, sans effacer leur historique ; le blocage masque cet historique.

Les confirmations d’amitié antérieures restent stockées ; un contrôle serveur vérifie les autorisations à chaque action. Les demandes de réglages concurrentes utilisent une comparaison de version. Les chargements périmés sont ignorés au changement de compte ou au démontage des vues.

Pas de notification système/push, de nouvelle dépendance ou de migration obligatoire. Les fichiers frontend et Worker doivent être publiés ensemble. Les tests de bout en bout utilisent uniquement des comptes fictifs en mémoire, sans envoi à des joueurs réels.

Validation : scripts `test-social-safety-api.mjs`, `test-friendships-api.mjs`, `test-social-moments-api.mjs`, `test-rendezvous-api.mjs` et `test-account-api.mjs` ; tests React des réglages, confirmations, partage après erreur, réactions, comparaison et notifications.

Résultat du contrôle local du 24 octobre 2026 : 118 suites React et 820 tests réussis, compilation de production validée, scripts API réussis. Dans Chrome, vérification de la cloche et de son lien vers les demandes, comparaison de collections, filtre de progression, réaction persistée, envoi depuis une fiche, réglage de contact, blocage et déblocage. Formats 320 × 740, 390 × 844 et 844 × 390 contrôlés sans débordement horizontal de la page. Comptes de test fictifs ; pas de validation sur téléphone physique.

## Confidentialité et modération

Le mode friends (« Amis uniquement ») est vérifié côté serveur pour chaque lecture de profil, y compris la liste des profils, les réactions et le partage de collection. Les réglages privés faisant autorité et les rubriques désactivées continuent de limiter les données. Une invitation ne suffit pas à ouvrir la vitrine ; seuls le nom et l’identifiant sont présentés si le profil est réservé aux amis. La révocation de l’amitié retire cet accès.

Le masquage du fil est enregistré dans socialControls.muted, sans modifier la relation ni interdire les échanges. Les filtres du fil sont appliqués avant la limite de résultats. Un événement de fin de jeu utilise uniquement une date completedAt connue.

Les signalements passent par socialReports. Leur contenu est vérifié sur le profil ou la publication accessible au déclarant ; les rubriques privées ne sont pas copiées. Le serveur conserve un extrait avec le motif, les précisions et l’identité du déclarant. Seul ACCOUNT_OWNER_UID peut consulter les pages de 50 signalements et changer leur suivi. Aucun joueur ne peut consulter les signalements reçus ni usurper leur auteur. Les doublons pour un même contenu sont fusionnés, avec vingt signalements par compte et par jour au maximum. Un contenu modifié peut être signalé à nouveau. Le suivi ne retire pas automatiquement les contenus.

Les refus sont conservés par paire et par expéditeur, même après suppression ou inversion du sens de la demande : un jour après le premier, sept jours après le deuxième, aucune nouvelle relance après trois refus. Une acceptation explicite réinitialise ces refus. Les annulations imposent une heure avant relance. Les invitations se recherchent par nom ou identifiant, avec leur date.

Vérifications supplémentaires : scripts/test-social-community-api.mjs et tests SocialCommunity, en plus des tests de confidentialité précédents.
