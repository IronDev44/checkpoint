import {getCatalogueId,selectCatalogueMatch,toCatalogueGame} from './catalogueGame';
test('only explicit provider IDs can open a catalogue entry',()=>{
 expect(getCatalogueId({id:'123'})).toBe('');
 expect(getCatalogueId({id:'local',rawgId:42})).toBe('42');
 expect(getCatalogueId({id:'local',rawgId:'igdb:7'})).toBe('igdb:7');
 expect(getCatalogueId({sourceIds:{igdb:7}})).toBe('igdb:7');
 expect(getCatalogueId({rawgId:'../users'})).toBe('');
});
test('an unlinked edition requires a unique exact match and matching release year',()=>{
 const candidates=[{name:'DOOM',released:'1993-12-10',sourceIds:{igdb:1}},{name:'Doom',released:'2016-05-13',sourceIds:{igdb:2}}];
 expect(selectCatalogueMatch({name:'DOOM',released:'2016-05-13'},candidates)).toBe(candidates[1]);
 expect(selectCatalogueMatch({name:'DOOM'},candidates)).toBeNull();
 expect(selectCatalogueMatch({name:'Doom Eternal'},candidates)).toBeNull();
 expect(selectCatalogueMatch({name:'DOOM',released:'2020'},candidates)).toBeNull();
});
test('personal ratings never replace the catalogue rating',()=>{
 expect(toCatalogueGame({name:'Halo',rawgId:42,rating:9,image:'cover',platformNames:['PC']})).toMatchObject({id:'42',rating:0,background_image:'cover',platforms:[{platform:{name:'PC'}}]});
});
