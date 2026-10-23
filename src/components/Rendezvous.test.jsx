import {render,screen,fireEvent,waitFor,within} from '@testing-library/react';
import CommunitySelections from './CommunitySelections';
import FriendChallenges from './FriendChallenges';
import PersonalMemories from './PersonalMemories';
import Expeditions from './Expeditions';
import {EXPEDITIONS} from '../services/rendezvousCatalog';
import ToolDialog from './ToolDialog';
import {useState} from 'react';
beforeEach(()=>{jest.spyOn(window,'scrollTo').mockImplementation(()=>{});});
afterEach(()=>jest.restoreAllMocks());
test('Escape closes only the topmost expedition dialog, preserving its parent rendezvous',()=>{
 const outer=jest.fn(),inner=jest.fn();function Nested(){const [open,setOpen]=useState(false);return <ToolDialog title="Rendez-vous" onClose={outer}><button onClick={()=>setOpen(true)}>Partir</button>{open&&<ToolDialog title="Mon expédition" onClose={inner}><p>Repères</p></ToolDialog>}</ToolDialog>;}
 render(<Nested/>);fireEvent.click(screen.getByRole('button',{name:'Partir'}));
 fireEvent.keyDown(screen.getByRole('dialog',{name:'Mon expédition'}),{key:'Escape'});
 expect(inner).toHaveBeenCalledTimes(1);expect(outer).not.toHaveBeenCalled();
});
test('large memory lists stay pageable rather than silently dropping older dated games',()=>{
 const games=Array.from({length:35},(_,i)=>({id:String(i),name:`Souvenir ${i}`,status:'collection',completedAt:'2020-10-22'}));
 render(<PersonalMemories games={games} now={new Date('2026-10-23T12:00:00Z')}/>);
 expect(screen.getAllByRole('heading',{name:/Tu terminais Souvenir/})).toHaveLength(12);
 fireEvent.click(screen.getByRole('button',{name:'Afficher d’autres souvenirs'}));fireEvent.click(screen.getByRole('button',{name:'Afficher d’autres souvenirs'}));
 expect(screen.getAllByRole('heading',{name:/Tu terminais Souvenir/})).toHaveLength(35);
});
const round={id:'week-2026-10-19',title:'Un monde à retenir',kind:'weekly',started:true,closed:false,eligible:true,myVote:null,total:null,counts:null,options:[{id:'halo',name:'Halo'},{id:'portal',name:'Portal'}],endsAt:'2026-10-26T00:00:00Z'};
test('community totals remain hidden until a successful vote; a failure does not fabricate a result',async()=>{
 const request=jest.fn().mockResolvedValueOnce({rounds:[round]}).mockRejectedValueOnce(new Error('Connexion perdue')).mockResolvedValue({rounds:[{...round,myVote:'halo',counts:[1,0],total:1}]});
 render(<CommunitySelections request={request}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Halo'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Connexion perdue');
 expect(screen.queryByText('100 %')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Halo'}));
 await waitFor(()=>expect(screen.getByRole('button',{name:/✓ Halo/})).toHaveAttribute('aria-pressed','true'));
 expect(request).toHaveBeenLastCalledWith('vote',{id:round.id,choice:'halo'});
});
test('a retrospective comment stays separate from the original review and rating',()=>{
 const onChange=jest.fn(),game={id:'halo',name:'Halo',status:'collection',review:'Mon avis initial',rating:8,completedAt:'2024-10-22'};
 render(<PersonalMemories games={[game]} value={{}} onChange={onChange} now={new Date('2026-10-23T12:00:00Z')}/>);
 fireEvent.click(screen.getByRole('button',{name:'Ajouter un mot avec le recul'}));fireEvent.change(screen.getByLabelText('Ce que j’en retiens aujourd’hui'),{target:{value:'Toujours un bon souvenir.'}});fireEvent.click(screen.getByRole('button',{name:'Conserver mon souvenir'}));
 expect(onChange).toHaveBeenCalledWith(expect.objectContaining({reflections:{'halo:completed:2024-10-22':expect.objectContaining({text:'Toujours un bon souvenir.',ratingAtReflection:8})}}));expect(game.review).toBe('Mon avis initial');expect(game.rating).toBe(8);
});
test('an expedition keeps its stamp once and can finish without a community connection',async()=>{
 const save=jest.fn(),request=jest.fn().mockRejectedValue(new Error('Hors ligne')),e=EXPEDITIONS[0];
 render(<Expeditions onChange={save} request={request} now={new Date('2026-10-23')}/>);
 fireEvent.click(screen.getByRole('button',{name:'Partir en expédition'}));fireEvent.click(screen.getByRole('button',{name:'Commencer le parcours'}));
 for(const q of e.questions){fireEvent.click(screen.getByRole('button',{name:q.options[q.answer],exact:true}));fireEvent.click(screen.getByRole('button',{name:'Continuer',exact:true}));}
 fireEvent.click(screen.getByRole('button',{name:'Terminer sans vote communautaire'}));expect(save).toHaveBeenCalledWith(expect.objectContaining({expeditions:{[e.id]:expect.objectContaining({score:2,answers:[2,1]})}}));expect(screen.getByRole('heading',{name:'Parcours terminé'})).toBeVisible();
});
test('challenge creation needs two games, an invited friend and the author’s secret choice',async()=>{
 const request=jest.fn().mockResolvedValueOnce({challenges:[]}).mockResolvedValue({challenge:{id:'one',question:'Ton jeu préféré',options:[{name:'Halo'},{name:'Portal'}],author:'Alice',friend:'Bob',myVote:0,revealed:false,closed:false,endsAt:'2026-10-30',myComment:''}});
 render(<FriendChallenges request={request} games={[{id:'a',name:'Halo'},{id:'b',name:'Portal'}]} friends={[{handle:'bob',displayName:'Bob'}]}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Créer un défi'}));const dialog=within(screen.getByRole('dialog'));
 expect(dialog.getByRole('button',{name:'Envoyer le défi pour sept jours'})).toBeDisabled();
 fireEvent.click(dialog.getByRole('checkbox',{name:'Halo'}));fireEvent.click(dialog.getByRole('checkbox',{name:'Portal'}));fireEvent.click(dialog.getByRole('radio',{name:'Halo'}));fireEvent.click(dialog.getByRole('button',{name:'Envoyer le défi pour sept jours'}));
 await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull());expect(request).toHaveBeenLastCalledWith('create',expect.objectContaining({handle:'bob',gameIds:['a','b'],choice:0}));expect(screen.getByText(/Ton choix est scellé/)).toBeVisible();
});
