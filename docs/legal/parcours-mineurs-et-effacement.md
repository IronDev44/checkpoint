# Mineurs, identification chez l’hébergeur et effacement

Préparation du 11 novembre 2026. Le créateur confirme souhaiter accueillir aussi les enfants de moins de 13 ans. Cette note propose un fonctionnement ; elle ne met pas en service un parcours parental ni un effacement automatisé. Aucun compte réel n’a été modifié et aucune demande n’a été envoyée à Cloudflare.

## Parcours recommandé pour les moins de 15 ans

Prévoir un espace enfant créé et administré par un parent, consacré d’abord à la collection privée. L’enfant ne doit pas être contraint de créer un compte social public pour utiliser sa collection. Le fait que le parent crée l’espace n’exonère pas du traitement licite et proportionné des données de l’enfant.

- Présenter au parent les données nécessaires au service, les responsabilités, les finalités facultatives et les possibilités de retrait. Distinguer la capacité à conclure le contrat de l’accord conjoint sur les traitements fondés sur le consentement.
- Définir une assurance d’âge et d’autorité parentale proportionnée au risque, avant ouverture du service enfant en ligne. Un lien e-mail prouve l’accès à cette boîte, pas l’autorité parentale. Ne pas annoncer une vérification accomplie à partir d’une simple case ou d’un e-mail. Ne pas collecter par défaut pièces d’identité, photo du visage ou date de naissance complète.
- Pour les très jeunes enfants, le parent pilote le service. Adapter les explications et l’association de l’enfant aux décisions à sa maturité ; ne pas demander un consentement fictif à un enfant incapable de le comprendre. Définir les situations réellement prises en charge avant l’ouverture, sans assimiler « moins de 13 ans » à une admission sans limite d’âge.
- État enfant : collection privée, profil absent des recherches et des annuaires, pas de lien public, d’invitation extérieure, de partage, de réaction ni de défi social. Les médias intégrés tiers et la mesure facultative restent désactivés dans cette première version. Le social ne s’ouvre pas simplement parce qu’un parent a cliqué « accepter » : qualifier séparément ses risques et les règles applicables.
- Recueillir les accords nécessaires par finalité, avec version des informations et date, sans autorisation générale de tout traitement. Permettre l’opposition de l’autre titulaire de l’autorité parentale et le retrait. Ne pas limiter les droits de l’enfant à l’action du parent.
- Conserver un statut serveur non modifiable par le client et protéger les API, la recherche, les profils partagés et les invitations déjà en cours. Les versions antérieures de l’application ne doivent pas contourner ces règles.
- Prévoir un parcours pour les comptes existants, le changement de parent, les situations de désaccord, le retrait et le passage à 15 ans. Ne pas rendre un profil public automatiquement à un anniversaire.

**Point qui demande un choix supplémentaire avant développement complet :** la méthode réelle d’assurance d’âge et d’autorité parentale. Il faut comparer sa fiabilité, les données qu’elle collecte, son coût éventuel et ses garanties, puis faire examiner le parcours retenu. Aucun prestataire ni service payant n’a été choisi.

Sources : [CNIL, accord parental et capacité contractuelle](https://www.cnil.fr/fr/recommandation-4-rechercher-le-consentement-dun-parent-pour-les-mineurs-de-moins-de-15-ans), [CNIL, vérification proportionnée](https://www.cnil.fr/fr/recommandation-7-verifier-lage-de-lenfant-et-laccord-des-parents-dans-le-respect-de-sa-vie-privee).

## Coordonnées auprès de Cloudflare

L’article 1-1 II de la LCEN conditionne la faculté de ne pas publier l’identification personnelle d’un éditeur non professionnel à sa communication à l’hébergeur. Aucun champ dédié à cette démarche n’a été confirmé dans le compte. Une adresse de facturation ou un simple e-mail ne constituent pas, à eux seuls, la preuve de l’accomplissement de cette formalité. [Texte LCEN](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049568614/).

Passer par le support officiel du compte pour demander comment transmettre et faire enregistrer ces renseignements. La documentation indique que les demandes de compte restent accessibles aux comptes gratuits, contrairement à l’assistance technique générale. Les libellés exacts dépendent de l’interface ; ne pas inventer un champ LCEN ou une catégorie garantie. [Support Cloudflare](https://developers.cloudflare.com/support/contacting-cloudflare-support/).

Ne pas publier les coordonnées personnelles sur le forum communautaire. Demander d’abord le canal privé approprié et les renseignements exacts requis. Conserver la réponse et la confirmation de réception. Si Cloudflare ne propose pas de procédure satisfaisante, examiner une autre solution d’identification ou d’hébergement avant d’annoncer cette formalité remplie.

### Message prêt à copier, non envoyé

Subject: Private publisher identification for a Cloudflare Pages site — French LCEN Article 1-1 II

Hello,

I operate https://checkpoint-eka.pages.dev/ on Cloudflare Pages as a private, non-professional publisher based in France.

Article 1-1 II of the French LCEN provides for communicating the publisher’s personal identification details to the hosting provider when those details are not publicly displayed. I cannot find a dedicated procedure in my dashboard.

Could you confirm the appropriate private channel to submit the required details, which information is needed, and how you can confirm that it has been received and associated with my Pages project? Please also confirm the hosting entity and contact details I should use in the site’s legal notice.

I have not included my home address in this initial message. Please advise how to provide the necessary information securely.

Thank you,
Body Jordan — Checkpoint
checkpoint.appgaming@gmail.com

## Effacement lors de la suppression du compte

La cible est un effacement des données actives, pas une mise en corbeille indéfinie. La suppression de l’utilisateur Firebase seule laisse actuellement des données applicatives : D1, index, références sociales, retours et copies locales. Un lien mail et la procédure manuelle existent ; aucun bouton d’effacement automatique complet n’est actuellement validé.

### Contrat attendu pour une future fonction

1. Vérifier l’identité et demander une réauthentification récente. Présenter la portée et le caractère irréversible, avec possibilité d’export avant confirmation, sans imposer cet export.
2. Geler le compte côté serveur, bloquer les jetons encore valables et les écritures des anciens clients. Arrêter les travaux hors ligne et les captures de sauvegardes sur l’appareil courant ; propager l’état aux autres appareils lors de leur prochaine connexion.
3. Exécuter une tâche serveur authentifiée, persistante, reprenable et idempotente. Ne pas dépendre d’une page qui doit rester ouverte. Une erreur à mi-parcours doit laisser le compte bloqué et permettre la reprise, pas annoncer un succès.
4. Effacer les documents propres, le profil public et ses index, la progression et les statistiques. Traiter les demandes d’amitié, les listes d’audience, les votes et les réactions stockés chez d’autres comptes ou dans les documents partagés. Supprimer ou rendre réellement anonymes les éléments concernés tout en préservant les droits et données des autres joueurs ; ne pas supprimer arbitrairement leur contenu.
5. Examiner les retours KV, les échanges d’assistance et les signalements identifiables. Toute conservation exceptionnelle nécessaire à une obligation ou à un litige doit être limitée, motivée et annoncée, pas cachée derrière une promesse de tout effacer sans exception.
6. Supprimer Firebase Authentication et vérifier l’absence d’accès actif et de profil trouvable. L’accès administratif nécessaire doit être configuré côté serveur avec des permissions limitées, jamais exposé au navigateur. Aucun secret n’a été créé pour cette note.
7. Effacer les caches, les écritures en attente, les préférences de compte et les sauvegardes IndexedDB de l’appareil accessible. Un navigateur ne peut pas supprimer à distance un export téléchargé ou le stockage d’un autre appareil déconnecté ; l’information utilisateur doit le préciser.
8. Informer du résultat et de la durée résiduelle vérifiée des sauvegardes fournisseurs. Empêcher une restauration de réintroduire les données effacées. Une trace minimale de l’effacement peut être nécessaire pendant ce cycle ; définir sa finalité, ses accès et sa purge, sans conserver la collection supprimée.

### Recette nécessaire, sur données fictives

Tester un utilisateur ayant des jeux, éditions matérielles, corbeilles, profil public, anciens pseudos, invitations, amis, sondages et votes chez d’autres joueurs, défis, réactions, retours et sauvegardes locales. Vérifier aussi les jetons encore valables, les écritures hors ligne d’un second appareil, les interruptions et reprises, un changement de compte pendant l’effacement et une restauration de sauvegarde. Le compte d’un autre utilisateur et ses données sans rapport doivent rester intacts.

La suppression du compte ne règle pas toute la conservation : les données d’un compte actif, les comptes abandonnés, les retours et les signalements nécessitent aussi des durées et des purges définies. [CNIL, étapes RGPD](https://www.cnil.fr/fr/passer-laction/rgpd-les-premieres-etapes).

## État à la fin de cette préparation

Public enfant confirmé, code de stockage et de suppression examiné, proposition et message support rédigés. Pas de parcours parental déployé, pas de bouton d’effacement total ajouté, aucun compte effacé, aucun message envoyé et aucune publication effectuée.
