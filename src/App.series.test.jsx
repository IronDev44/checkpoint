import {render, screen, fireEvent, waitFor, within} from '@testing-library/react';
import {GameSeriesTab} from './App';
import {loadSeriesCatalog} from './services/seriesCatalog';
jest.mock('./firebase',()=>({db:{},auth:{currentUser:{uid:'fixture'}}}));
jest.mock('./services/seriesCatalog',()=>({...jest.requireActual('./services/seriesCatalog'),loadSeriesCatalog:jest.fn()}));

const local = [
 {id:'a',name:'God of War I',completed:true},
 {id:'b',name:'God of War (2018)',completed:true},
 {id:'c',name:'God of War III',completed:true},
 {id:'d',name:'God of War III Remastered',completed:true},
 {id:'e',name:'God of War: Ragnarok',completed:true},
].map(game=>({...game,status:'collection'}));
test('The Witcher titles are never grouped into Assassin’s Creed by a subtitle',async()=>{
 loadSeriesCatalog.mockResolvedValue({games:[],complete:true});
 const games=['The Witcher','The Witcher 2: Assassins of Kings',"Assassin's Creed II","Assassin's Creed III",'The Lord of the Party','The Lord of the Party II'].map((name,i)=>({id:String(i),name,status:'collection'}));
 render(<GameSeriesTab games={games} onAddGameToLibrary={()=>{}}/>);
 const cards=[...document.querySelectorAll('.compact-series-card')];
 expect(cards.find(e=>e.querySelector('strong')?.textContent==='The Witcher')).toHaveTextContent('0/2');
 expect(cards.find(e=>e.querySelector('strong')?.textContent==='Assassin’s Creed')).toHaveTextContent('0/2');
 expect(cards.map(e=>e.querySelector('strong').textContent)).not.toContain('The Lord of the Rings');
 await screen.findAllByText('Pas d’autre titre confirmé dans le catalogue');
});
const catalog={name:'God of War',complete:true,games:[
 {id:'igdb:1',name:'God of War',released:'2005-03-22'},
 {id:'igdb:2',name:'God of War II',released:'2007-03-13'},
 {id:'igdb:3',name:'God of War III',released:'2010-03-16'},
 {id:'igdb:4',name:'God of War',released:'2018-04-20'},
 {id:'igdb:5',name:'God of War Ragnarök',released:'2022-11-09'},
]};

test('series details and suggestions agree, distinguish homonyms, and update after adding an episode',async()=>{
 loadSeriesCatalog.mockResolvedValue(catalog);
 window.scrollTo=jest.fn();
 const add=jest.fn();
 const view=render(<GameSeriesTab games={local} onAddGameToLibrary={add}/>);
 fireEvent.click(document.querySelector('.compact-series-card'));
 expect(document.querySelector('.series-detail-summary strong')).toHaveTextContent('4/4');
 expect(await screen.findByText('1 jeu répertorié à terminer · 1 hors bibliothèque')).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Dans la même série...'}));
 await screen.findByRole('heading',{name:'Les épisodes de la série'});
 await screen.findByText('God of War (2005)');
 expect(screen.getByText('God of War (2018)')).toBeVisible();
 expect(document.querySelectorAll('.already-added')).toHaveLength(4);
 const missing=screen.getByText('God of War II').closest('.series-game-row');
 fireEvent.click(within(missing).getByTitle('Collection'));
 expect(add).toHaveBeenCalledWith(expect.objectContaining({rawgId:'igdb:2',status:'collection'}));
 view.rerender(<GameSeriesTab games={[...local,{...add.mock.calls[0][0],id:'new'}]} onAddGameToLibrary={add}/>);
 await waitFor(()=>expect(document.querySelectorAll('.already-added')).toHaveLength(5));
 expect(screen.getByText('1 jeu répertorié à terminer · 0 hors bibliothèque')).toBeVisible();
 expect(document.querySelector('.series-detail-summary strong')).toHaveTextContent('4/5');
});

test('Tom Clancy sub-series are detected separately',async()=>{
 loadSeriesCatalog.mockResolvedValue({games:[],complete:true});
 const games=['Splinter Cell','Splinter Cell: Chaos Theory','Ghost Recon Wildlands','Ghost Recon Breakpoint'].map((name,i)=>({id:String(i),name:`Tom Clancy’s ${name}`,status:'collection'}));
 render(<GameSeriesTab games={games} onAddGameToLibrary={()=>{}}/>);
 expect([...document.querySelectorAll('.compact-series-card strong')].map(el=>el.textContent)).toEqual(expect.arrayContaining(["Tom Clancy's Splinter Cell","Tom Clancy's Ghost Recon"]));
 expect(document.querySelectorAll('.compact-series-card')).toHaveLength(2);
 expect(await screen.findAllByText('Pas d’autre titre confirmé dans le catalogue')).toHaveLength(2);
});

test('apostrophes and subtitles keep Spider-Man in its own series',async()=>{
 loadSeriesCatalog.mockResolvedValue({games:[],complete:true});
 const games=["Marvel’s Spider-Man","Marvel's Spider-Man: Miles Morales",'Marvel Ultimate Alliance','Marvel Ultimate Alliance 2'].map((name,i)=>({id:String(i),name,status:'collection'}));
 render(<GameSeriesTab games={games} onAddGameToLibrary={()=>{}}/>);
 expect([...document.querySelectorAll('.compact-series-card strong')].map(el=>el.textContent)).toEqual(expect.arrayContaining(["Marvel's Spider-Man",'Marvel Ultimate Alliance']));
 expect(await screen.findAllByText('Pas d’autre titre confirmé dans le catalogue')).toHaveLength(2);
});
