# Défilement Android Chrome

Correction du 13 octobre 2026 : documentScroll.css garde le document HTML comme conteneur principal de défilement. Body, root et app-shell laissent le contenu vertical traverser ; overflow-x:clip évite de créer des conteneurs auto sur l’axe vertical. Un fallback overflow:visible est présent pour les navigateurs sans clip. La propagation verticale n’est plus bloquée par overscroll-behavior:none sur ces éléments.

Le contournement JavaScript global qui ajoutait window.scrollBy à chaque événement wheel a été retiré. Les fenêtres conservent leurs propres zones de défilement.

Vérification : page locale de 30 cartes avec les styles compilés de l’application, viewport 390 × 844, document de 7239 px ; un scroll natif a fait passer scrollTop de 0 à 844. Les styles calculés confirment body/root/app-shell en visible sur l’axe vertical, sans conteneur imbriqué. Contrôle également effectué au format ordinateur. Compilation réussie. Android installé sur appareil physique reste à confirmer par le testeur.

Sauvegarde préalable du fichier App.js dans .account-backups/App-before-native-scroll.js. Aucune donnée utilisateur ni configuration d’authentification modifiée.
