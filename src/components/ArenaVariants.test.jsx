jest.mock('../services/gameCovers',()=>({...jest.requireActual('../services/gameCovers'),resolveGameCover:jest.fn(()=>new Promise(()=>{}))}));
import {render,screen,fireEvent,within} from '@testing-library/react';
import '@testing-library/jest-dom';
import ArenaTab from './ArenaTab';
import ArenaVariants from './ArenaVariants';
import {DUEL_STORAGE_KEY,chooseDuel,startDuel} from '../services/soloDuel';
const games=[{id:'a',name:'Alpha',genreNames:['RPG']},{id:'b',name:'Beta',tags:[{name:'Open World'}]},{id:'c',name:'Céleste'},{id:'wish',name:'Wish',status:'wishlist'}];
const store=()=>{const values=new Map();return {getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};};
test('browsing variants does not replace an existing bracket and starting one requires confirmation',()=>{
 const storage=store();render(<ArenaTab games={games} storage={storage}/>);fireEvent.click(screen.getByText('Commencer le grand tournoi'));const original=storage.getItem(DUEL_STORAGE_KEY);
 fireEvent.click(screen.getByRole('button',{name:'Variantes',exact:true}));expect(storage.getItem(DUEL_STORAGE_KEY)).toBe(original);fireEvent.click(screen.getByRole('button',{name:'Bande-son',exact:true}));fireEvent.click(screen.getByRole('button',{name:'Lancer Bande-son'}));expect(screen.getByRole('group',{name:'Remplacer le tournoi en cours'})).toBeVisible();expect(storage.getItem(DUEL_STORAGE_KEY)).toBe(original);
 fireEvent.click(screen.getByRole('button',{name:'Garder mon tournoi'}));expect(storage.getItem(DUEL_STORAGE_KEY)).toBe(original);fireEvent.click(screen.getByRole('button',{name:'Lancer Bande-son'}));fireEvent.click(screen.getByRole('button',{name:'Remplacer et lancer la variante'}));
 const saved=JSON.parse(storage.getItem(DUEL_STORAGE_KEY));expect(saved.tournament.variant).toBe('soundtrack');expect(saved.tournament.roster).toHaveLength(3);expect(screen.getByRole('progressbar',{name:'Progression — Bande-son'})).toBeVisible();expect(screen.getByText('Quelle bande-son t’a le plus marqué ?')).toBeVisible();screen.getAllByRole('button',{name:/Je préfère/}).forEach(button=>expect(button).toHaveAccessibleDescription(/Quelle bande-son/));fireEvent.click(screen.getByText('Les règles du tournoi'));expect(screen.getByText('Seuls les jeux que tu as sélectionnés participent une fois, hors wishlist.')).toBeVisible();
});
test('open worlds are explicitly suggested; unknown titles can be added without including wishlist games',()=>{
 const onStart=jest.fn();render(<ArenaVariants games={games} onStart={onStart}/>);fireEvent.click(screen.getByRole('button',{name:'Monde à explorer',exact:true}));expect(screen.getByLabelText('Faire participer Beta')).toBeChecked();expect(screen.queryByLabelText('Faire participer Alpha')).toBeNull();expect(screen.getByRole('button',{name:'Lancer Monde à explorer'})).toBeDisabled();
 fireEvent.click(screen.getByLabelText('Afficher seulement les mondes ouverts repérés'));expect(screen.getByLabelText('Faire participer Alpha')).not.toBeChecked();fireEvent.click(screen.getByLabelText('Faire participer Alpha'));expect(screen.queryByLabelText('Faire participer Wish')).toBeNull();fireEvent.click(screen.getByRole('button',{name:'Lancer Monde à explorer'}));expect(onStart).toHaveBeenCalledWith('exploration',expect.arrayContaining(['a','b']));
});
test('search is accent insensitive and never silently removes hidden selected games',()=>{
 const onStart=jest.fn();render(<ArenaVariants games={games} onStart={onStart}/>);fireEvent.change(screen.getByRole('searchbox'),{target:{value:'celeste'}});expect(screen.getByLabelText('Faire participer Céleste')).toBeChecked();expect(screen.queryByLabelText('Faire participer Alpha')).toBeNull();fireEvent.click(screen.getByLabelText('Faire participer Céleste'));fireEvent.click(screen.getByRole('button',{name:'Lancer Claque visuelle'}));expect(onStart).toHaveBeenCalledWith('visual',['a','b']);
});
test('variant results survive reload and show a dedicated palmares without entering the Grand Tournoi',()=>{
 const storage=store();let tournament=startDuel(['a','b'],'collection','soundtrack');tournament=chooseDuel(tournament,'a');storage.setItem(DUEL_STORAGE_KEY,JSON.stringify({tournament,history:[]}));render(<ArenaTab games={games} storage={storage}/>);expect(screen.getByText('Quelle bande-son t’a le plus marqué ?')).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'Palmarès',exact:true}));
 const group=screen.getByRole('region',{name:'Palmarès — Bande-son'});expect(within(group).getByRole('heading',{name:'Alpha',exact:true})).toBeVisible();expect(within(screen.getByRole('region',{name:'Palmarès — Grand Tournoi'})).queryByText('Alpha')).toBeNull();
});
test('large selections can be reviewed incrementally and start without truncating the hidden results',()=>{
 const many=Array.from({length:37},(_,i)=>({id:String(i),name:`Game ${String(i).padStart(2,'0')}`})),onStart=jest.fn();render(<ArenaVariants games={many} onStart={onStart}/>);expect(screen.getAllByRole('checkbox')).toHaveLength(12);fireEvent.click(screen.getByRole('button',{name:/Afficher plus de jeux/}));expect(screen.getAllByRole('checkbox')).toHaveLength(24);fireEvent.click(screen.getByRole('button',{name:'Lancer Claque visuelle'}));expect(onStart.mock.calls[0][1]).toHaveLength(37);
});
