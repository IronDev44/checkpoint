import {render,screen,fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import ArenaTab,{ArenaShortcut} from './ArenaTab';
import {DUEL_STORAGE_KEY} from '../services/soloDuel';
const games=Array.from({length:5},(_,i)=>({id:String(i),name:`Jeu ${i}`,status:'collection'}));
const store=()=>{const map=new Map();return {getItem:key=>map.get(key),setItem:(key,value)=>map.set(key,value)};};
test('the dedicated arena plays inline and restores the existing tournament without a dialog',()=>{
 const storage=store(),view=render(<ArenaTab games={games} storage={storage}/>);
 expect(screen.queryByRole('dialog')).toBeNull();expect(screen.getByText('5 jeux · 4 duels jusqu’au gagnant ultime')).toBeVisible();
 fireEvent.click(screen.getByText('Commencer le grand tournoi'));fireEvent.click(screen.getAllByRole('button',{name:/Je préfère Jeu/})[0]);
 const saved=JSON.parse(storage.getItem(DUEL_STORAGE_KEY));view.unmount();render(<ArenaTab games={games} storage={storage}/>);
 expect(screen.getByText('Choix 2 sur 4')).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'Palmarès',exact:true}));expect(screen.getByText('Tes champions')).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Grand Tournoi',exact:true}));expect(screen.getByText('Choix 2 sur 4')).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Duels rapides',exact:true}));expect(screen.getByText(/Le tournoi en cours sera remplacé/)).toBeVisible();
 fireEvent.click(screen.getByText('Garder ce tournoi'));expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).tournament.id).toBe(saved.tournament.id);
});
test('home shortcut enters the arena and reports the saved tournament without changing it',()=>{
 const storage=store(),open=jest.fn();const view=render(<ArenaTab games={games} storage={storage}/>);fireEvent.click(screen.getByText('Commencer le grand tournoi'));fireEvent.click(screen.getAllByRole('button',{name:/Je préfère Jeu/})[0]);view.unmount();
 const before=storage.getItem(DUEL_STORAGE_KEY);render(<ArenaShortcut storage={storage} onOpen={open}/>);expect(screen.getByText('1 choix sur 4 · 4 jeux encore en lice.')).toBeVisible();fireEvent.click(screen.getByText('Reprendre mon tournoi'));expect(open).toHaveBeenCalledTimes(1);expect(storage.getItem(DUEL_STORAGE_KEY)).toBe(before);
});
