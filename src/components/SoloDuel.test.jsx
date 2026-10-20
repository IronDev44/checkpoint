import React from 'react';
import {render,screen,fireEvent,waitFor,within,act} from '@testing-library/react';
import '@testing-library/jest-dom';
import SoloDuel from './SoloDuel';
import SpoilerText from './SpoilerText';
import {NotificationPreferences,useUsefulUpdates} from './UsefulUpdates';
const games=Array.from({length:8},(_,i)=>({id:String(i),name:`Jeu ${i}`,status:'collection',genreNames:['RPG'],platformNames:['PC']}));
const store=()=>{const map=new Map();return {getItem:key=>map.get(key),setItem:(key,value)=>map.set(key,value)};};
test('plays a solo tournament, permits undo, preserves game data and resumes privately',async()=>{
 const storage=store(),original=JSON.stringify(games);const view=render(<SoloDuel games={games} storage={storage}/>);fireEvent.click(screen.getByText('Lancer un duel'));fireEvent.click(screen.getByText('Commencer le tournoi · 7 duels'));
 for(let i=0;i<7;i++)fireEvent.click(screen.getAllByRole('button',{name:/Je préfère Jeu/})[0]);expect(screen.getByText(/TON GAGNANT/)).toBeInTheDocument();expect(JSON.stringify(games)).toBe(original);
 fireEvent.click(screen.getByText('Revenir au choix précédent'));expect(screen.getByText('Finale')).toBeInTheDocument();expect(screen.getAllByRole('button',{name:/Je préfère Jeu/})).toHaveLength(2);
 fireEvent.click(screen.getByLabelText('Fermer'));view.unmount();render(<SoloDuel games={games} storage={storage}/>);fireEvent.click(await screen.findByText('Reprendre mon duel'));expect(screen.getByText('Finale')).toBeInTheDocument();
});
test('empty filters never include wishlist games or start an incomplete bracket',()=>{
 render(<SoloDuel games={[...games.slice(0,1),{id:'wish',name:'Wish',status:'wishlist'}]} storage={store()}/>);fireEvent.click(screen.getByText('Lancer un duel'));expect(screen.getByText(/Il faut au moins deux jeux/)).toBeInTheDocument();expect(screen.queryByText(/Commencer le tournoi/)).not.toBeInTheDocument();
});
test('spoiler content is absent from the DOM until explicitly revealed and can be hidden again',()=>{
 const view=render(<SpoilerText text="Prose [spoiler]Secret final[/spoiler] fin"/>);expect(screen.queryByText('Secret final')).not.toBeInTheDocument();expect(view.container.textContent).toContain('Prose');fireEvent.click(screen.getByText('Révéler le spoiler'));expect(screen.getByText('Secret final')).toBeInTheDocument();fireEvent.click(screen.getByText('Masquer le spoiler'));expect(screen.queryByText('Secret final')).not.toBeInTheDocument();view.rerender(<SpoilerText text="Avis entier" whole/>);expect(screen.queryByText('Avis entier')).not.toBeInTheDocument();
});
test('notification preferences preserve other groups',()=>{
 const onChange=jest.fn();render(<NotificationPreferences value={{polls:true,monthly:false}} onChange={onChange}/>);fireEvent.click(screen.getByLabelText('Sondages entre amis'));expect(onChange).toHaveBeenCalledWith(expect.objectContaining({polls:false,monthly:false,collection:true}));
});
function Updates({request,preferences={}}){const items=useUsefulUpdates({games:[],preferences,enabled:true,request});return <div>{items.map(i=><p key={i.id}>{i.title}</p>)}</div>;}
test('poll mutation event refreshes reminders without a background write',async()=>{
 const poll={id:'a',author:'Alex',createdAt:new Date().toISOString(),endsAt:new Date(Date.now()+86400000).toISOString(),myVote:null};const request=jest.fn().mockResolvedValueOnce({polls:[poll]}).mockResolvedValue({polls:[{...poll,myVote:0}]});render(<Updates request={request}/>);await screen.findByText('Alex attend ton vote');await act(async()=>{window.dispatchEvent(new Event('checkpoint-polls-changed'));});await waitFor(()=>expect(screen.queryByText('Alex attend ton vote')).not.toBeInTheDocument());expect(request.mock.calls.every(call=>call.length===0)).toBe(true);
});


const {DUEL_STORAGE_KEY,startDuel,chooseDuel}=require('../services/soloDuel');
const winningHistory=count=>Array.from({length:count},(_,i)=>({id:`past-${i}`,winner:String(i),name:`Jeu ${i}`,date:`2026-10-${String(i+1).padStart(2,'0')}T12:00:00Z`,participants:4}));
test('four different winners unlock the Crown and only those winners enter; a Crown victory survives reload',async()=>{
 const storage=store();storage.setItem(DUEL_STORAGE_KEY,JSON.stringify({history:winningHistory(4)}));
 const view=render(<SoloDuel games={games} storage={storage}/>);fireEvent.click(await screen.findByText('Mon palmarès · 4'));
 fireEvent.click(screen.getByText('Réunir mes champions'));expect(screen.getByRole('dialog')).toHaveAccessibleName('La Couronne des Champions');expect(screen.getByLabelText('Participants')).toHaveValue('4');expect(screen.getByRole('option',{name:'8 jeux'})).toBeDisabled();
 const selected=screen.getAllByRole('combobox').filter(el=>el.closest('.duel-roster'));expect(selected).toHaveLength(4);selected.forEach(select=>expect([...select.options].every(option=>Number(option.value)<4)).toBe(true));
 fireEvent.click(screen.getByText('Commencer le tournoi · 3 duels'));for(let i=0;i<3;i++)fireEvent.click(screen.getAllByRole('button',{name:/Je préfère Jeu/})[0]);expect(screen.getByText(/TA COURONNE DES CHAMPIONS/)).toBeVisible();
 const saved=JSON.parse(storage.getItem(DUEL_STORAGE_KEY));expect(saved.history.filter(h=>!h.revoked)).toHaveLength(5);expect(saved.history.find(h=>h.id===saved.tournament.id).kind).toBe('champions');
 view.unmount();render(<SoloDuel games={games} storage={storage}/>);fireEvent.click(await screen.findByText('Revoir mon dernier duel'));expect(screen.getByText(/TA COURONNE DES CHAMPIONS/)).toBeVisible();expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).history).toHaveLength(5);
});
test('repeated wins cannot open a Crown and undo removes the last victory without deleting older titles',async()=>{
 const storage=store();storage.setItem(DUEL_STORAGE_KEY,JSON.stringify({history:winningHistory(8).map(entry=>({...entry,winner:'0',name:'Jeu 0'}))}));
 render(<SoloDuel games={games} storage={storage}/>);fireEvent.click(screen.getByText('Lancer un duel'));expect(screen.getByText('Réunir mes champions')).toBeDisabled();fireEvent.click(screen.getByText('Commencer le tournoi · 7 duels'));for(let i=0;i<7;i++)fireEvent.click(screen.getAllByRole('button',{name:/Je préfère Jeu/})[0]);
 expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).history.filter(h=>!h.revoked)).toHaveLength(9);fireEvent.click(screen.getByText('Revenir au choix précédent'));expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).history.filter(h=>!h.revoked)).toHaveLength(8);fireEvent.click(screen.getAllByRole('button',{name:/Je préfère Jeu/})[1]);expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).history.filter(h=>!h.revoked)).toHaveLength(9);
});
test('migrates local history to private account settings and merges late cloud wins without duplicates',async()=>{
 const storage=store(),change=jest.fn(),legacy=winningHistory(2);storage.setItem(DUEL_STORAGE_KEY,JSON.stringify({history:legacy}));
 const view=render(<SoloDuel games={games} storage={storage} palmares={[]} onPalmaresChange={change}/>);await waitFor(()=>expect(change).toHaveBeenCalledWith(expect.arrayContaining(legacy.map(entry=>expect.objectContaining({id:entry.id})))));
 view.rerender(<SoloDuel games={games} storage={storage} palmares={winningHistory(4)} onPalmaresChange={change}/>);fireEvent.click(await screen.findByText('Mon palmarès · 4'));expect(screen.getByText('Réunir mes champions')).toBeEnabled();expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).history).toHaveLength(4);
});
test('a current duel must be explicitly replaced before starting the Crown',async()=>{
 const storage=store();storage.setItem(DUEL_STORAGE_KEY,JSON.stringify({tournament:startDuel(games.map(g=>g.id)),history:winningHistory(4)}));render(<SoloDuel games={games} storage={storage}/>);fireEvent.click(await screen.findByText('Reprendre mon duel'));fireEvent.click(screen.getByText('Réunir mes champions'));expect(screen.getByText(/Le tournoi en cours sera remplacé/)).toBeVisible();expect(screen.queryByText('Commencer le tournoi · 3 duels')).toBeNull();fireEvent.click(screen.getByText('Garder ce tournoi'));expect(screen.getByText('Quarts de finale')).toBeVisible();
});


test('eight distinct champions propose an eight-game Crown and unavailable former winners are not eligible',async()=>{
 const storage=store();storage.setItem(DUEL_STORAGE_KEY,JSON.stringify({history:winningHistory(8)}));const view=render(<SoloDuel games={games} storage={storage}/>);fireEvent.click(await screen.findByText('Mon palmarès · 8'));fireEvent.click(screen.getByText('Réunir mes champions'));expect(screen.getByLabelText('Participants')).toHaveValue('8');expect(screen.getByText('Commencer le tournoi · 7 duels')).toBeVisible();
 view.unmount();render(<SoloDuel games={games.slice(0,3)} storage={storage}/>);fireEvent.click(await screen.findByText('Mon palmarès · 8'));expect(screen.getByText('Réunir mes champions')).toBeDisabled();expect(screen.getAllByText('Hors collection · souvenir conservé')).toHaveLength(5);
});

test('the Throne admits only Crown winners, chooses one ultimate winner and restores its title',async()=>{
 const storage=store(),crowns=winningHistory(4).map(e=>({...e,kind:'champions'}));storage.setItem(DUEL_STORAGE_KEY,JSON.stringify({history:[...crowns,...winningHistory(8).map(e=>({...e,id:`classic-${e.id}`}))]}));
 const view=render(<SoloDuel games={games} storage={storage}/>);fireEvent.click(await screen.findByText('Mon palmarès · 12'));fireEvent.click(screen.getByText('Viser le Trône Ultime'));
 expect(screen.getByRole('dialog')).toHaveAccessibleName('Le Trône Ultime');expect(screen.getByLabelText('Participants')).toHaveValue('4');
 screen.getAllByRole('combobox').filter(el=>el.closest('.duel-roster')).forEach(select=>expect([...select.options].every(option=>Number(option.value)<4)).toBe(true));
 fireEvent.click(screen.getByText('Commencer le tournoi · 3 duels'));for(let i=0;i<3;i++)fireEvent.click(screen.getAllByRole('button',{name:/Je préfère Jeu/})[0]);expect(screen.getByText(/TON VAINQUEUR ULTIME/)).toBeVisible();
 expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).history.filter(h=>h.kind==='ultimate'&&!h.revoked)).toHaveLength(1);
 fireEvent.click(screen.getByText('Revenir au choix précédent'));expect(screen.queryByText('DERNIER VAINQUEUR ULTIME')).toBeNull();fireEvent.click(screen.getAllByRole('button',{name:/Je préfère Jeu/})[1]);
 view.unmount();render(<SoloDuel games={games} storage={storage}/>);fireEvent.click(await screen.findByText('Mon palmarès · 13'));expect(screen.getByText('DERNIER VAINQUEUR ULTIME')).toBeVisible();expect(screen.getByText(/1 titre ultime/)).toBeVisible();
});
test('repeat Crown wins never unlock the ultimate tournament alone',async()=>{
 const storage=store();storage.setItem(DUEL_STORAGE_KEY,JSON.stringify({history:winningHistory(4).map(e=>({...e,kind:'champions',winner:'0',name:'Jeu 0'}))}));render(<SoloDuel games={games} storage={storage}/>);fireEvent.click(await screen.findByText('Mon palmarès · 4'));expect(screen.getByText('Viser le Trône Ultime')).toBeDisabled();expect(screen.getByText(/1\/4 vainqueurs de la Couronne/)).toBeVisible();
});

test('the grand tournament includes every owned game once, resumes with its original field and keeps a removed game playable',async()=>{
 const storage=store(),original=games.slice(0,5);const view=render(<SoloDuel games={[...original,{id:'wish',name:'Wish',status:'wishlist'}]} storage={storage}/>);
 fireEvent.click(screen.getByText('Lancer le grand tournoi'));expect(screen.getByText('5 jeux · 4 duels jusqu’au gagnant ultime')).toBeVisible();fireEvent.click(screen.getByText('Commencer le grand tournoi'));
 let saved=JSON.parse(storage.getItem(DUEL_STORAGE_KEY));expect(saved.tournament.roster).toHaveLength(5);expect(saved.tournament.participants).toHaveLength(5);
 fireEvent.click(screen.getAllByRole('button',{name:/Je préfère Jeu/})[0]);saved=JSON.parse(storage.getItem(DUEL_STORAGE_KEY));const removed=saved.tournament.round[saved.tournament.index];
 view.unmount();render(<SoloDuel games={[...original.filter(g=>String(g.id)!==removed),{id:'new',name:'New game'}]} storage={storage}/>);fireEvent.click(await screen.findByText('Reprendre le grand tournoi'));
 expect(screen.getByRole('button',{name:`Je préfère Jeu ${removed}`})).toBeVisible();expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).tournament.roster).not.toContain('new');
 for(let i=0;i<3;i++)fireEvent.click(screen.getAllByRole('button',{name:/Je préfère Jeu/})[0]);expect(screen.getByText(/TON VAINQUEUR ULTIME/)).toBeVisible();
 expect(JSON.parse(storage.getItem(DUEL_STORAGE_KEY)).history.filter(h=>!h.revoked)).toHaveLength(1);fireEvent.click(screen.getByText('Revenir au choix précédent'));expect(screen.getByText('Finale')).toBeVisible();
});
