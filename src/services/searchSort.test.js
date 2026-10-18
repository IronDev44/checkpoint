import {sortSearchResults} from './searchSort';
const games=[{id:1,name:'Halo Z',rating:5,released:'2020-01-01'},{id:2,name:'Halo',rating:2,released:'2001-11-15'},{id:3,name:'Halo A',rating:4,released:'2010-01-01'},{id:4,name:'Halo sans date',rating:null,released:''}];
const ids=mode=>sortSearchResults(games,'Halo',mode).map(g=>g.id);
test('explicit sorting takes priority over a closer title match and does not mutate the source',()=>{
 expect(ids('-rating')).toEqual([1,3,2,4]);expect(ids('-released')).toEqual([1,3,2,4]);expect(ids('released')).toEqual([2,3,1,4]);expect(ids('name')).toEqual([2,3,4,1]);expect(games.map(g=>g.id)).toEqual([1,2,3,4]);
});
test('relevance favours the exact title, while missing or unconfirmed dates remain last in both directions',()=>{
 expect(ids('relevance')[0]).toBe(2);expect(sortSearchResults([{name:'Unconfirmed',released:'2030-01-01',tba:true},...games],'Halo','-released').at(-1).name).toBe('Unconfirmed');
});
test('loading another page preserves the selected sorting and relevance understands GTA',()=>{
 const page=[{id:5,name:'Halo 2',rating:3,released:'2004-11-09'}];expect(sortSearchResults([...games,...page],'Halo','released').map(g=>g.id)).toEqual([2,5,3,1,4]);
 expect(sortSearchResults([{name:'Other',rating:5},{name:'Grand Theft Auto V',rating:1}],'GTA')[0].name).toBe('Grand Theft Auto V');
});
