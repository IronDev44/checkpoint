> Livraison du 11 novembre 2026 : corrections légales et techniques prêtes publiées sur https://checkpoint-eka.pages.dev ; déploiement https://58998b34.checkpoint-eka.pages.dev. Les mentions d’attente dans les rapports sont historiques. Voir exploitation.md. Le parcours parental et l’effacement automatique ne sont pas livrés ; les droits des visuels restent à établir.

# Préparation des informations légales — Checkpoint

Préparation du 11 novembre 2026. Les fichiers `*.brouillon.md` restent des archives internes. La version destinée au public est générée par `scripts/build-legal-pages.cjs` dans `public/legal/`, avec des liens à l’inscription et dans Options. Voir `exploitation.md` pour la procédure et les points restant à régulariser. Cette mise à jour ne constitue pas une validation de conformité.

## Situation confirmée par le créateur

Éditeur particulier installé en France, sans entreprise ni abonnement payant à ce stade. Identité communiquée par le créateur : Body Jordan. Adresse de contact confirmée : checkpoint.appgaming@gmail.com.

## Audit initial du code, avant les corrections

- Pas de pages dédiées aux mentions légales, CGU ou à la politique de confidentialité repérées dans les sources recherchées.
- Configuration par défaut : comptes activés ; données applicatives orientées vers Cloudflare D1 (`src/services/accountConfig.js`, `wrangler.toml`). Cela ne confirme pas à lui seul la configuration effectivement déployée.
- Firebase Authentication est initialisé (`src/firebase.js`). Firestore est également initialisé et peut servir de backend alternatif. Confirmer les services effectivement utilisés en production.
- Un identifiant de mesure Firebase existe dans la configuration, mais aucune activation de Google Analytics (`getAnalytics`, `gtag`) n’a été trouvée par la recherche ciblée. Ne pas confondre identifiant de configuration et collecte effectivement active. Un audit du navigateur reste nécessaire avant toute conclusion sur les traceurs.
- Des préférences locales sont lues au démarrage (`public/index.html`). Cookies, localStorage et autres stockages doivent être inventoriés par finalité, pas assimilés automatiquement à de la publicité.
- Le suivi d’usage connecté enregistre des dates de première et dernière activité liées à un identifiant de compte (`src/services/appUsage.js`, `public/usage-api.js`). Les résultats présentés au créateur sont agrégés, mais la collecte sous-jacente n’est pas anonyme. La finalité, la base légale, la durée et l’éventuelle opposition doivent être examinées.
- La visibilité des profils et de leurs rubriques est filtrée (`src/services/publicProfilePrivacy.js`). Il faut décrire séparément la découverte d’un pseudo et l’accès au contenu d’un profil.
- Un export JSON de sauvegarde est proposé dans Options (`src/App.js`). Ne pas annoncer qu’il couvre toutes les données personnelles sans en vérifier le contenu.
- Aucun parcours complet de suppression de compte et d’effacement de toutes les données associées n’a été repéré dans la recherche ciblée. La suppression d’un jeu ou la réinitialisation des options ne répond pas à ce besoin. Prévoir d’abord un traitement des demandes par contact, puis une fonction vérifiée si elle est ajoutée.

## Informations à confirmer avant publication

1. Adresse de contact confirmée et renseignée : checkpoint.appgaming@gmail.com.
2. Identité communiquée : Body Jordan. Finaliser la présentation adaptée au statut d’éditeur non professionnel. La faculté d’anonymat de la LCEN ne supprime pas les obligations distinctes d’information RGPD : ne pas promettre un anonymat total sans examen.
3. Entité juridique et coordonnées exactes de chaque prestataire ; rôle de Cloudflare et des services Google réellement actifs ; autres services sollicités par les connexions et contenus externes.
4. Localisation, transferts et garanties effectives : à vérifier dans les comptes/contrats fournisseurs, pas à déduire de l’adresse du siège de la société.
5. Durées de conservation réelles, sauvegardes, corbeille, journaux et suivi d’activité ; mécanismes d’effacement réellement exécutés.
6. Qualification des fonctionnalités sociales au regard du DSA, procédure de signalement et de modération, et public mineur éventuellement accueilli.
7. Inventaire des traceurs en production ; pas de bandeau de consentement générique avant d’identifier ceux qui en ont besoin.

## Intégration à préparer après les textes

Liens publics accessibles avant connexion et près du formulaire d’inscription ; rubrique Informations légales dans Options ; CGU datées et versionnées si acceptation contractuelle ; information sur les données au bon moment. Distinguer l’acceptation des CGU, l’information de confidentialité et les consentements facultatifs. Un bouton qui accepte tout ne régularise pas tous les traitements.

## Sources officielles consultées

- CNIL, identification du responsable et de l’hébergeur : https://www.cnil.fr/fr/cnil-direct/question/les-mentions-legales-sur-un-site-web-est-ce-obligatoire
- LCEN, article 1-1 et éditeur non professionnel : https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000801164/LEGISCTA000006117684/
- CNIL, information des personnes : https://www.cnil.fr/fr/informer-les-personnes
- CNIL, premières étapes RGPD : https://www.cnil.fr/fr/passer-laction/rgpd-les-premieres-etapes
- CNIL, cookies et conformité : https://cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/comment-mettre-mon-site-web-en-conformite
- DSA, notamment article 14 : https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32022R2065

Aucune promesse de durée, de résidence des données, de suppression automatique ou de conformité globale ne doit être publiée tant qu’elle n’est pas vérifiée.

## Vérification complémentaire

Voir [le rapport du 11 novembre](audit-2026-11-11.md) et [l’inventaire des photos](inventaire-droits-photos.csv). Les corrections complémentaires sont prêtes localement ; leur publication est en attente de l’autorisation explicite demandée après refus du contrôle automatique.

Voir également [les contrôles approfondis des images, mineurs et copies de données](controle-complementaire.md). L’outil de repérage des références est en lecture seule et ses tests utilisent uniquement des données fictives.

Le [rapport approfondi photos et logos](photos-et-logos.md) couvre désormais 1 810 fichiers locaux et distingue politiques des titulaires, provenance et preuve de permission. Voir [l’inventaire complet CSV](inventaire-visuels-complet.csv) et [les politiques examinées](politiques-visuels.json). Aucun visuel n’a été supprimé ni remplacé pendant cet audit.

Après cet audit, les [remplacements préparés localement](regularisation-visuels.md) couvrent le titre 2077 et les fichiers de marques. Le choix du traitement provisoire des photos du catalogue reste à confirmer ; aucune publication n’a été effectuée.

Le [parcours proposé pour les mineurs, la demande à Cloudflare et le périmètre de l’effacement](parcours-mineurs-et-effacement.md) tient compte du choix d’accueillir aussi les moins de 13 ans. Ces fonctions ne sont pas présentées comme déjà implémentées.
