import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import FeedbackInbox from './FeedbackInbox';
import {adminFeedbackRequest} from '../services/testerFeedback';
jest.mock('../services/testerFeedback',()=>({adminFeedbackRequest:jest.fn()}));
beforeEach(()=>adminFeedbackRequest.mockReset());

test('deletion requires confirmation, can be cancelled and removes the report after success',async()=>{
 const item={id:'report:fixture',category:'bug',screen:'Profil',createdAt:'2026-10-17T10:00:00Z',message:'Retour traité',status:'resolved'};
 adminFeedbackRequest.mockResolvedValueOnce({items:[item],cursor:null}).mockResolvedValueOnce({ok:true});
 render(<FeedbackInbox/>);
 fireEvent.click(await screen.findByRole('button',{name:'Supprimer ce retour'}));
 expect(adminFeedbackRequest).toHaveBeenCalledTimes(1);
 fireEvent.click(screen.getByRole('button',{name:'Annuler'}));
 expect(screen.queryByText('Supprimer définitivement ce retour ?')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Supprimer ce retour'}));
 fireEvent.click(screen.getByRole('button',{name:'Confirmer la suppression'}));
 await waitFor(()=>expect(adminFeedbackRequest).toHaveBeenCalledWith('/api/feedback/admin',expect.objectContaining({method:'DELETE',body:{id:item.id}})));
 expect(await screen.findByText('Aucun retour pour le moment.')).toBeVisible();
});

test('a failed deletion keeps the report and allows retry',async()=>{
 const item={id:'report:fixture',category:'idea',screen:'Accueil',createdAt:'2026-10-17T10:00:00Z',message:'Retour à conserver',status:'new'};
 adminFeedbackRequest.mockResolvedValueOnce({items:[item],cursor:null}).mockRejectedValueOnce(new Error('Suppression impossible.')).mockResolvedValueOnce({ok:true});
 render(<FeedbackInbox/>);
 fireEvent.click(await screen.findByRole('button',{name:'Supprimer ce retour'}));
 fireEvent.click(screen.getByRole('button',{name:'Confirmer la suppression'}));
 await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('Suppression impossible.'));
 expect(screen.getByText(item.message)).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Confirmer la suppression'}));
 expect(await screen.findByText('Aucun retour pour le moment.')).toBeVisible();
});
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
