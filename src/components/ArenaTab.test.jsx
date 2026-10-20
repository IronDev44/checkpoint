import {render,screen,fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import ArenaTab,{ArenaShortcut} from './ArenaTab';
import {DUEL_STORAGE_KEY} from '../services/soloDuel';
const games=Array.from({length:5},(_,i)=>({id:String(i),name:`Jeu ${i}`,status:'collection'}));
const store=()=>{const map=new Map();return {getItem:key=>map.get(key),setItem:(key,value)=>map.set(key,value)};};
test('the dedicated arena plays inline and restores the existing tournament without a dialog',()=>{
 const storage=store(),view=render(<ArenaTab games={games} storage={storage}/>);
 expect(screen.queryByRole('dialog')).toBeNull();expect(screen.getByText('Jeux en lice').nextElementSibling).toHaveTextContent('5');expect(screen.getByText('Duels à jouer').nextElementSibling).toHaveTextContent('4');
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

test('the invitation uses box covers and keeps the rules available without repeating them before the duel',()=>{
 const {container}=render(<ArenaTab games={[{id:'cover',name:'Box cover',cover_image:'https://example.test/cover.jpg'}, {id:'shot',name:'Gameplay only',image:'https://media.rawg.io/gameplay.jpg'}]} storage={store()}/>);
 const images=container.querySelectorAll('.arena-cover-fan img');expect(images).toHaveLength(1);expect(images[0]).toHaveAttribute('src','https://example.test/cover.jpg');
 fireEvent.error(images[0]);expect(images[0]).not.toBeVisible();expect(screen.getByText('Gameplay only')).toBeInTheDocument();
 fireEvent.click(screen.getByText('Les règles du tournoi'));expect(screen.getByText(/Tous les jeux de ta collection au lancement participent/)).toBeVisible();
 fireEvent.click(screen.getByText('Commencer le grand tournoi'));expect(screen.queryByText(/Tous les jeux de ta collection au départ, un seul vainqueur/)).toBeNull();expect(screen.getAllByRole('button',{name:/Je préfère/})).toHaveLength(2);expect(screen.queryByText('Je préfère ce jeu')).toBeNull();screen.getAllByRole('button',{name:/Je préfère/}).forEach(button=>expect(button).toHaveAccessibleDescription('Appuie sur le jeu que tu préfères pour le faire avancer.'));
});
