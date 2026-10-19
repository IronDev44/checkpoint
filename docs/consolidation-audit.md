# Audit et consolidation — 19 octobre 2026

## Corrections confirmées

### Confidentialité
- Le serveur renvoyait les champs des rubriques masquées ; l’interface les cachait seulement. Un filtre partagé avec l’aperçu enlève maintenant photos, jeux fondateurs, vitrine, matériel et activité désactivés. Les chemins indirects (héros, analyse, timeline, matériel dans la vitrine) sont filtrés aussi.
- Les lectures des profils publics appliquent les derniers réglages privés du propriétaire : une copie publique ancienne ne peut pas réactiver une rubrique masquée. Un profil privé n’est pas renvoyé à un autre compte, en lecture directe ou dans une liste.
- Les champs non déclarés dans le contrat public ne sont pas exposés. Le code partagé est copié vers le Worker par `npm run prebuild`.
- Le changement Public/Privé n’est confirmé localement qu’après réponse du serveur. Les échecs de mise à jour publique sont affichés avec possibilité de réessayer. Les écritures publiques sont sérialisées avec le changement de visibilité : une ancienne écriture en cours termine avant la suppression du profil.

### Réglages et données
- Les réglages privés n’avaient pas de file durable hors ligne. Ils l’utilisent désormais, avec sauvegarde des seuls champs modifiés, base de comparaison et résolution des conflits. Un changement sur un autre appareil ne doit pas effacer un réglage indépendant.
- Les préférences en attente sont rejouées avant une lecture en ligne, ou superposées à la copie locale si un conflit ou une coupure persiste. Une lecture initiale échouée sans copie connue ne remplace pas les réglages distants par des valeurs par défaut.
- Un changement de compte pendant une requête interdit la remise de la réponse au nouveau compte.
- Les dates techniques `updatedAt` ne créent pas de faux conflits entre réglages indépendants. Les dates métier restent protégées.
- La résolution d’un conflit de réglages recharge la version choisie dans l’interface. Les réglages n’apparaissent jamais dans la corbeille.
- Les notifications masquées utilisaient un identifiant de stockage absent, dont l’erreur était interceptée silencieusement. Elles sont maintenant conservées dans le stockage du compte.
- L’accusé « conservé sur cet appareil, synchronisation en attente » remonte aux éditeurs. Une sauvegarde automatique de réglages n’efface plus l’action Annuler d’une modification de jeu.

### Accueil et performances
- Les cinq activités (suggestion de partie, redécouverte, duel, bilan, quiz) ont des accès courts dans Pour toi ; seule celle ouverte est montée. L’affichage séparé reste disponible dans la personnalisation.
- Bibliothèque Compact/Complet : 48 cartes au départ, puis par lots de 48. Les tris, filtres, sélection en lot et navigation des fiches conservent toute la collection. L’étagère 3D reçoit toujours tous les jeux. Images chargées à la demande.
- Les écritures d’un lot ne rechargent plus toute la collection après chaque document ; le cache local et un rafraîchissement final sont utilisés. Les séries détectées sont réutilisées sur l’accueil.
- Les comptes ordinaires ne tentent plus l’import d’actualité réservé au propriétaire au démarrage.

## Vérifications effectuées
- Suite Jest complète : 494 tests réussis, 74 suites. Tests ajoutés : données privées hors réponse/aperçu, réglages par champs, changement de compte pendant une requête, conflits, reprise après coupure, retours d’enregistrement, accès aux activités, pagination de bibliothèque et progression du quiz après réouverture.
- `node scripts/test-account-api.mjs` : SQLite réel en mémoire, identités différentes, profils masqués/privés et deux appareils simulés écrivant des réglages différents. Aucun accès aux données de production.
- `node scripts/test-feedback-api.mjs` et `node scripts/test-offline-shell.cjs` : droits de la boîte de retours et exclusion des API privées du cache public.
- Navigateur réel local, compte et 602 jeux synthétiques : 601 jeux en collection, 48 puis 96 cartes montées ; sélection et réglage modifiés avec API indisponible, rechargement de l’app, conservation des deux modifications, retour du réseau et vidage de la file.
- Contrôle de l’accueil en portrait 390 × 844 et paysage 844 × 390. Compilation de production.

## Limites pratiques
Aucun essai physique sur l’Android modeste ou l’iPhone de l’utilisateur, ni mesure comparative de FPS sur ces appareils. La coupure navigateur simule l’indisponibilité de l’API ; le rechargement totalement sans serveur est couvert par le test du service worker. Le duel solo, les copies automatiques, les photos de setup/collection et la liste des notifications masquées restent spécifiques à l’appareil ; les phrases, sélections à rejouer et réglages sont synchronisés par compte. Aucun commit, push ou déploiement dans cette tâche.
