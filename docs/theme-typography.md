# Titres adaptés aux univers

Mise à jour du 16 novembre 2026.

40 thèmes disposent d’une signature typographique. Chaque signature utilise désormais sa propre famille de caractères ; leurs sources et empreintes sont conservées ; aucune police 2077 ni donnée de collection n’a été modifiée.

`src/data/themeTypography.js` associe les univers à une composition typographique. `ThemeWordmark` est partagé entre l’en-tête et leurs introductions. Les libellés existants des transitions GameUniverse et PopCulture reprennent leur famille de titre ; aucune scène ou animation n’est remplacée et aucune transition sans titre ne reçoit un titre supplémentaire.

Le titre reste Checkpoint. Les styles utilisent des polices avec leurs sources et documents conservés, ainsi que des traitements de couleur, relief, contour et espacement. Ce ne sont pas des logos officiels ni une garantie de reproduction exacte des titres des jeux. Le reste de l’interface garde ses polices de lecture.

Les signatures Checkpoint, Premium, Ultime et 2077 conservent leur rendu spécifique. Les thèmes abstraits et les thèmes de plateformes non associés conservent leur titre existant.

Les polices sont intégrées depuis `src/assets/fonts/themes` et servies localement sous les URL versionnées du build ; les licences et sources sont sous `public/fonts/themes`, sans ajout de connexion Google Fonts à l’ouverture de l’application. Elles sont chargées à l’usage, sans préchargement de toutes les familles. `sources.json` conserve les URL d’origine, empreintes, tailles et dates ; les licences OFL des familles Google Fonts et le readme original de Harry P sont joints.

## Familles distinctes

Harry Potter utilise désormais Harry P (lettres anguleuses et traits en éclair inspirés des titres des livres), Zelda Cinzel Decorative (lettres décoratives) et Final Fantasy GFS Didot (empattements fins). Les autres familles partagées ont aussi été séparées, y compris Matrix / Metal Gear, Halo / Mass Effect, God of War / Skyrim, Tron / Tron Legacy et Pac-Man / Arcade Sunset. Les formes des lettres changent réellement, en plus de leur traitement de couleur et de relief.

| Signature | Famille |
| --- | --- |
| spell | Harry P |
| legend | cinzeldecorative |
| crystal | gfsdidot |
| voyage | pirataone |
| grace | cinzel |
| deco | limelight |
| runic | caesardressing |
| hollow | cormorantsc |
| assassin | forum |
| mythic | skranji |
| lyrical | eaglelake |
| dragon | almendra |
| hero | anton |
| capture | rowdies |
| jump | bungee |
| speed | racingsansone |
| race | fugazone |
| island | lilitaone |
| western | rye |
| ink | rubikwetpaint |
| kinetic | bangers |
| fossil | bowlbyonesc |
| blocks | russoone |
| voxel | pressstart2p |
| arcade | monoton |
| sunset | silkscreen |
| hunter | audiowide |
| vault | oswald |
| vigilante | blackopsone |
| military | rajdhani |
| portal | michroma |
| horror | bebasneue |
| relay | exo2 |
| terminal | sharetechmono |
| codec | teko |
| brush | caveatbrush |
| fight | sedgwickavedisplay |
| galaxy | Orbitron |
| grid | monofett |
| legacy | oxanium |

Les 38 familles de thème Google Fonts sont conservées sans modification dans les fichiers TTF d’origine du [dépôt officiel Google Fonts](https://github.com/google/fonts). Harry P provient de [la fiche de GemFonts sur DaFont](https://www.dafont.com/harry-p.font), où elle est proposée « 100% Free » ; son archive inclut un readme de conception, sans licence OFL. Le readme, l’auteur, la source et l’empreinte sont conservés ; cette mention ne constitue pas une autorisation sur la marque Harry Potter. Orbitron reste la quarantième famille, déjà présente dans l’application. Les documents et liens individuels figurent dans public/fonts/themes/sources.json et les fichiers associés. Aucune requête Google Fonts n’est ajoutée au navigateur.

## Vérifications

Compilation de production réussie. Tests ciblés des signatures, de l’intro avant connexion, des libellés de transition et de la préservation du thème 2077. Planche des 40 titres contrôlée dans le navigateur, sans débordement à taille de comparaison uniforme ; en-tête et introductions représentatives vérifiés à 390 × 844 et 320 × 740, notamment Harry Potter, Zelda et Final Fantasy. Les tailles utilisent la largeur réelle de leur conteneur et les proportions mesurées de chaque police, y compris l’espace réservé à la cloche. Les 40 en-têtes ont été contrôlés sans débordement ; le cas large Portal a aussi été contrôlé dans l’interface à 320 px.

Cette recette ne constitue pas une inspection exhaustive de chaque scène et chaque transition sur tous les appareils. Les captures de contrôle locales sont sous `.account-backups/theme-wordmarks-differentiated.png` (comparatif final), `.account-backups/theme-wordmarks-gallery.png` et `.account-backups/theme-wordmarks-mobile.png` (première passe) ; les données affichées sont fictives et isolées de la production.

## Ajustement Harry Potter

Harry P remplace Grenze Gotisch uniquement pour theme-arcane. Le titre conserve un contraste doré, un relief léger et les mêmes lettres dans l’introduction et l’en-tête. La taille et le coefficient de largeur ont été réajustés pour ses proportions propres. Source originale : https://www.dafont.com/harry-p.font ; readme conservé sous public/fonts/themes/harry-p-readme.txt.
