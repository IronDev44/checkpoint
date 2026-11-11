import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import LegalOptions from './LegalOptions';
import {usageRequest} from '../services/appUsage';
jest.mock('../firebase',()=>({auth:{currentUser:{uid:'alice'}}}));
jest.mock('../services/accountConfig',()=>({accountsEnabled:true}));
jest.mock('../services/appUsage',()=>({usageRequest:jest.fn()}));
beforeEach(()=>usageRequest.mockReset());
test('public links and contact remain available when preferences fail to load',async()=>{
 usageRequest.mockRejectedValue(Error('Offline'));
 render(<LegalOptions/>);
 expect(screen.getByRole('link',{name:'Mentions légales'})).toHaveAttribute('href','/legal/mentions-legales.html');
 expect(screen.getByRole('link',{name:'checkpoint.appgaming@gmail.com'})).toHaveAttribute('href','mailto:checkpoint.appgaming@gmail.com');
 expect(await screen.findByRole('status')).toHaveTextContent('Choix indisponible');
 expect(screen.getByRole('button',{name:'Autoriser les statistiques'})).toBeDisabled();
});
test('withdrawing consent requires a server acknowledgement before displaying success',async()=>{
 usageRequest.mockResolvedValueOnce({usage:true,available:true}).mockResolvedValueOnce({usage:false,available:true});
 const changed=jest.fn();window.addEventListener('checkpoint-privacy-changed',changed);
 render(<LegalOptions/>);
 const withdraw=await screen.findByRole('button',{name:'Retirer mon accord'});fireEvent.click(withdraw);
 await waitFor(()=>expect(usageRequest).toHaveBeenCalledWith({usage:false},'privacyPreferences'));
 expect(await screen.findByRole('status')).toHaveTextContent('relevés d’activité supprimés');
 expect(changed).toHaveBeenCalledTimes(1);window.removeEventListener('checkpoint-privacy-changed',changed);
});
test('a refused server write does not pretend that activity was erased',async()=>{
 usageRequest.mockResolvedValueOnce({usage:true,available:true}).mockRejectedValueOnce(Error('Sauvegarde impossible'));
 render(<LegalOptions/>);fireEvent.click(await screen.findByRole('button',{name:'Retirer mon accord'}));
 expect(await screen.findByRole('status')).toHaveTextContent('Sauvegarde impossible');
 expect(screen.getByRole('button',{name:'Retirer mon accord'})).toBeEnabled();
});

test('paused collection cannot be enabled while old records remain erasable',async()=>{
 usageRequest.mockResolvedValue({usage:false,available:false});render(<LegalOptions/>);
 expect(await screen.findByText('mesure suspendue')).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Autoriser les statistiques'})).toBeDisabled();
 expect(screen.getByRole('button',{name:'Refuser et effacer les relevés'})).toBeEnabled();
});
