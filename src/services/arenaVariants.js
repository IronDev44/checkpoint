export const ARENA_VARIANTS=[
 {id:'visual',label:'Claque visuelle',question:'Quel jeu t’en a mis le plus plein les yeux ?',description:'Graphismes, direction artistique et beauté des décors.',symbol:'visual'},
 {id:'exploration',label:'Monde à explorer',question:'Dans quel monde as-tu le plus aimé explorer ?',description:'Lieux à découvrir, liberté et plaisir de l’exploration.',symbol:'exploration'},
 {id:'soundtrack',label:'Bande-son',question:'Quelle bande-son t’a le plus marqué ?',description:'Les musiques que tu pourrais réécouter longtemps après avoir joué.',symbol:'soundtrack'},
 {id:'story',label:'Histoire mémorable',question:'Quel jeu t’a raconté l’histoire la plus marquante ?',description:'Récit, personnages et moments qui restent en mémoire.',symbol:'story'},
 {id:'atmosphere',label:'Ambiance',question:'Quel jeu t’a le plus plongé dans son univers ?',description:'Atmosphère, identité et immersion.',symbol:'atmosphere'},
];
export const arenaVariant=id=>ARENA_VARIANTS.find(variant=>variant.id===id)||null;
// Only explicit metadata suggests an open world. RPG/adventure alone prove nothing.
export function isArenaOpenWorld(game){
 const values=['tags','keywords','themes','genres','genreNames','tagNames'].flatMap(key=>Array.isArray(game[key])?game[key]:[]);
 return game.openWorld===true||game.isOpenWorld===true||values.some(value=>{
  const name=typeof value==='string'?value:value?.name;
  return typeof name==='string'&&/^(open[\s-]?world|monde[s]? ouvert[s]?)$/i.test(name.trim());
 });
}
export function arenaGroupLabel(group){return group==='collection'?'Grand Tournoi':group==='quick'?'Duels rapides':arenaVariant(group?.replace(/^variant:/,''))?.label||'Tournoi';}
