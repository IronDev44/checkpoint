import {GameService} from './gameService';
import {isSeriesCatalogGame,loadSeriesCatalog,seriesRemaining,dedupeSeriesGames,findSeriesLibraryMatch,seriesCatalogTitle,belongsToSeries,isSeriesLibraryEpisode} from './seriesCatalog';
import {toRawgCompatibleIgdbGame} from './igdbAdapter';
jest.mock('./gameService',()=>({GameService:{igdb:jest.fn()}}));
const game=(name,extra={})=>({name,released:'2001-01-01',...extra});
test('the adapter preserves series associations and the parent of special editions',()=>{
 const result=toRawgCompatibleIgdbGame({id:10,name:'Halo 3: Limited Edition',first_release_date:1190678400,version_parent:3,collections:[{name:'Halo'}],franchises:[{name:'Halo'}],game_type:{type:'Main Game'}});
 expect(result.normalized.versionParent).toBe(3);expect(result.normalized.collections).toEqual(['Halo']);
 expect(isSeriesCatalogGame(result,'Halo')).toBe(false);
});
test('the catalogue counts released episodes without DLC, reissues or unrelated games',()=>{
 expect(isSeriesCatalogGame(game('Halo 2'),'Halo')).toBe(true);
 expect(isSeriesCatalogGame(game('Halloween'),'Halo')).toBe(false);
 expect(isSeriesCatalogGame(game('Halo DLC',{normalized:{gameType:{type:'DLC / Addon'}}}),'Halo')).toBe(false);
 expect(isSeriesCatalogGame(game('Halo remastered'),'Halo')).toBe(false);
 expect(isSeriesCatalogGame(game('Halo 4: Limited Edition'),'Halo')).toBe(false);
 expect(isSeriesCatalogGame(game('Halo and Pixy',{franchises:[{name:'Other franchise'}]}),'Halo')).toBe(false);
 expect(isSeriesCatalogGame(game('Chasing Halo'),'Halo')).toBe(false);
 expect(isSeriesCatalogGame(game('Halo 2',{released:'2100-01-01'}),'Halo')).toBe(false);
 expect(isSeriesCatalogGame(game('Middle-earth: Shadow of War'),'Middle-earth')).toBe(true);
});
test('remaining includes owned unfinished games and titles outside the library, and recognises completed remasters',()=>{
 const catalog={games:[game('Halo'),game('Halo 2'),game('Halo 3')]};
 const local=[game('Halo Remastered',{completed:true}),game('Halo 2')];
 expect(seriesRemaining(catalog,local,g=>g.completed)).toEqual({remaining:2,outside:1});
});
test('catalogue pagination is deduplicated and cached, and a cancelled view makes no provider request',async()=>{
 GameService.igdb.mockResolvedValueOnce({results:[game('Portal'),game('Portal 2')],next:'page2'}).mockResolvedValueOnce({results:[game('Portal 2'),game('Portal DLC',{igdbCategory:1})],next:null});
 const catalog=await loadSeriesCatalog('Portal');
 expect(catalog.games.map(g=>g.name)).toEqual(['Portal','Portal 2']);expect(catalog.complete).toBe(true);
 expect((await loadSeriesCatalog('Portal'))).toBe(catalog);expect(GameService.igdb).toHaveBeenCalledTimes(2);
 const controller=new AbortController();controller.abort();await expect(loadSeriesCatalog('Uncharted',{signal:controller.signal})).rejects.toHaveProperty('name','AbortError');expect(GameService.igdb).toHaveBeenCalledTimes(2);
});

const gowCatalog = [
 game('God of War',{id:'igdb:1',released:'2005-03-22'}),
 game('God of War II',{id:'igdb:2',released:'2007-03-13'}),
 game('God of War III',{id:'igdb:3',released:'2010-03-16'}),
 game('God of War',{id:'igdb:4',released:'2018-04-20'}),
 game('God of War Ragnarök',{id:'igdb:5',released:'2022-11-09'}),
];
const gowLibrary = [
 game('God of War I',{completed:true}),
 game('God of War II',{completed:true}),
 game('God of War III',{completed:true}),
 game('God of War III Remastered',{completed:true,released:'2015-07-14'}),
 game('God of War (2018)',{completed:true}),
 game('God of War: Ragnarok',{completed:true}),
];

test('God of War matches accents, punctuation, first episode and dated reboot without double-counting remasters',()=>{
 const catalog={name:'God of War',games:gowCatalog};
 expect(dedupeSeriesGames(gowLibrary,catalog.name,g=>g.completed)).toHaveLength(5);
 expect(seriesRemaining(catalog,gowLibrary,g=>g.completed)).toEqual({remaining:0,outside:0});
 expect(findSeriesLibraryMatch(gowCatalog[0],gowLibrary,catalog.name,gowCatalog).name).toBe('God of War I');
 expect(findSeriesLibraryMatch(gowCatalog[3],gowLibrary,catalog.name,gowCatalog).name).toBe('God of War (2018)');
 expect(seriesCatalogTitle(gowCatalog[0],gowCatalog)).toBe('God of War (2005)');
 expect(seriesCatalogTitle(gowCatalog[3],gowCatalog)).toBe('God of War (2018)');
});

test('a completed first episode does not complete or own the reboot',()=>{
 expect(seriesRemaining({name:'God of War',games:[gowCatalog[0],gowCatalog[3]]},[gowLibrary[0]],g=>g.completed)).toEqual({remaining:1,outside:1});
 expect(findSeriesLibraryMatch(gowCatalog[0],[gowLibrary[4]],'God of War',gowCatalog)).toBeNull();
 expect(dedupeSeriesGames([gowCatalog[0],gowCatalog[3]],'God of War')).toHaveLength(2);
});

test('edition completion carries to the episode, without affecting the library records',()=>{
 const local=[game('Halo 2'),game('Halo II Remastered',{completed:true}),game('Halo Collection',{completed:true})];
 const deduped=dedupeSeriesGames(local.filter(isSeriesLibraryEpisode),'Halo',g=>g.completed);
 expect(deduped).toHaveLength(1);expect(deduped[0].completed).toBe(true);expect(local).toHaveLength(3);
 expect(seriesRemaining({name:'Halo',games:[game('Halo 2')]},local,g=>g.completed)).toEqual({remaining:0,outside:0});
});

test('catalogue and library exclude compilations, fans and DLC; branded sub-series remain separate',()=>{
 for(const title of ['God of War Saga','God of War Origins Collection','God of War Trilogy']) {
  expect(isSeriesCatalogGame(game(title),'God of War')).toBe(false);
  expect(isSeriesLibraryEpisode(game(title))).toBe(false);
 }
 expect(isSeriesCatalogGame(game('Halo Fans',{keywords:['fan game']}),'Halo')).toBe(false);
 expect(belongsToSeries(game("Tom Clancy's Ghost Recon Wildlands"),"Tom Clancy's Splinter Cell")).toBe(false);
 expect(belongsToSeries(game('Splinter Cell: Chaos Theory'),"Tom Clancy's Splinter Cell")).toBe(true);
});

test('cross-provider numeric ids cannot mark an unrelated game as owned',()=>{
 expect(findSeriesLibraryMatch(game('Halo 3',{id:'igdb:12'}),[game('Halo 2',{rawgId:12})],'Halo')).toBeNull();
 expect(findSeriesLibraryMatch(game('Changed title',{id:'igdb:12'}),[game('Original title',{rawgId:'igdb:12'})],'Halo')).not.toBeNull();
});
