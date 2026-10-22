jest.mock('../services/gameCovers',()=>({...jest.requireActual('../services/gameCovers'),resolveGameCover:jest.fn(()=>new Promise(()=>{}))}));
import {render,screen,fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import ArenaTab from './ArenaTab';
import {DUEL_STORAGE_KEY} from '../services/soloDuel';
const games=Array.from({length:24},(_,i)=>({id:String(i),name:`Jeu ${i}`,status:'collection'}));
const store=()=>{const map=new Map();return {getItem:key=>map.get(key),setItem:(key,value)=>map.set(key,value)};};
test('ten real choices pause, survive reload, and resume without changing the bracket',()=>{
 const storage=store();let view=render(<ArenaTab games={games} storage={storage}/>);fireEvent.click(screen.getByText('Commencer le grand tournoi'));
 fireEvent.click(screen.getByText('Je ne sais pas choisir'));expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).tournament.choices).toBe(0);
 for(let i=0;i<10;i++)fireEvent.click(screen.getAllByRole('button',{name:/Je préfère Jeu/})[0]);
 expect(screen.queryAllByRole('button',{name:/Je préfère Jeu/})).toHaveLength(0);expect(screen.getByText('Dix choix, une pause bien méritée.')).toBeVisible();const saved=storage.getItem(DUEL_STORAGE_KEY);view.unmount();view=render(<ArenaTab games={games} storage={storage}/>);expect(screen.getByText('Dix choix, une pause bien méritée.')).toBeVisible();
 fireEvent.click(screen.getByText('Continuer · session de 10 choix maximum'));expect(screen.getAllByRole('button',{name:/Je préfère Jeu/})).toHaveLength(2);expect(storage.getItem(DUEL_STORAGE_KEY)).toBe(saved);expect(screen.getByText('Session · 0/10 choix')).toBeVisible();
});
test('last pair offers a pause, then final takes precedence and exposes sharing and path',()=>{
 render(<ArenaTab games={games.slice(0,2)} storage={store()}/>);fireEvent.click(screen.getByText('Commencer le grand tournoi'));fireEvent.click(screen.getByText('Je ne sais pas choisir'));expect(screen.getByText(/Ce duel est le dernier de ce tour/)).toBeVisible();fireEvent.click(screen.getByText('Continuer · session de 10 choix maximum'));fireEvent.click(screen.getAllByRole('button',{name:/Je préfère Jeu/})[0]);
 expect(screen.getByText(/Finaliste : Jeu/)).toBeVisible();expect(screen.getByText('Enregistrer le récapitulatif')).toBeVisible();fireEvent.click(screen.getByText('Parcours des jeux de ce tournoi'));expect(screen.getByText('Vainqueur du tournoi')).toBeVisible();expect(screen.getByText(/Victoire contre/)).toBeVisible();
});
