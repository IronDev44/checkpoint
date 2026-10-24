import {render,screen,fireEvent,within} from '@testing-library/react';
import ReleaseNotes,{ReleaseNotesDialog} from './ReleaseNotes';
import {TabTutorialEntry,TutorialLibrary} from './TabTutorials';
import {FEATURE_TUTORIALS,RELEASE_NOTES} from '../data/releaseNotes';
import {readReleaseProgress,markReleasesRead,pendingFeatureGuides} from '../services/releaseProgress';
import {notificationAllowed} from '../services/usefulUpdates';
const mockStore=new Map();
jest.mock('../services/accountData',()=>({accountStorage:{getItem:key=>mockStore.get(key)??null,setItem:(key,value)=>mockStore.set(key,value)}}));
beforeEach(()=>{mockStore.clear();jest.spyOn(window,'scrollTo').mockImplementation(()=>{});});
afterEach(()=>jest.restoreAllMocks());
test('closing patch notes does not mark them read; explicit acknowledgement persists',()=>{
 render(<ReleaseNotes/>);fireEvent.click(screen.getByRole('button',{name:'Voir les nouveautés'}));expect(screen.getByRole('dialog')).toHaveTextContent(RELEASE_NOTES[0].title);
 fireEvent.click(screen.getByRole('button',{name:'Fermer',exact:true}));expect(screen.getByText('Du nouveau dans Checkpoint')).toBeVisible();expect(readReleaseProgress().read).toEqual([]);
 fireEvent.click(screen.getByRole('button',{name:'Voir les nouveautés'}));fireEvent.click(screen.getByRole('button',{name:'J’ai lu les nouveautés'}));expect(readReleaseProgress().read).toEqual(RELEASE_NOTES.map(r=>r.id));expect(screen.queryByText('Du nouveau dans Checkpoint')).toBeNull();expect(screen.getByRole('button',{name:'Voir les nouveautés'})).toBeVisible();
});
test('reading a patch note does not suppress the feature tutorial in its tab',()=>{
 markReleasesRead(RELEASE_NOTES.map(r=>r.id));mockStore.set('checkpoint-tab-tutorials-v1',JSON.stringify({social:'completed'}));
 render(<TabTutorialEntry tab="social"/>);expect(screen.getByRole('dialog')).toHaveTextContent('Nouveautés · Social');expect(screen.getByRole('heading',{name:'Passer le témoin à un ami'})).toHaveFocus();expect(pendingFeatureGuides('social')).toHaveLength(0);
});
test('an existing player gets only the new features once, without losing base completion',()=>{
 mockStore.set('checkpoint-tab-tutorials-v1',JSON.stringify({home:'completed'}));const view=render(<TabTutorialEntry tab="home"/>);
 expect(screen.getByRole('dialog')).toHaveTextContent('Étape 1 sur 4');expect(screen.queryByRole('heading',{name:'Ton point de départ'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Suivant'}));fireEvent.click(screen.getByRole('button',{name:'Suivant'}));fireEvent.click(screen.getByRole('button',{name:'Suivant'}));expect(screen.getByText(/Options → Aide et tutoriels/)).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'J’ai compris'}));
 expect(JSON.parse(mockStore.get('checkpoint-tab-tutorials-v1')).home).toBe('completed');view.unmount();render(<TabTutorialEntry tab="home"/>);expect(screen.queryByRole('dialog')).toBeNull();
});
test('first-time players get the full current guide and no duplicate update tour',()=>{
 const view=render(<TabTutorialEntry tab="social"/>);expect(screen.getByRole('dialog')).toHaveTextContent('Guide · Social');expect(screen.getByRole('dialog')).not.toHaveTextContent('Nouveautés · Social');
 fireEvent.click(screen.getByRole('button',{name:'Fermer le tutoriel'}));view.unmount();render(<TabTutorialEntry tab="social"/>);expect(screen.queryByRole('dialog')).toBeNull();expect(pendingFeatureGuides('social')).toHaveLength(0);
});
test('unrelated tabs do not replay; closing one update does not consume another tab’s guide',()=>{
 mockStore.set('checkpoint-tab-tutorials-v1',JSON.stringify({home:'completed',social:'completed',hardware:'completed'}));
 const view=render(<TabTutorialEntry tab="hardware"/>);expect(screen.queryByRole('dialog')).toBeNull();view.unmount();const utils=render(<TabTutorialEntry tab="home"/>);fireEvent.click(screen.getByRole('button',{name:'Fermer le tutoriel'}));utils.unmount();render(<TabTutorialEntry tab="social"/>);expect(screen.getByRole('dialog')).toHaveTextContent('Passer le témoin à un ami');
});
test('update guides can be replayed from Help and from patch notes, preserving the parent dialog',()=>{
 const view=render(<TutorialLibrary/>);fireEvent.click(within(screen.getByRole('region',{name:'Guides des nouveautés'})).getByRole('button',{name:/Recommandations et choix cachés/}));expect(screen.getByRole('dialog')).toHaveTextContent('Nouveautés · Social');fireEvent.click(screen.getByRole('button',{name:'Fermer le tutoriel'}));view.unmount();
 const close=jest.fn();render(<ReleaseNotesDialog onClose={close}/>);fireEvent.click(screen.getByRole('button',{name:'Voir le guide · Accueil'}));const dialogs=screen.getAllByRole('dialog');expect(dialogs).toHaveLength(2);fireEvent.keyDown(within(dialogs[1]).getByRole('heading'),{key:'Escape'});expect(close).not.toHaveBeenCalled();expect(screen.getAllByRole('dialog')).toHaveLength(1);
});
test('unknown future guide IDs do not hide known unread additions; malformed storage stays usable',()=>{
 mockStore.set('checkpoint-release-progress-v1',JSON.stringify({read:['nonexistent'],guides:['future-feature']}));expect(readReleaseProgress()).toEqual({read:[],guides:[]});expect(pendingFeatureGuides('home')).toHaveLength(1);mockStore.set('checkpoint-release-progress-v1','bad json');expect(readReleaseProgress()).toEqual({read:[],guides:[]});
 expect(notificationAllowed({category:'updates'},{updates:false})).toBe(false);
 expect(new Set(FEATURE_TUTORIALS.map(g=>g.id)).size).toBe(FEATURE_TUTORIALS.length);
});
