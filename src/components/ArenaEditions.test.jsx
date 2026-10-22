jest.mock('../services/gameCovers',()=>({...jest.requireActual('../services/gameCovers'),resolveGameCover:jest.fn(()=>new Promise(()=>{}))}));
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import ArenaTab from './ArenaTab';
import {DUEL_STORAGE_KEY} from '../services/soloDuel';
import {linkGameEditions} from '../services/gameEditions';
const games=[{id:'ps2',name:'Shadow of the Colossus',released:'2005-01-01',platformNames:['PlayStation 2']},{id:'ps3',name:'Shadow of the Colossus HD',released:'2011-01-01',platformNames:['PlayStation 3']},{id:'ps4',name:'Shadow of the Colossus (2018)',released:'2018-01-01',platformNames:['PlayStation 4']},{id:'other',name:'Another game'}];
const store=()=>{const values=new Map();return {getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};};
const openEditions=()=>fireEvent.click(screen.getByText(/Éditions des jeux ·/));
test('an approved family has one chosen representative, survives reload and starts a two-game tournament',()=>{
 const storage=store(),original=JSON.stringify(games);const view=render(<ArenaTab games={games} storage={storage}/>);openEditions();fireEvent.click(screen.getByRole('button',{name:/Relier les versions de Shadow/}));fireEvent.change(screen.getByRole('combobox',{name:/Version représentante de Shadow/}),{target:{value:'ps4'}});expect(screen.getByText('Jeux en lice').nextElementSibling).toHaveTextContent('2');view.unmount();render(<ArenaTab games={games} storage={storage}/>);expect(screen.getByText('Jeux en lice').nextElementSibling).toHaveTextContent('2');fireEvent.click(screen.getByText('Commencer le grand tournoi'));const state=JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).tournament;expect(state.roster.sort()).toEqual(['other','ps4']);expect(state.editionMode).toBe('grouped');expect(JSON.stringify(games)).toBe(original);
});
test('the explicit all-versions switch restores separate entries for a new tournament',()=>{
 const links=linkGameEditions([],['ps2','ps3','ps4'],'family','ps4');render(<ArenaTab games={games} editionLinks={links} storage={store()}/>);openEditions();fireEvent.click(screen.getByLabelText('Comparer toutes les versions dans le prochain tournoi'));expect(screen.getByText('Jeux en lice').nextElementSibling).toHaveTextContent('4');
});
test('quick duels draw the grouped candidates directly, without empty replacement slots',()=>{
 const storage=store(),links=linkGameEditions([],['ps2','ps3','ps4'],'family','ps4');render(<ArenaTab games={games} editionLinks={links} storage={storage}/>);fireEvent.click(screen.getByRole('button',{name:'Duels rapides',exact:true}));fireEvent.click(screen.getByRole('button',{name:'Commencer le tournoi · 1 duels'}));expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).tournament.roster.sort()).toEqual(['other','ps4']);
});
test('linking editions while preparing a variant retains the category and selected family after changing the representative',()=>{
 const storage=store();render(<ArenaTab games={games} storage={storage}/>);fireEvent.click(screen.getByRole('button',{name:'Variantes',exact:true}));fireEvent.click(screen.getByRole('button',{name:'Bande-son',exact:true}));openEditions();fireEvent.click(screen.getByRole('button',{name:/Relier les versions de Shadow/}));fireEvent.change(screen.getByRole('combobox',{name:/Version représentante de Shadow/}),{target:{value:'ps4'}});expect(screen.getByLabelText('Faire participer Shadow of the Colossus (2018)')).toBeChecked();fireEvent.click(screen.getByRole('button',{name:'Lancer Bande-son'}));expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).tournament).toMatchObject({variant:'soundtrack',editionMode:'grouped',roster:expect.arrayContaining(['ps4','other'])});
});
test('late edition settings do not change an already started bracket',()=>{
 const storage=store(),view=render(<ArenaTab games={games} storage={storage}/>);fireEvent.click(screen.getByText('Commencer le grand tournoi'));const before=storage.getItem(DUEL_STORAGE_KEY);view.rerender(<ArenaTab games={games} editionLinks={linkGameEditions([],['ps2','ps3','ps4'],'family','ps4')} storage={storage}/>);expect(storage.getItem(DUEL_STORAGE_KEY)).toBe(before);expect(screen.getAllByRole('button',{name:/Je préfère/})).toHaveLength(2);
});
test('manual links work for different titles and can be separated without deleting the collection',async()=>{
 render(<ArenaTab games={games} storage={store()}/>);openEditions();fireEvent.click(screen.getByText('Relier d’autres versions manuellement'));await waitFor(()=>expect(screen.getByRole('searchbox',{name:'Rechercher une version'})).toBeVisible());const boxes=screen.getAllByRole('checkbox').filter(e=>e.tagName==='INPUT');fireEvent.click(boxes[1]);fireEvent.click(boxes[2]);fireEvent.click(screen.getByRole('button',{name:'Relier les 2 versions sélectionnées'}));expect(screen.getByText('Jeux en lice').nextElementSibling).toHaveTextContent('3');fireEvent.click(screen.getByText('Séparer ces versions'));expect(screen.getByText('Jeux en lice').nextElementSibling).toHaveTextContent('4');
});
