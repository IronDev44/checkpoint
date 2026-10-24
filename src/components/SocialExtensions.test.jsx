import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {compareFriendGames,socialCompletion} from '../services/friendComparison';
import {friendshipNotices} from '../services/friendships';
import SocialContactSettings,{BlockPlayerDialog} from './SocialContactSettings';
import ShareGameToFriend from './ShareGameToFriend';
import SocialReactions from './SocialReactions';
import {recommendationRequest} from '../services/rendezvousRequest';
jest.mock('../services/rendezvousRequest',()=>({recommendationRequest:jest.fn()}));
jest.mock('./ToolDialog',()=>({__esModule:true,default:({title,children})=><section role="dialog" aria-label={title}>{children}</section>}));
const controls={data:{preferences:{invitations:true,recommendations:true,challenges:true,reactions:true,sharedLibrary:false},blocked:[]},busy:false,error:'',act:jest.fn().mockResolvedValue({}),refresh:jest.fn()};
beforeEach(()=>{controls.act.mockClear();recommendationRequest.mockReset();});
test('notifies incoming requests and accepted sent invitations, but never refusals or blocks',()=>{
 const base={id:'one',profile:{displayName:'Alice'},createdAt:'2026-10-24'};
 const notices=friendshipNotices([{...base,status:'pending',direction:'received'},{...base,id:'two',status:'accepted',direction:'sent'},{...base,id:'three',status:'blocked',direction:'received'}]);
 expect(notices).toHaveLength(2);expect(notices.every(n=>n.category==='friends'&&n.type==='friendship')).toBe(true);
});
test('contact settings keep library sharing opt-in and change only the chosen preference',async()=>{
 render(<SocialContactSettings controls={controls}/>);
 fireEvent.click(screen.getByText('Contacts et confidentialité'));
 expect(screen.getByLabelText('Partager ma collection avec mes amis pour comparer nos jeux')).not.toBeChecked();
 fireEvent.click(screen.getByLabelText('Recevoir des recommandations'));
 await waitFor(()=>expect(controls.act).toHaveBeenCalledWith('preferences',{preferences:{recommendations:false}}));
});
test('blocking waits for confirmation and keeps the dialog open on failure',async()=>{
 const onClose=jest.fn(),act=jest.fn().mockRejectedValue(new Error('Connexion perdue'));
 render(<BlockPlayerDialog player={{handle:'alice',displayName:'Alice'}} controls={{...controls,act}} onClose={onClose}/>);
 expect(act).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Bloquer ce joueur'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Connexion perdue');expect(onClose).not.toHaveBeenCalled();
});
test('sharing from a game sheet retains the draft and id when retrying a failed send',async()=>{
 recommendationRequest.mockRejectedValueOnce(new Error('Réseau indisponible')).mockResolvedValueOnce({});
 render(<ShareGameToFriend game={{id:'halo',name:'Halo',rating:9,review:'PRIVATE'}} friends={[{handle:'alice',displayName:'Alice'}]}/>);
 fireEvent.click(screen.getByRole('button',{name:'Partager à un ami'}));
 fireEvent.change(screen.getByLabelText('Ton petit mot'),{target:{value:'Un jeu pour toi'}});
 fireEvent.click(screen.getByRole('button',{name:'Envoyer à mon ami'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Réseau indisponible');
 expect(screen.getByLabelText('Ton petit mot')).toHaveValue('Un jeu pour toi');
 fireEvent.click(screen.getByRole('button',{name:'Envoyer à mon ami'}));
 await screen.findByText('Jeu partagé. Retrouve cet échange dans Social → Recommandations.');
 expect(recommendationRequest.mock.calls[0][1]).toEqual(recommendationRequest.mock.calls[1][1]);
 expect(recommendationRequest.mock.calls[1][1]).not.toHaveProperty('review');
});
test('a reaction can be replaced or withdrawn instead of incrementing a counter',()=>{
 const resource={data:{alice:{canReact:true,reactions:{post:{mine:'well-played',counts:{'well-played':1,interested:0,'great-choice':0}}}}},busy:'',react:jest.fn()};
 render(<SocialReactions handle="alice" activityId="post" resource={resource}/>);
 fireEvent.click(screen.getByRole('button',{name:/Bien joué/}));expect(resource.react).toHaveBeenCalledWith('alice','post',null);
 fireEvent.click(screen.getByRole('button',{name:/Ça me tente/}));expect(resource.react).toHaveBeenCalledWith('alice','post','interested');
});
test('shared games are compared only with permission; missing completion is never treated as unfinished',()=>{
 const game={name:'Halo',sourceIds:{igdb:1},completed:true};
 expect(compareFriendGames([game],{sharedGames:[{...game,completed:false}]}).common).toHaveLength(0);
 const result=compareFriendGames([game],{sharedLibrary:true,sharedGames:[{...game,completed:false}]});
 expect(result.common).toHaveLength(1);expect(socialCompletion(result.common[0].game)).toBe(false);expect(socialCompletion({name:'Halo'})).toBeNull();
});
