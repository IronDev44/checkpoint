import {GameService} from './gameService';
import {isSeriesCatalogGame,loadSeriesCatalog,seriesRemaining} from './seriesCatalog';
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
