export const NEW_GAME_THEMES = [
 {id:"theme-masseffect",label:"Mass Effect · Carte galactique",chrome:"#07121f",motif:"masseffect",universe:"MASS EFFECT",kicker:"CAP SUR L’INCONNU",subtitle:"Chaque escale a son histoire.",transition:"SAUT GALACTIQUE"},
 {id:"theme-skyrim",label:"Skyrim · Aurores du Nord",chrome:"#131c20",motif:"skyrim",universe:"SKYRIM",kicker:"PAR-DELÀ LES SOMMETS",subtitle:"Reprends la route, à ton rythme.",transition:"LE SOUFFLE DU NORD"},
 {id:"theme-streetfighter",label:"Street Fighter · Dernier round",chrome:"#1c1024",motif:"streetfighter",universe:"STREET FIGHTER",kicker:"ENTRE DANS L’ARÈNE",subtitle:"La prochaine partie est à toi.",transition:"NOUVEAU ROUND"},
 {id:"theme-splatoon",label:"Splatoon · Guerre des couleurs",chrome:"#17152a",motif:"splatoon",universe:"SPLATOON",kicker:"À TOI DE COLORER LA SUITE",subtitle:"Tes jeux, toutes leurs couleurs.",transition:"UNE NOUVELLE COULEUR"},
 {id:"theme-ori",label:"Ori · Forêt des lumières",chrome:"#061e23",motif:"ori",universe:"ORI",kicker:"LA FORÊT S’ÉVEILLE",subtitle:"Une lumière pour ta prochaine aventure.",transition:"AU FIL DES LUEURS"},
];
export const NEW_GAME_MOTIFS=new Set(NEW_GAME_THEMES.map(theme=>theme.motif));
