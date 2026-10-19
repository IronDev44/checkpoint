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
