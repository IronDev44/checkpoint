# Démarrage directement sur l'intro

`AccountGate` affiche maintenant une seule instance de `StartupIntro` dès son premier rendu. Elle reste montée pendant la restauration Firebase Auth, puis pendant le chargement des données par `App`. L'écran intermédiaire « Ouverture de ton espace… » est supprimé. L'application privée ne se monte toujours qu'après la résolution de la connexion.

Le dernier thème et ses réglages visuels sont enregistrés dans `checkpoint-startup-appearance`, un indice local qui contient uniquement `theme`, `effects` et `light`. Le démarrage ne parcourt aucune sauvegarde de compte pour choisir son thème. Les profils, collections, identifiants et autres données privées restent dans leurs espaces habituels. Sans indice valide, Aurora Neon sert de défaut. Le HTML initial utilise aussi cet indice pour éviter un fond d'un autre thème avant React.

La durée minimale est de 3,6 secondes. Le chargement ne recule pas lors du passage connexion → application, et n'atteint 100 % que lorsque l'écran suivant est prêt. Une connexion lente prolonge la même intro ; elle n'en démarre pas une autre. Le bouton de fermeture n'est proposé que lorsque l'écran suivant est prêt. Une visite sans compte aboutit au formulaire de connexion ; le tutoriel des nouveaux comptes reste proposé après l'intro.

`App` signale l'avancement de ses quatre abonnements de démarrage. Après 8 secondes d'attente de ces abonnements, l'intro peut céder la place à l'app, qui continue à charger les flux. Cette limite concerne les données optionnelles ; elle ne permet jamais de monter l'app avant l'authentification. L'ancien timer de splash à 4,2 secondes est désactivé seulement pour ce démarrage géré.

Le contenu sous l'intro est temporairement `inert` et masqué aux lecteurs d'écran. Le défilement et l'accès aux contrôles reviennent à sa fermeture. La progression et son intervalle sont isolés dans `StartupIntro` pour éviter de recalculer toute l'application à chaque image.

Tests : premier écran, attente de connexion de plus de 4,2 secondes, continuité du même composant, données privées non montées avant connexion, visite sans compte, fermeture après disponibilité et conservation des parcours de connexion/récupération. L'aperçu local simule une connexion de 2,5 secondes puis un chargement des données de 3,2 secondes, sans appels à un compte réel.
