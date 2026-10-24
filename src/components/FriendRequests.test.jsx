import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import FriendRequests from './FriendRequests';
jest.mock('./ProfilePhoto',()=>({SocialAvatar:()=>null}));
const received={id:'one',status:'pending',direction:'received',profile:{handle:'alice',displayName:'Alice'}};
const sent={id:'two',status:'pending',direction:'sent',profile:{handle:'bob',displayName:'Bob'}};
test('separates incoming and sent requests and sends the appropriate decisions',async()=>{
 const act=jest.fn().mockResolvedValue({ok:true});
 render(<FriendRequests connections={[received,sent,{...received,id:'accepted',status:'accepted',profile:{handle:'eve',displayName:'Eve'}}]} act={act}/>);
 expect(screen.getByText('Reçues · 1')).toBeVisible();expect(screen.getByText('Envoyées · 1')).toBeVisible();
 expect(screen.queryByText('Eve')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Accepter',exact:true}));
 await waitFor(()=>expect(act).toHaveBeenCalledWith('accept',{id:'one'}));
 expect(await screen.findByText('Invitation acceptée. Vous êtes maintenant amis.')).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Refuser'}));
 await waitFor(()=>expect(act).toHaveBeenCalledWith('decline',{id:'one'}));
 fireEvent.click(screen.getByRole('button',{name:'Annuler la demande'}));
 await waitFor(()=>expect(act).toHaveBeenCalledWith('cancel',{id:'two'}));
});
test('shows failures without removing the request and disables actions while saving',async()=>{
 const act=jest.fn().mockRejectedValue(new Error('Hors ligne'));
 const view=render(<FriendRequests connections={[received]} act={act}/>);
 fireEvent.click(screen.getByRole('button',{name:'Accepter',exact:true}));
 await waitFor(()=>expect(act).toHaveBeenCalledTimes(1));
 expect(screen.getByText('Alice')).toBeVisible();
 expect(screen.queryByText('Invitation acceptée. Vous êtes maintenant amis.')).toBeNull();
 view.rerender(<FriendRequests connections={[received]} act={act} busy error="Hors ligne"/>);
 expect(screen.getByRole('alert')).toHaveTextContent('Hors ligne');
 expect(screen.getByRole('button',{name:'Accepter',exact:true})).toBeDisabled();
});
