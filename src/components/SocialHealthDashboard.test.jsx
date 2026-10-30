import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import SocialHealthDashboard from './SocialHealthDashboard';
import {friendshipRequest} from '../services/friendships';
jest.mock('../services/friendships',()=>({friendshipRequest:jest.fn()}));
test('shows aggregated incidents and prepares the search index without exposing personal data',async()=>{
 const result={issues:[{operation:'friendships',status:409,source:'server',count:3,lastSeen:'2026-10-27T12:00:00Z'}],directory:{indexed:10,pending:2}};
 friendshipRequest.mockResolvedValueOnce(result).mockResolvedValueOnce({pending:0}).mockResolvedValue({...result,directory:{indexed:12,pending:0}});
 render(<SocialHealthDashboard/>);
 expect(await screen.findByText('Invitations · Modification simultanée')).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Préparer l’index de recherche'}));
 await waitFor(()=>expect(screen.queryByRole('button',{name:'Préparer l’index de recherche'})).toBeNull());
 expect(friendshipRequest).toHaveBeenCalledWith('index',{},'socialDiagnostics');expect(screen.getByText(/12 profils indexés/)).toBeVisible();
});
