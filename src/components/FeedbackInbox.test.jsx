import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import FeedbackInbox from './FeedbackInbox';
import {adminFeedbackRequest} from '../services/testerFeedback';
jest.mock('../services/testerFeedback',()=>({adminFeedbackRequest:jest.fn()}));
beforeEach(()=>adminFeedbackRequest.mockReset());
test('loads without a second code, pages through reports and saves their status',async()=>{
 const item={id:'report:fixture',category:'bug',screen:'Profil',createdAt:'2026-10-17T10:00:00Z',message:'Le bouton ne répond pas',status:'new'};
 adminFeedbackRequest.mockResolvedValueOnce({items:[item],cursor:'next-page'}).mockResolvedValueOnce({items:[{...item,id:'report:second',message:'Autre retour'}],cursor:null}).mockResolvedValueOnce({ok:true});
 render(<FeedbackInbox/>);
 expect(await screen.findByText('Le bouton ne répond pas')).toBeVisible();
 expect(screen.queryByRole('textbox')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Charger les retours suivants'}));
 expect(await screen.findByText('Autre retour')).toBeVisible();
 expect(adminFeedbackRequest.mock.calls[1][0]).toBe('/api/feedback/admin?cursor=next-page');
 fireEvent.change(screen.getAllByLabelText('Suivi')[0],{target:{value:'resolved'}});
 await waitFor(()=>expect(adminFeedbackRequest).toHaveBeenCalledWith('/api/feedback/admin',expect.objectContaining({method:'PATCH',body:{id:item.id,status:'resolved'}})));
 await waitFor(()=>expect(screen.getAllByLabelText('Suivi')[0]).toHaveValue('resolved'));
});
test('a failed account check shows an error and allows retry without a password field',async()=>{
 adminFeedbackRequest.mockRejectedValueOnce(new Error('Accès réservé au propriétaire.')).mockResolvedValueOnce({items:[],cursor:null});
 render(<FeedbackInbox/>);
 await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('Accès réservé au propriétaire.'));
 fireEvent.click(screen.getByRole('button',{name:'Actualiser'}));
 expect(await screen.findByText('Aucun retour pour le moment.')).toBeVisible();
 expect(screen.queryByLabelText(/Code privé/)).toBeNull();
});
