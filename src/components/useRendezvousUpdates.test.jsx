import {render,screen,act} from '@testing-library/react';
import useRendezvousUpdates from './useRendezvousUpdates';
import {recommendationRequest,selectionRequest,challengeRequest,predictionRequest} from '../services/rendezvousRequest';
jest.mock('../services/rendezvousRequest',()=>({recommendationRequest:jest.fn(),selectionRequest:jest.fn(),challengeRequest:jest.fn(),predictionRequest:jest.fn()}));
function Probe({uid}){const notices=useRendezvousUpdates({accountUid:uid,enabled:true,preferences:{rendezvous:false,challenges:false}});return <p>{notices.map(n=>n.title).join(',')||'Aucune notification'}</p>;}
test('changing accounts immediately removes the previous account’s private recommendation notices',async()=>{
 selectionRequest.mockResolvedValue({rounds:[]});challengeRequest.mockResolvedValue({challenges:[]});predictionRequest.mockResolvedValue({predictions:[]});
 let resolve;const pending=new Promise(r=>{resolve=r;});recommendationRequest.mockResolvedValueOnce({recommendations:[{id:'alice',author:'Alice',game:{name:'Halo'},isSender:false}]}).mockReturnValueOnce(pending);
 const view=render(<Probe uid="one"/>);await screen.findByText('Alice te recommande un jeu');
 view.rerender(<Probe uid="two"/>);expect(screen.queryByText('Alice te recommande un jeu')).toBeNull();
 await act(async()=>resolve({recommendations:[]}));expect(screen.getByText('Aucune notification')).toBeVisible();
});
