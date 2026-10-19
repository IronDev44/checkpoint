import React,{useState} from 'react';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import GameListMembership from './GameListMembership';
import HardwareFilters from './HardwareFilters';
import GameHistory from './GameHistory';
import FriendTogether from './FriendTogether';
import {GameService} from '../services/gameService';
import {EMPTY_HARDWARE_FILTERS} from '../services/hardwareFilters';
jest.mock('../services/gameService',()=>({GameService:{igdb:jest.fn()}}));
test('game sheet memberships toggle existing lists and create a list already containing the game',()=>{
 const game={id:'a',name:'Halo'};function Fixture(){const [lists,setLists]=useState([{id:'one',name:'Coop',gameIds:[]}]);return <GameListMembership game={game} value={lists} onChange={setLists}/>;}render(<Fixture/>);fireEvent.click(screen.getByText('Mes listes · 0'));fireEvent.click(screen.getByRole('checkbox',{name:'Coop'}));expect(screen.getByRole('checkbox',{name:'Coop'})).toBeChecked();fireEvent.change(screen.getByLabelText('Nouvelle liste pour ce jeu'),{target:{value:'Mes vacances'}});fireEvent.click(screen.getByText('Créer et ajouter ce jeu'));expect(screen.getByRole('checkbox',{name:'Mes vacances'})).toBeChecked();fireEvent.click(screen.getByRole('checkbox',{name:'Coop'}));expect(screen.getByRole('checkbox',{name:'Coop'})).not.toBeChecked();
});
test('hardware filters expose unknown years and reset without mutating collection',()=>{
 const onChange=jest.fn();render(<HardwareFilters items={[{brand:'Sony',parentName:'PlayStation 5',status:'possédé',acquiredYear:2024}]} value={EMPTY_HARDWARE_FILTERS} catalog={[]} onChange={onChange} count={1}/>);fireEvent.click(screen.getByText('Rechercher et filtrer mon matériel'));fireEvent.change(screen.getByLabelText('Année d’obtention'),{target:{value:'unknown'}});expect(onChange).toHaveBeenCalledWith({...EMPTY_HARDWARE_FILTERS,year:'unknown'});expect(screen.getByRole('status')).toHaveTextContent('1 appareil affiché');
});
test('history shows known changes and avoids invented legacy dates',()=>{render(<GameHistory game={{playHistory:[{id:'a',type:'paused',at:'2026-10-19T10:00:00Z'},{id:'b',type:'resumed',at:'2026-10-20T10:00:00Z'}]}}/>);fireEvent.click(screen.getByText('Historique de ta partie'));expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Partie reprise');expect(screen.getAllByRole('listitem')).toHaveLength(2);});
test('together lookup exposes explicit failure and retry, then a verified coop mode',async()=>{
 GameService.igdb.mockRejectedValueOnce(new Error('offline')).mockResolvedValue({id:42,game_modes:[{name:'Co-operative'}]});render(<FriendTogether common={[{ownGame:{id:'a',name:'Portal 2',sourceIds:{igdb:42},platformNames:['PC']},game:{name:'Portal 2',platforms:['PC']}}]} profileKey="alex"/>);fireEvent.click(screen.getByText('Vérifier les modes de jeu'));expect(await screen.findByText('Vérification indisponible. Tu peux réessayer.')).toBeInTheDocument();fireEvent.click(screen.getByText('Vérifier les modes de jeu'));expect(await screen.findByText('Coopération')).toBeInTheDocument();fireEvent.click(screen.getByText('Coopératifs'));expect(screen.getByText('Portal 2')).toBeInTheDocument();expect(screen.getByText('Plateforme(s) en commun : PC')).toBeInTheDocument();
});
