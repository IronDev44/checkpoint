import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import ProfileVisibilityChoices from './ProfileVisibilityChoices';
import SocialReportDialog from './SocialReportDialog';
import SocialReportsInbox from './SocialReportsInbox';
import {FriendsActivityFeed} from './SocialHub';
import {socialReportRequest} from '../services/friendships';
import {activityMatchesFilter} from '../services/socialProfiles';
jest.mock('../services/friendships',()=>({...jest.requireActual('../services/friendships'),socialReportRequest:jest.fn()}));
jest.mock('./ToolDialog',()=>({__esModule:true,default:({title,children})=><section role="dialog" aria-label={title}>{children}</section>}));
beforeEach(()=>socialReportRequest.mockReset());
test('visibility has an explicit friends-only choice',()=>{
 const onChange=jest.fn();render(<ProfileVisibilityChoices value="friends" onChange={onChange}/>);
 expect(screen.getByRole('button',{name:'Amis uniquement'})).toHaveAttribute('aria-pressed','true');
 expect(screen.getByRole('button',{name:'Privé',exact:true})).toHaveAttribute('aria-pressed','false');
 fireEvent.click(screen.getByRole('button',{name:'Public',exact:true}));expect(onChange).toHaveBeenCalledWith('public');
});
test('muted friends never enter the feed or disappear from the friend source list',async()=>{
 const loadProfile=jest.fn().mockResolvedValue({handle:'alice',displayName:'Alice',recentActivity:[{id:'note',type:'Note',title:'Halo',date:'2026-10-23'},{id:'finished',type:'Terminé',title:'Portal',date:'2026-10-24'}]});
 const friends=[{handle:'alice'},{handle:'bob'}];
 render(<FriendsActivityFeed friends={friends} mutedHandles={['bob']} loadProfile={loadProfile} onOpen={jest.fn()}/>);
 expect(await screen.findByText('Portal')).toBeVisible();expect(loadProfile).toHaveBeenCalledTimes(1);expect(loadProfile).toHaveBeenCalledWith('alice');
 fireEvent.click(screen.getByRole('button',{name:'Jeux terminés',exact:true}));expect(screen.queryByText('Halo')).toBeNull();expect(screen.getByText('Portal')).toBeVisible();expect(friends).toHaveLength(2);
});
test('reporting retains the message after a failure and sends only after submission',async()=>{
 socialReportRequest.mockRejectedValueOnce(Error('Connexion perdue')).mockResolvedValueOnce({ok:true});
 render(<SocialReportDialog target={{type:'activity',handle:'bob',activityId:'post'}} onClose={jest.fn()}/>);
 expect(socialReportRequest).not.toHaveBeenCalled();
 fireEvent.change(screen.getByLabelText('Précisions (facultatif)'),{target:{value:'Un problème à regarder'}});
 fireEvent.click(screen.getByRole('button',{name:'Envoyer le signalement'}));expect(await screen.findByRole('alert')).toHaveTextContent('Connexion perdue');
 expect(screen.getByLabelText('Précisions (facultatif)')).toHaveValue('Un problème à regarder');
 fireEvent.click(screen.getByRole('button',{name:'Envoyer le signalement'}));expect(await screen.findByRole('status')).toHaveTextContent('Signalement envoyé');
 expect(socialReportRequest).toHaveBeenLastCalledWith('report',expect.objectContaining({handle:'bob',type:'activity',activityId:'post',details:'Un problème à regarder'}));
});
test('moderation changes persist only after a successful server response',async()=>{
 const item={id:'report',status:'new',reason:'spam',target:{type:'profile',handle:'bob',title:'Bob',snapshot:'Extrait'},reporter:{displayName:'Alice',handle:'alice'},createdAt:'2026-10-24'};
 socialReportRequest.mockResolvedValueOnce({items:[item],cursor:null}).mockRejectedValueOnce(Error('Erreur serveur')).mockResolvedValueOnce({ok:true});
 render(<SocialReportsInbox/>);await screen.findByText('Extrait');
 fireEvent.change(screen.getByLabelText('Suivi du signalement'),{target:{value:'resolved'}});
 expect(await screen.findByRole('alert')).toHaveTextContent('Erreur serveur');expect(screen.getByLabelText('Suivi du signalement')).toHaveValue('new');
 fireEvent.change(screen.getByLabelText('Suivi du signalement'),{target:{value:'resolved'}});
 await waitFor(()=>expect(screen.queryByText('Extrait')).toBeNull());
});
test('activity filters separate notes, completions, additions and posts',()=>{
 expect(activityMatchesFilter({type:'Note'},'reviews')).toBe(true);
 expect(activityMatchesFilter({type:'Note'},'completed')).toBe(false);
 expect(activityMatchesFilter({kind:'completed'},'completed')).toBe(true);
 expect(activityMatchesFilter({type:'Collection'},'added')).toBe(true);
 expect(activityMatchesFilter({type:'Post'},'posts')).toBe(true);
});
