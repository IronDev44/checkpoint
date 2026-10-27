import {render,screen,fireEvent,waitFor,act} from '@testing-library/react';
import ProfileSearch from './ProfileSearch';
import {searchPublicProfiles} from '../services/profileSearch';
jest.mock('../services/profileSearch',()=>({searchPublicProfiles:jest.fn()}));
const profile={handle:'alice',displayName:'Alice'};
beforeEach(()=>searchPublicProfiles.mockReset());
test('searching and viewing a profile never sends an invitation',async()=>{
 searchPublicProfiles.mockResolvedValue({profiles:[profile]});const open=jest.fn(),invite=jest.fn();
 render(<ProfileSearch onOpen={open} onInvite={invite} canInvite={false}/>);
 fireEvent.change(screen.getByLabelText('Pseudo ou identifiant'),{target:{value:'Ali'}});fireEvent.click(screen.getByRole('button',{name:'Rechercher',exact:true}));
 fireEvent.click(await screen.findByRole('button',{name:'Voir le profil de Alice'}));await waitFor(()=>expect(open).toHaveBeenCalledWith('alice'));expect(invite).not.toHaveBeenCalled();expect(screen.getByRole('button',{name:'Inviter Alice'})).toBeDisabled();
});
test('shows invitation state and handles inaccessible profiles without changing the search',async()=>{
 searchPublicProfiles.mockResolvedValue({profiles:[profile]});const open=jest.fn().mockRejectedValue(Error('Profil privé.'));
 render(<ProfileSearch onOpen={open} connections={[{status:'pending',direction:'sent',profile}]}/>);
 fireEvent.change(screen.getByLabelText('Pseudo ou identifiant'),{target:{value:'Alice'}});fireEvent.click(screen.getByRole('button',{name:'Rechercher',exact:true}));
 expect(await screen.findByText('Invitation envoyée')).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'Voir le profil de Alice'}));expect(await screen.findByRole('alert')).toHaveTextContent('Profil privé.');expect(screen.getByLabelText('Pseudo ou identifiant')).toHaveValue('Alice');
});
test('a late search response cannot replace a new query',async()=>{
 let finish;searchPublicProfiles.mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));render(<ProfileSearch/>);
 fireEvent.change(screen.getByLabelText('Pseudo ou identifiant'),{target:{value:'Alice'}});fireEvent.click(screen.getByRole('button',{name:'Rechercher',exact:true}));
 fireEvent.change(screen.getByLabelText('Pseudo ou identifiant'),{target:{value:'Bob'}});await act(async()=>finish({profiles:[profile]}));expect(screen.queryByText('@alice')).toBeNull();
});
test('own public profile is identifiable and never offers self invitation',async()=>{
 searchPublicProfiles.mockResolvedValue({profiles:[{...profile,self:true}]});render(<ProfileSearch onOpen={jest.fn()} onInvite={jest.fn()}/>);
 fireEvent.change(screen.getByLabelText('Pseudo ou identifiant'),{target:{value:'Alice'}});fireEvent.click(screen.getByRole('button',{name:'Rechercher',exact:true}));
 expect(await screen.findByText('Ton profil')).toBeVisible();expect(screen.queryByRole('button',{name:'Inviter Alice'})).toBeNull();
});

test('private profiles expose only a pseudo with no picture, address, view or invite action',async()=>{
 const open=jest.fn(),invite=jest.fn();
 searchPublicProfiles.mockResolvedValue({profiles:[{handle:'private-reference',displayName:'Nastasia',photoURL:'should-not-display.jpg',private:true}]});
 render(<ProfileSearch onOpen={open} onInvite={invite}/>);
 fireEvent.change(screen.getByLabelText('Pseudo ou identifiant'),{target:{value:'Nastasia'}});fireEvent.click(screen.getByRole('button',{name:'Rechercher',exact:true}));
 expect(await screen.findByText('Nastasia')).toBeVisible();
 expect(screen.getByText(/Profil privé · Consultation et invitations indisponibles/)).toBeVisible();
 expect(screen.queryByRole('button',{name:'Voir le profil de Nastasia'})).toBeNull();
 expect(screen.queryByRole('button',{name:'Inviter Nastasia'})).toBeNull();
 expect(screen.queryByText('@private-reference')).toBeNull();expect(screen.queryByRole('img')).toBeNull();
 expect(open).not.toHaveBeenCalled();expect(invite).not.toHaveBeenCalled();
});
