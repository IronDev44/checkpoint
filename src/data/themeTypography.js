// Typography is limited to the Checkpoint signature and existing transition labels.
// 2077 keeps its separate, hand-adjusted composition.
export const THEME_TYPOGRAPHY=Object.freeze({
 'theme-arcane':'spell', 'theme-stellar':'galaxy', 'theme-multiverse':'hero',
 'theme-relic':'legend', 'theme-tamer':'capture', 'theme-mushroom':'jump',
 'theme-blueblur':'speed', 'theme-blocks':'blocks', 'theme-cubic':'voxel',
 'theme-hunter':'hunter', 'theme-kart':'race', 'theme-crystal':'crystal',
 'theme-ring':'arcade', 'theme-matrix':'terminal', 'theme-wasteland':'vault',
 'theme-treasure':'voyage', 'theme-slayer':'brush', 'theme-vigilante':'vigilante',
 'theme-elden':'grace', 'theme-halo':'military', 'theme-bioshock':'deco',
 'theme-portal':'portal', 'theme-godwar':'runic', 'theme-crossing':'island',
 'theme-hollow':'hollow', 'theme-outlaw':'western', 'theme-assassin':'assassin',
 'theme-hades':'mythic', 'theme-resident':'horror', 'theme-codec':'codec',
 'theme-masseffect':'relay', 'theme-skyrim':'dragon',
 'theme-streetfighter':'fight', 'theme-splatoon':'ink', 'theme-ori':'lyrical',
 'theme-tron':'grid', 'theme-tronlegacy':'legacy', 'theme-future':'kinetic',
 'theme-jurassic':'fossil', 'theme-retro':'sunset',
});
export const getThemeTypography=theme=>THEME_TYPOGRAPHY[theme]||null;
export const themeTypographyClass=theme=>{
 const variant=getThemeTypography(theme);
 return variant?`theme-typography theme-typography--${variant}`:'';
};
