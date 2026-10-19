import React from 'react';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import FriendPolls from './FriendPolls';
import MonthlyRecap from './MonthlyRecap';
jest.mock('../services/friendPolls',()=>({pollRequest:jest.fn()}));
beforeEach(()=>{Object.defineProperty(global,'crypto',{configurable:true,value:{randomUUID:()=> 'new-poll'}});});
test('creates only after explicit game and friend selection',async()=>{
 const request=jest.fn(async(action)=>action==='create'?{poll:{id:'p',title:'Je commence lequel ?',author:'Moi',options:[{name:'Halo'},{name:'Portal'}],counts:[0,0],total:0,isOwner:true,endsAt:'2026-12-01'}}:{polls:[]});
 render(<FriendPolls games={[{id:'a',name:'Halo'},{id:'b',name:'Portal'}]} friends={[{handle:'alice',displayName:'Alice'}]} request={request}/>);
 await waitFor(()=>expect(request).toHaveBeenCalledTimes(1));fireEvent.click(screen.getByText('Créer un sondage'));
 const send=screen.getByText('Lancer le sondage pour 7 jours');expect(send).toBeDisabled();
 fireEvent.click(screen.getByLabelText('Halo'));fireEvent.click(screen.getByLabelText('Portal'));fireEvent.click(screen.getByLabelText(/Alice/));expect(send).toBeEnabled();expect(request).toHaveBeenCalledTimes(1);fireEvent.click(send);
 await waitFor(()=>expect(request).toHaveBeenCalledWith('create',{id:'new-poll',gameIds:['a','b'],handles:['alice']}));await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});
test('renders vote counts and sends a change of vote, preserves errors',async()=>{
 const poll={id:'p',title:'Je commence lequel ?',author:'Alice',options:[{name:'Halo'},{name:'Portal'}],counts:[1,0],total:1,myVote:0,endsAt:'2026-12-01'};
 const request=jest.fn(async action=>{if(action==='vote')throw new Error('Connexion coupée');return {polls:[poll]};});render(<FriendPolls request={request}/>);
 fireEvent.click(await screen.findByRole('button',{name:/Portal/}));await waitFor(()=>expect(request).toHaveBeenCalledWith('vote',{id:'p',choice:1}));expect(await screen.findByRole('alert')).toHaveTextContent('Connexion coupée');expect(screen.getByRole('button',{name:/Halo/})).toHaveAttribute('aria-pressed','true');
});
test('monthly details remain private and unknown dates are explained',()=>{
 render(<MonthlyRecap games={[{id:'a',name:'Old game',completed:true,createdAt:'2020-01-01'}]}/>);fireEvent.click(screen.getByText('Voir mon bilan'));expect(screen.getByRole('dialog')).toBeInTheDocument();expect(screen.getByText(/sans date connue/)).toBeInTheDocument();expect(screen.getByLabelText('Mois du bilan')).toBeInTheDocument();expect(screen.getByText(/Le bilan reste privé/)).toBeInTheDocument();
});
