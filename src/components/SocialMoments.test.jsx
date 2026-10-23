import {render,screen,fireEvent,waitFor,within} from '@testing-library/react';
import GameRecommendations from './GameRecommendations';
import GamingPredictions from './GamingPredictions';
import ToolDialog from './ToolDialog';
import {rendezvousUpdates} from '../services/rendezvousUpdates';
const recommendation={id:'one',author:'Alice',friend:'Bob',game:{name:'Halo'},message:'Pour nos prochaines soirées.',createdAt:'2026-10-23',isSender:false,saved:false,response:'',archived:false};
beforeEach(()=>jest.spyOn(window,'scrollTo').mockImplementation(()=>{}));
afterEach(()=>jest.restoreAllMocks());
test('a received recommendation can be kept without creating a library record and can fail honestly',async()=>{
 const request=jest.fn().mockResolvedValueOnce({recommendations:[recommendation]}).mockRejectedValueOnce(new Error('Hors ligne')).mockResolvedValue({recommendations:[{...recommendation,saved:true}]});
 render(<GameRecommendations request={request}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Garder pour plus tard'}));expect(await screen.findByRole('alert')).toHaveTextContent('Hors ligne');
 expect(screen.getByRole('button',{name:'Garder pour plus tard'})).toHaveAttribute('aria-pressed','false');
 fireEvent.click(screen.getByRole('button',{name:'Garder pour plus tard'}));
 await waitFor(()=>expect(screen.getByRole('button',{name:'Retirer de mes jeux à découvrir'})).toHaveAttribute('aria-pressed','true'));
 expect(request).toHaveBeenCalledWith('save',{id:'one',saved:true});fireEvent.click(screen.getByRole('button',{name:'À découvrir'}));expect(screen.getByRole('heading',{name:'Halo'})).toBeVisible();
});
test('recommendations require a real message and game; retries preserve the draft',async()=>{
 const request=jest.fn().mockResolvedValueOnce({recommendations:[]}).mockRejectedValue(new Error('Serveur indisponible'));
 render(<GameRecommendations games={[{id:'halo',name:'Halo'}]} friends={[{handle:'bob',displayName:'Bob'}]} request={request}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Recommander un jeu'}));const form=within(screen.getByRole('dialog'));
 expect(form.getByRole('button',{name:'Envoyer à mon ami'})).toBeDisabled();fireEvent.click(form.getByRole('radio',{name:'Halo'}));fireEvent.change(form.getByLabelText('Pourquoi je pense à toi'),{target:{value:'Tu aimerais cet univers.'}});fireEvent.click(form.getByRole('button',{name:'Envoyer à mon ami'}));
 await waitFor(()=>expect(form.getByRole('alert')).toHaveTextContent('Serveur indisponible'));expect(form.getByLabelText('Pourquoi je pense à toi')).toHaveValue('Tu aimerais cet univers.');
});
test('a reply notification opens the sent recommendation rather than an empty inbox',async()=>{
 render(<GameRecommendations request={jest.fn().mockResolvedValue({recommendations:[{...recommendation,isSender:true,response:'Super jeu !'}]})} targetId="one"/>);
 await waitFor(()=>expect(screen.getByRole('button',{name:'Envoyées'})).toHaveAttribute('aria-pressed','true'));expect(screen.getByText('Super jeu !')).toBeVisible();
});
test('predictions keep other answers secret and expose no management tools to players',async()=>{
 const request=jest.fn().mockResolvedValue({canManage:false,predictions:[{id:'one',title:'Une nouvelle annonce ?',event:'Test',options:['Oui','Non'],myVote:null,result:null,counts:null,closesAt:'2026-12-01',closed:false,source:'https://example.test'}]});
 render(<GamingPredictions request={request} manage/>);fireEvent.click(await screen.findByRole('button',{name:'Oui',exact:true}));await waitFor(()=>expect(request).toHaveBeenCalledWith('vote',{id:'one',choice:0}));expect(screen.queryByText(/100 %/)).toBeNull();expect(screen.queryByRole('button',{name:'Créer un pronostic'})).toBeNull();
});
test('busy dialogs refuse Escape and backdrop clicks until a mutation finishes',()=>{
 const close=jest.fn(),view=render(<ToolDialog title="Sauvegarde" busy onClose={close}><p>Enregistrement…</p></ToolDialog>);
 fireEvent.keyDown(document,{key:'Escape'});
 // The backdrop is intentionally non-interactive and has no accessible role.
 // eslint-disable-next-line testing-library/no-node-access
 fireEvent.click(screen.getByRole('dialog').parentElement);expect(close).not.toHaveBeenCalled();
 view.rerender(<ToolDialog title="Sauvegarde" onClose={close}><p>Terminé</p></ToolDialog>);fireEvent.keyDown(document,{key:'Escape'});expect(close).toHaveBeenCalledTimes(1);
});
test('notification settings and destinations cover the two new activities',()=>{
 const recommendations=[recommendation,{...recommendation,id:'reply',isSender:true,response:'Merci',repliedAt:'2026-10-23'}],predictions=[{id:'one',title:'Annonce',myVote:null,closed:false}];
 const notices=rendezvousUpdates({recommendations,predictions,preferences:{challenges:false},now:new Date('2026-10-23')});
 expect(notices.find(n=>n.id==='recommendation-one').recommendationId).toBe('one');expect(notices.find(n=>n.id==='prediction-open-one').view).toBe('predictions');
 expect(rendezvousUpdates({recommendations,predictions,preferences:{recommendations:false,rendezvous:false,challenges:false}})).toEqual([]);
});
