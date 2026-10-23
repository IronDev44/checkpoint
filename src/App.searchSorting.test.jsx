import {TAB_TUTORIALS} from './data/tabTutorials';
import { render, waitFor, screen, fireEvent, within, act } from "@testing-library/react";
import App from "./App";
import {GameService} from "./services/gameService";
jest.mock("./services/gameService",()=>({...jest.requireActual("./services/gameService"),GameService:{...jest.requireActual("./services/gameService").GameService,rawg:jest.fn(),igdb:jest.fn(),getUpcomingGames:jest.fn(async()=>({results:[]}))}}));
import * as deviceStore from "./services/deviceStore";
import { addDoc, setDoc, updateDoc, deleteDoc } from "./services/d1Data";
import { getWeeklyQuiz, getWeeklyQuizKey, getQuizAnswerKey } from "./services/weeklyQuiz";

const mockStore = new Map();
let mockGameDocuments = [];
let mockHardwareDocuments = [];
let mockSettings;
let mockTrialCompleted;
const mockAccountStorage = {
  getItem: key => mockStore.get(key) ?? null,
  setItem: jest.fn((key,value)=>mockStore.set(key,value)),
  removeItem: key => mockStore.delete(key),
};
jest.mock("./firebase",()=>({db:{},auth:{currentUser:{uid:"theme-reward-fixture",displayName:"Fixture",email:"fixture@example.test",getIdToken:async()=>"fixture-token"}}}));
jest.mock("./services/accountData",()=>({
  accountsEnabled:true,
  accountStorage:{getItem:(...args)=>mockAccountStorage.getItem(...args),setItem:(...args)=>mockAccountStorage.setItem(...args),removeItem:(...args)=>mockAccountStorage.removeItem(...args)},
  collection:(_,collection)=>({collection}),doc:(_,collection,id)=>({collection,id}),
}));
jest.mock("./services/d1Data",()=>({
  d1Enabled:true,
  offlineState:async()=>({jobs:[],enabled:true}),
  collection:(_,collection)=>({collection}),doc:(_,collection,id)=>({collection,id}),
  onSnapshot:(ref,callback)=>{let active=true;Promise.resolve().then(()=>{if(active)callback(ref.id?{exists:()=>false,data:()=>({})}:{docs:ref.collection==="games"?mockGameDocuments.map(game=>({id:game.id,data:()=>game})):ref.collection==="hardware"?mockHardwareDocuments.map(item=>({id:item.id,data:()=>item})):[]});});return()=>{active=false;};},
  getDoc:async ref=>ref.collection==="playerPrivateSettings" ? {exists:()=>true,data:()=>mockSettings} : {exists:()=>true,data:()=>({completed:mockTrialCompleted})},
  setDoc:jest.fn(async()=>{}),updateDoc:jest.fn(async()=>{}),deleteDoc:jest.fn(async()=>{}),addDoc:jest.fn(async()=>({id:"fixture"})),
  serverTimestamp:()=>"fixture-time",arrayUnion:(...values)=>values,
}));

// Each case uses an in-memory account; no authentication or network writes.
const mockOriginalFetch = global.fetch;
beforeEach(()=>{
  mockGameDocuments=[];mockHardwareDocuments=[];updateDoc.mockResolvedValue(undefined);addDoc.mockResolvedValue({id:'fixture'});
  mockStore.clear();mockStore.set('checkpoint-tab-tutorials-v1',JSON.stringify(Object.fromEntries(Object.keys(TAB_TUTORIALS).map(key=>[key,'completed']))));mockAccountStorage.setItem.mockImplementation((key,value)=>mockStore.set(key,value));setDoc.mockResolvedValue(undefined);
  mockStore.set("checkpoint-app-options",JSON.stringify({startTab:"options",sound:{enabled:false}}));
  mockStore.set("checkpoint-trial-progress",JSON.stringify({completed:{25:true,50:true}}));
  mockSettings={theme:"theme-checkpoint",unlockedThemes:[]};
  mockTrialCompleted={25:true,50:true};
  jest.spyOn(window,"scrollTo").mockImplementation(()=>{});
  window.matchMedia=jest.fn(()=>({matches:false,addEventListener:jest.fn(),removeEventListener:jest.fn()}));
  global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({items:[],cursor:null}),headers:{get:()=>"application/json"}});
});
afterEach(()=>{jest.restoreAllMocks();global.fetch=mockOriginalFetch;});

const searchGames=[{id:'a',name:'Halo Z',rating:5,released:'2020-01-01'},{id:'b',name:'Halo',rating:2,released:'2001-11-15'},{id:'c',name:'Halo A',rating:4,released:'2010-01-01'}];
const resultNames=()=>[...document.querySelectorAll('.results-container .game-title')].map(el=>el.textContent);
const fanSearchGames = [
 {id:'fan',name:'Halo Fan Adventure',keywords:[{name:'fan game'}]},
 {id:'official',name:'Ghost of Tsushima',keywords:[{name:'fan game'}],publishers:[{name:'Sony'}]},
 {id:'unknown',name:'Halo Unknown'},
 {id:'mod',name:'Halo Mod',keywords:[{name:'fan game'}],normalized:{gameType:{type:'Mod'}}},
];
const openSearch=async(options={})=>{
 GameService.getUpcomingGames.mockResolvedValue({results:[]});
 mockStore.set('checkpoint-app-options',JSON.stringify({startTab:'search',sound:{enabled:false},...options}));
 GameService.rawg.mockImplementation(async(path,params)=>String(path)==='/games'?{results:searchGames,meta:{source:'igdb'},next:'/api/igdb/games?search=Halo&page=2'}:{results:[]});
 GameService.igdb.mockResolvedValue({results:[{id:'d',name:'Halo 2',rating:3,released:'2004-11-09'}],next:null});
 render(<App/>);
 fireEvent.change(screen.getByPlaceholderText('Rechercher un jeu ou utiliser les filtres'),{target:{value:'Halo'}});
 await waitFor(()=>expect(resultNames()).toHaveLength(3),{timeout:3000});
};

test('search collection additions ask for progress and save it with one creation',async()=>{
 await openSearch();
 const card=document.querySelector('.results-container .game-card');
 fireEvent.click(card);fireEvent.click(await screen.findByRole('button',{name:'Collection',exact:true}));
 const dialog=await screen.findByRole('dialog',{name:'Ajouter à ma collection'});
 expect(addDoc.mock.calls.filter(([ref])=>ref.collection==='games')).toHaveLength(0);
 fireEvent.click(within(dialog).getByRole('button',{name:/^Déjà terminé/}));
 await waitFor(()=>expect(addDoc).toHaveBeenCalledWith({collection:'games'},expect.objectContaining({name:'Halo',completed:true,progressStatus:'completed',status:'collection',ratingExperience:'completed',rating:0})));
});
test('sorting updates visible results, sends the requested order, and retains it after loading more',async()=>{
 await openSearch();expect(resultNames()[0]).toBe('Halo');
 fireEvent.click(screen.getByRole('button',{name:'Ouvrir les filtres'}));
 fireEvent.click(screen.getByRole('button',{name:'Mieux notés',exact:true}));
 await waitFor(()=>expect(resultNames()).toEqual(['Halo Z','Halo A','Halo']));
 expect(GameService.rawg.mock.calls.at(-1)[1].get('ordering')).toBe('-rating');
 fireEvent.click(screen.getByRole('button',{name:'Plus anciens',exact:true}));
 await waitFor(()=>expect(resultNames()).toEqual(['Halo','Halo A','Halo Z']));
 expect(GameService.rawg.mock.calls.at(-1)[1].get('ordering')).toBe('released');
 fireEvent.click(screen.getByRole('button',{name:'Charger plus'}));
 await waitFor(()=>expect(resultNames()).toEqual(['Halo','Halo 2','Halo A','Halo Z']));
 fireEvent.click(screen.getByRole('button',{name:'Plus récents',exact:true}));
 await waitFor(()=>expect(resultNames()).toEqual(['Halo Z','Halo A','Halo']));
 fireEvent.click(screen.getByRole('button',{name:'Nom A-Z',exact:true}));
 await waitFor(()=>expect(resultNames()).toEqual(['Halo','Halo A','Halo Z']));
 fireEvent.click(screen.getByRole('button',{name:'Pertinence',exact:true}));
 await waitFor(()=>expect(resultNames()[0]).toBe('Halo'));
 expect(screen.getByRole('button',{name:'Pertinence',exact:true})).toHaveAttribute('aria-pressed','true');
 expect(GameService.rawg.mock.calls.at(-1)[1].has('ordering')).toBe(false);
});
test('a delayed answer cannot overwrite a newer sorting choice',async()=>{
 await openSearch();fireEvent.click(screen.getByRole('button',{name:'Ouvrir les filtres'}));
 let finish;GameService.rawg.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
 fireEvent.click(screen.getByRole('button',{name:'Plus anciens',exact:true}));
 fireEvent.click(screen.getByRole('button',{name:'Mieux notés',exact:true}));
 await waitFor(()=>expect(resultNames()[0]).toBe('Halo Z'));
 await act(async()=>{finish({results:[{id:'stale',name:'Outdated result'}],meta:{source:'igdb'}});});
 await waitFor(()=>expect(screen.queryByText('Outdated result')).toBeNull());
 expect(resultNames()).toEqual(['Halo Z','Halo A','Halo']);
});

test('fan preference only hides explicit fans, keeps official and uncertain titles, and persists without refetching',async()=>{
 await openSearch();
 GameService.rawg.mockResolvedValue({results:fanSearchGames,meta:{source:'igdb'},next:'/api/igdb/games?page=2'});
 fireEvent.click(screen.getByRole('button',{name:'Rechercher',exact:true}));
 await waitFor(()=>expect(resultNames()).toHaveLength(3));
 expect(resultNames()).toEqual(expect.arrayContaining(['Ghost of Tsushima','Halo Unknown','Halo Mod']));
 expect(screen.getByText(/1 jeu de fans masqué/)).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Ouvrir les filtres'}));
 const toggle=screen.getByRole('button',{name:'Inclure les jeux de fans',exact:true});
 expect(toggle).toHaveAttribute('aria-pressed','false');
 const requests=GameService.rawg.mock.calls.length;
 fireEvent.click(toggle);
 expect(resultNames()).toHaveLength(4);
 expect(document.querySelectorAll('.search-fan-badge')).toHaveLength(1);
 expect(GameService.rawg.mock.calls).toHaveLength(requests);
 await waitFor(()=>expect(JSON.parse(mockStore.get('checkpoint-app-options')).searchIncludeFanGames).toBe(true));
 fireEvent.click(screen.getByRole('button',{name:'Charger plus'}));
 await waitFor(()=>expect(resultNames()).toHaveLength(5));
 expect(toggle).toHaveAttribute('aria-pressed','true');
 fireEvent.click(screen.getByRole('button',{name:'Réinitialiser les filtres'}));
 expect(toggle).toHaveAttribute('aria-pressed','false');
 expect(resultNames()).not.toContain('Halo Fan Adventure');
});

test('an entirely hidden fan page still permits loading the next page',async()=>{
 await openSearch();
 GameService.rawg.mockResolvedValue({results:[fanSearchGames[0]],meta:{source:'igdb'},next:'/api/igdb/games?page=2'});
 fireEvent.click(screen.getByRole('button',{name:'Rechercher',exact:true}));
 await waitFor(()=>expect(screen.getByText(/1 jeu de fans masqué/)).toBeInTheDocument());
 expect(resultNames()).toHaveLength(0);
 fireEvent.click(screen.getByRole('button',{name:'Charger plus'}));
 await waitFor(()=>expect(resultNames()).toEqual(['Halo 2']));
});

test('a saved inclusion preference is restored at startup',async()=>{
 await openSearch({searchIncludeFanGames:true});
 GameService.rawg.mockResolvedValue({results:fanSearchGames,meta:{source:'igdb'}});
 fireEvent.click(screen.getByRole('button',{name:'Rechercher',exact:true}));
 await waitFor(()=>expect(resultNames()).toHaveLength(4));
 fireEvent.click(screen.getByRole('button',{name:'Ouvrir les filtres'}));
 expect(screen.getByRole('button',{name:'Inclure les jeux de fans',exact:true})).toHaveAttribute('aria-pressed','true');
});

test('a failed favourite keeps the choice, retries it and can undo the confirmed write',async()=>{
 mockGameDocuments=[{id:'saved-halo',name:'Halo',status:'collection',favorite:false,rating:8,image:'/checkpoint-icon-192.png'}];
 await openSearch();
 fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Bibliothèque',exact:true}));
 await waitFor(()=>expect(document.querySelector('.grid-heart')).not.toBeNull());
 updateDoc.mockRejectedValueOnce(new Error('offline'));
 fireEvent.click(document.querySelector('.grid-heart'));
 expect(await screen.findByRole('alert')).toHaveTextContent('Modification non enregistrée');
 expect(document.querySelector('.grid-heart')).toHaveClass('active');
 fireEvent.click(screen.getByRole('button',{name:'Réessayer',exact:true}));
 await screen.findByRole('button',{name:'Annuler',exact:true});
 expect(updateDoc.mock.calls.filter(([ref])=>ref.collection==='games').at(-1)[1]).toEqual(expect.objectContaining({favorite:true,favoriteAt:expect.any(String)}));
 fireEvent.click(screen.getByRole('button',{name:'Annuler',exact:true}));
 await waitFor(()=>expect(updateDoc.mock.calls.filter(([ref])=>ref.collection==='games').at(-1)[1]).toEqual(expect.objectContaining({favorite:false,favoriteAt:null})));
 expect(document.querySelector('.grid-heart')).not.toHaveClass('active');
});

test('public profile editing is reached directly from the personal profile',async()=>{
 await openSearch();
 fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Profil',exact:true}));
 fireEvent.click(await screen.findByRole('button',{name:'Modifier mon profil public',exact:true}));
 expect(await screen.findByRole('heading',{name:'Identité publique'})).toBeVisible();
 expect(screen.getByRole('button',{name:'Profil public',exact:true})).toHaveAttribute('aria-pressed','true');
});

test('an unfinished review survives another edit and a failed save keeps its editor open',async()=>{
 mockGameDocuments=[{id:'saved-halo',name:'Halo',status:'collection',rating:8,review:'Ancien avis',image:'/checkpoint-icon-192.png'}];
 await openSearch();
 fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Bibliothèque',exact:true}));
 await waitFor(()=>expect(document.querySelector('.game-grid-item')).not.toBeNull());
 fireEvent.click(document.querySelector('.game-grid-item'));
 fireEvent.click(await screen.findByText('Mon avis et son partage'));const editor=await screen.findByPlaceholderText('Ton avis sur ce jeu...');
 fireEvent.change(editor,{target:{value:'Mon avis en cours de rédaction'}});
 fireEvent.click(document.querySelector('.game-detail-premium-actions .heart-btn'));
 await waitFor(()=>expect(updateDoc).toHaveBeenCalled());
 expect(editor).toHaveValue('Mon avis en cours de rédaction');
 updateDoc.mockRejectedValueOnce(new Error('offline'));
 fireEvent.click(screen.getByRole('button',{name:'Enregistrer l’avis',exact:true}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Modification non enregistrée');
 expect(editor).toBeVisible();expect(editor).toHaveValue('Mon avis en cours de rédaction');
});

test('the global search matches locally while typing and opens the saved game',async()=>{
 mockGameDocuments=[{id:'saved-halo',name:'Halo',status:'collection',rating:8,image:'/checkpoint-icon-192.png'}];await openSearch();GameService.rawg.mockClear();
 fireEvent.click(screen.getByRole('button',{name:'Rechercher dans mon espace',exact:true}));fireEvent.change(screen.getByLabelText('Jeu, matériel, série ou ami'),{target:{value:'Halo'}});
 expect(GameService.rawg).not.toHaveBeenCalled();
 fireEvent.click(within(document.querySelector('.personal-search-results')).getByRole('button'));
 expect(await screen.findByRole('button',{name:'Fermer la fiche du jeu'})).toBeVisible();
});
test('a quick completion uses the same consistent progression mutation as the full sheet',async()=>{
 mockGameDocuments=[{id:'saved-halo',name:'Halo',status:'collection',rating:8,image:'/checkpoint-icon-192.png'}];await openSearch();
 fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Bibliothèque',exact:true}));
 fireEvent.click(await screen.findByRole('button',{name:'Actions rapides pour Halo'}));fireEvent.click(screen.getByRole('button',{name:'Marquer terminé'}));
 await waitFor(()=>expect(updateDoc).toHaveBeenCalledWith({collection:'games',id:'saved-halo'},expect.objectContaining({completed:true,progressStatus:'completed',status:'collection'})));
 expect(screen.queryByPlaceholderText('Ton avis sur ce jeu...')).toBeNull();
});
test('home preferences persist when a block is hidden and survive reopening home',async()=>{
 mockGameDocuments=[{id:'saved-halo',name:'Halo',status:'collection',rating:8,image:'/checkpoint-icon-192.png'}];await openSearch();
 fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Accueil',exact:true}));
 fireEvent.click(await screen.findByText('Personnaliser l’accueil'));fireEvent.click(screen.getByLabelText('Ma collection'));
 expect(document.querySelector('.home-collection-overview')).toBeNull();expect(JSON.parse(mockStore.get('checkpoint-app-options')).homeLayout.hidden).toContain('collection');
 fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Bibliothèque',exact:true}));fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Accueil',exact:true}));
 await act(async()=>{});
 expect(document.querySelector('.home-collection-overview')).toBeNull();expect(document.querySelector('.home-page').children[0]).toHaveClass('xp-card');
});

test('the global hardware result opens its editable detail instead of only the hardware tab',async()=>{
 mockHardwareDocuments=[{id:'hardware-one',name:'Console personnelle',type:'console',brand:'Sony',status:'possédé'}];await openSearch();
 fireEvent.click(screen.getByRole('button',{name:'Rechercher dans mon espace',exact:true}));fireEvent.change(screen.getByLabelText('Jeu, matériel, série ou ami'),{target:{value:'Console personnelle'}});
 fireEvent.click(within(document.querySelector('.personal-search-results')).getByRole('button'));
 expect(await screen.findByRole('heading',{name:'Console personnelle',exact:true})).toBeVisible();expect(document.querySelector('.hardware-inline-detail')).not.toBeNull();
});
test('the global series result opens that series directly',async()=>{
 mockGameDocuments=[{id:'h1',name:'Halo',status:'collection'},{id:'h2',name:'Halo 2',status:'collection'}];await openSearch();
 fireEvent.click(screen.getByRole('button',{name:'Rechercher dans mon espace',exact:true}));fireEvent.change(screen.getByLabelText('Jeu, matériel, série ou ami'),{target:{value:'Halo'}});fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Séries',exact:true}));
 fireEvent.click(within(document.querySelector('.personal-search-results')).getByRole('button'));
 expect(await screen.findByRole('button',{name:'Retour',exact:true})).toBeVisible();expect(screen.getByRole('heading',{name:'Halo',exact:true})).toBeVisible();
});

test('Steam import requires a review, excludes repeated IDs and never overwrites personal progress or ratings',async()=>{
 mockGameDocuments=[{id:'portal-owned',name:'Portal',steamAppId:1,status:'collection',completed:true,progressStatus:'completed',rating:9.5,review:'Mon avis',favorite:true,image:'my-cover.png'}];
 jest.spyOn(deviceStore,'captureBackup').mockResolvedValue();addDoc.mockResolvedValue({id:'import-new'});await openSearch();
 const source=[{name:'Portal',steamAppId:1,playtimeForever:300,image:'steam.png'},{name:'BioShock',steamAppId:2},{name:'BioShock',steamAppId:2}];
 global.fetch.mockImplementation(async url=>({ok:true,headers:{get:()=> 'application/json'},json:async()=>String(url).includes('/api/steam/owned-games')?{games:source,total:3,steamId:'fixture'}:{items:[],deals:[]}}));
 fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Options',exact:true}));fireEvent.click(await screen.findByRole('button',{name:/Profil & services Profil public/}));fireEvent.click(screen.getByRole('button',{name:'Gerer les services',exact:true}));
 fireEvent.change(screen.getByPlaceholderText('URL Steam complete ou SteamID64'),{target:{value:'fixture'}});fireEvent.click(screen.getByRole('button',{name:'Analyser',exact:true}));
 fireEvent.click(await screen.findByRole('button',{name:'Importer 1 jeu',exact:true}));expect(screen.getByRole('dialog',{name:'Vérifier l’import Steam'})).toBeVisible();expect(addDoc).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Confirmer l’import'}));await waitFor(()=>expect(addDoc).toHaveBeenCalledTimes(1));
 const patch=updateDoc.mock.calls.find(([ref])=>ref.collection==='games'&&ref.id==='portal-owned')[1];
 expect(patch).toMatchObject({image:'my-cover.png',steamAppId:1});expect(patch.rating).toBeUndefined();expect(patch.review).toBeUndefined();expect(patch.completed).toBeUndefined();expect(patch.progressStatus).toBeUndefined();expect(patch.favorite).toBeUndefined();
 await waitFor(()=>expect(screen.queryByRole('dialog',{name:'Vérifier l’import Steam'})).toBeNull());
});


test('the real review editor wraps a selected passage and saves its spoiler setting atomically',async()=>{
 mockGameDocuments=[{id:'saved-halo',name:'Halo',status:'collection',rating:8,review:'Début Secret fin',image:'/checkpoint-icon-192.png'}];
 await openSearch();fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Bibliothèque',exact:true}));
 await waitFor(()=>expect(document.querySelector('.game-grid-item')).not.toBeNull());fireEvent.click(document.querySelector('.game-grid-item'));
 fireEvent.click(await screen.findByText('Mon avis et son partage'));const editor=await screen.findByLabelText('Ton avis personnel');editor.selectionStart=6;editor.selectionEnd=12;fireEvent.select(editor);fireEvent.click(screen.getByText('Masquer la sélection'));
 expect(editor).toHaveValue('Début [spoiler]Secret[/spoiler] fin');expect(screen.getByText('Révéler le spoiler')).toBeInTheDocument();fireEvent.click(screen.getByLabelText('Tout mon avis contient des spoilers'));fireEvent.click(screen.getByLabelText('Afficher cet avis dans mon activité publique'));fireEvent.click(screen.getByRole('button',{name:'Enregistrer l’avis',exact:true}));
 await waitFor(()=>expect(updateDoc).toHaveBeenCalledWith({collection:'games',id:'saved-halo'},expect.objectContaining({review:'Début [spoiler]Secret[/spoiler] fin',reviewSpoiler:true,reviewShared:true})));
});


test('an in-app poll invitation opens the actual poll destination',async()=>{
 const poll={id:'invited',title:'Je commence lequel ?',author:'Alex',createdAt:new Date().toISOString(),endsAt:new Date(Date.now()+86400000).toISOString(),options:[{name:'Halo'},{name:'Portal'}],counts:[0,0],total:0,myVote:null,isOwner:false};
 global.fetch.mockImplementation(async url=>({ok:true,json:async()=>String(url).includes('collection=friendPolls')?{polls:[poll]}:{items:[],cursor:null},headers:{get:()=> 'application/json'}}));
 await openSearch();fireEvent.click(screen.getByRole('button',{name:'Ouvrir les notifications utiles'}));fireEvent.click(await screen.findByText('Alex attend ton vote'));
 await waitFor(()=>expect(document.querySelector('#friend-poll-invited')).not.toBeNull());expect(screen.getByRole('button',{name:'Sondages',exact:true})).toHaveAttribute('aria-pressed','true');
});

test('monthly notification opens the previous month even if its home block is hidden',async()=>{
 const now=new Date(),previous=new Date(now.getFullYear(),now.getMonth()-1,5),key=`${previous.getFullYear()}-${String(previous.getMonth()+1).padStart(2,'0')}`;
 mockGameDocuments=[{id:'a',name:'Halo',createdAt:previous.toISOString(),status:'collection'}];await openSearch({homeLayout:{hidden:['monthly']}});
 fireEvent.click(screen.getByRole('button',{name:'Ouvrir les notifications utiles'}));fireEvent.click(await screen.findByText('Ton bilan du mois est prêt'));expect(await screen.findByRole('dialog',{name:'Mon bilan mensuel'})).toBeInTheDocument();expect(screen.getByLabelText('Mois du bilan')).toHaveValue(key);
});


test('favorite reason is saved on its game from the actual detail editor',async()=>{
 mockGameDocuments=[{id:'saved-halo',name:'Halo',status:'collection',favorite:true,rating:8,image:'/checkpoint-icon-192.png'}];await openSearch();fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Bibliothèque',exact:true}));await waitFor(()=>expect(document.querySelector('.game-grid-item')).not.toBeNull());fireEvent.click(document.querySelector('.game-grid-item'));fireEvent.change(await screen.findByLabelText('Ta phrase pour Halo'),{target:{value:'Mon premier grand FPS'}});fireEvent.click(screen.getByLabelText('Afficher cette phrase dans ma vitrine'));fireEvent.click(screen.getByText('Enregistrer ma phrase'));await waitFor(()=>expect(updateDoc).toHaveBeenCalledWith({collection:'games',id:'saved-halo'},expect.objectContaining({favoriteReason:'Mon premier grand FPS',favoriteReasonShared:true,favoriteReasonUpdatedAt:expect.any(String)})));
});
test('rediscovery pins a finished favorite without changing its progress or rating',async()=>{
 mockGameDocuments=[{id:'saved-halo',name:'Halo',status:'collection',completed:true,progressStatus:'completed',completedAt:'2020-01-01',rating:9,image:'/checkpoint-icon-192.png'}];await openSearch();fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Accueil',exact:true}));fireEvent.click(await screen.findByRole('button',{name:/À redécouvrir.*Ouvrir/}));fireEvent.click(await screen.findByText('Garder pour rejouer'));await waitFor(()=>expect(updateDoc).toHaveBeenCalledWith({collection:'games',id:'saved-halo'},{rediscoverPinned:true}));expect(await screen.findByText('Gardé pour rejouer')).toBeInTheDocument();
});

test('a rejected privacy change keeps the public state and gives an explicit error',async()=>{
 mockSettings={theme:'theme-checkpoint',socialProfile:{handle:'test-player',visibility:'public',displayName:'Fixture'}};await openSearch();fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Social',exact:true}));fireEvent.click(await screen.findByRole('button',{name:'Profil public',exact:true}));deleteDoc.mockRejectedValueOnce(new Error('Network failed'));fireEvent.click(screen.getByRole('button',{name:'Privé',exact:true}));await screen.findByText('Impossible de changer la visibilité pour le moment.');expect(screen.getByRole('button',{name:'Public',exact:true})).toHaveClass('active');expect(JSON.parse(mockStore.get('checkpoint-social-profile')).visibility).toBe('public');
});
test('dismissed notifications are stored for the current account',async()=>{
 const poll={id:'dismiss-test',title:'Je commence lequel ?',author:'Alex',createdAt:new Date().toISOString(),endsAt:new Date(Date.now()+86400000).toISOString(),options:[{name:'Halo'},{name:'Portal'}],counts:[0,0],total:0,myVote:null};global.fetch.mockImplementation(async url=>({ok:true,json:async()=>String(url).includes('collection=friendPolls')?{polls:[poll]}:{items:[],cursor:null},headers:{get:()=> 'application/json'}}));
 await openSearch();fireEvent.click(screen.getByRole('button',{name:'Ouvrir les notifications utiles'}));await screen.findByText('Alex attend ton vote');const row=screen.getByText('Alex attend ton vote').closest('.notification-item');fireEvent.click(within(row).getByRole('button',{name:'Masquer cette notification'}));expect(JSON.parse(mockStore.get('checkpoint-dismissed-notifications-v2'))).toContain('poll-invite-dismiss-test');
});


test('going private waits for an in-flight public update before deleting the profile',async()=>{
 mockSettings={theme:'theme-checkpoint',socialProfile:{handle:'test-player',visibility:'public',displayName:'Fixture'}};
 await openSearch();fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Social',exact:true}));fireEvent.click(await screen.findByRole('button',{name:'Profil public',exact:true}));
 let finishPublicWrite;
 setDoc.mockImplementation(async ref=>{if(ref.collection==='publicProfiles')await new Promise(resolve=>{finishPublicWrite=resolve;});});
 fireEvent.change(screen.getByPlaceholderText('Ta petite présentation gaming'),{target:{value:'Ma présentation'}});
 await waitFor(()=>expect(finishPublicWrite).toBeDefined());
 const deletionsBefore=deleteDoc.mock.calls.length;
 fireEvent.click(screen.getByRole('button',{name:'Privé',exact:true}));
 await act(async()=>{await Promise.resolve();});
 expect(deleteDoc.mock.calls).toHaveLength(deletionsBefore);
 await act(async()=>{finishPublicWrite();});
 await waitFor(()=>expect(deleteDoc).toHaveBeenCalledWith({collection:'publicProfiles',id:'test-player'}));
 expect(screen.getByRole('button',{name:'Privé',exact:true})).toHaveClass('active');
 expect(JSON.parse(mockStore.get('checkpoint-social-profile')).visibility).toBe('prive');
});


test('paused games leave the in-progress view, retain their rating and can be resumed',async()=>{
 mockGameDocuments=[{id:'journey-halo',name:'Halo',status:'en cours',progressStatus:'in_progress',completed:false,rating:9,image:'/checkpoint-icon-192.png'}];await openSearch();fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Bibliothèque',exact:true}));fireEvent.click(await screen.findByRole('button',{name:'En cours',exact:true}));fireEvent.click(await screen.findByLabelText('Actions rapides pour Halo'));fireEvent.click(screen.getByRole('button',{name:'Mettre en pause'}));
 await waitFor(()=>expect(updateDoc).toHaveBeenCalledWith({collection:'games',id:'journey-halo'},expect.objectContaining({status:'collection',progressStatus:'paused',completed:false})));
 fireEvent.click(screen.getByRole('button',{name:'En pause',exact:true}));await waitFor(()=>expect(document.querySelector('.game-grid-item')).not.toBeNull());expect(document.querySelector('.grid-status')).toHaveTextContent('En pause');fireEvent.click(screen.getByLabelText('Actions rapides pour Halo'));fireEvent.click(screen.getByRole('button',{name:'Passer en cours'}));await waitFor(()=>expect(updateDoc).toHaveBeenCalledWith({collection:'games',id:'journey-halo'},expect.objectContaining({status:'en cours',progressStatus:'in_progress',completed:false})));expect(updateDoc.mock.calls.filter(([ref])=>ref.collection==='games').every(([,patch])=>!Object.hasOwn(patch,'rating'))).toBe(true);
});
test('content preferences hide navigation without losing the options entry and lists persist in private settings',async()=>{
 await openSearch();fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Options',exact:true}));fireEvent.click(await screen.findByText('Préférences de contenu'));fireEvent.click(screen.getByRole('checkbox',{name:'Social',exact:true}));expect(within(document.querySelector('.bottom-tabs')).queryByRole('button',{name:'Social',exact:true})).not.toBeInTheDocument();expect(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Options',exact:true})).toBeInTheDocument();
 fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Bibliothèque',exact:true}));fireEvent.click(await screen.findByRole('button',{name:'Mes listes',exact:true}));fireEvent.change(screen.getByLabelText('Nom de la nouvelle liste'),{target:{value:'Mes vacances'}});fireEvent.click(screen.getByRole('button',{name:'Créer une liste'}));
 await waitFor(()=>expect(updateDoc.mock.calls.some(([ref,patch])=>ref.collection==='playerPrivateSettings'&&(patch['appOptions.personalLists']||patch.appOptions?.personalLists)?.[0]?.name==='Mes vacances')).toBe(true),{timeout:3000});expect(setDoc.mock.calls.filter(([ref])=>ref.collection==='publicProfiles')).toHaveLength(0);
});


test('game sheets manage private lists and record real progression changes in the saved game',async()=>{
 mockGameDocuments=[{id:'history-halo',name:'Halo',status:'collection',progressStatus:'not_started',image:'/checkpoint-icon-192.png'}];await openSearch();fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Bibliothèque',exact:true}));await waitFor(()=>expect(document.querySelector('.game-grid-item')).not.toBeNull());fireEvent.click(document.querySelector('.game-grid-item'));fireEvent.click(await screen.findByText('Dans ta bibliothèque',{exact:true}));fireEvent.click(screen.getByText('Mes listes · 0'));fireEvent.change(screen.getByLabelText('Nouvelle liste pour ce jeu'),{target:{value:'Coop du week-end'}});fireEvent.click(screen.getByText('Créer et ajouter ce jeu'));expect(screen.getByRole('checkbox',{name:'Coop du week-end'})).toBeChecked();
 fireEvent.change(screen.getByRole('combobox',{name:'Ma progression'}),{target:{value:'in_progress'}});fireEvent.click(screen.getByText('Enregistrer ma progression'));await waitFor(()=>expect(updateDoc).toHaveBeenCalledWith({collection:'games',id:'history-halo'},expect.objectContaining({progressStatus:'in_progress',playHistory:expect.arrayContaining([expect.objectContaining({type:'started',at:expect.any(String)})])})));
 fireEvent.click(screen.getByText('Historique de ta partie'));expect(screen.getByText('Partie commencée')).toBeInTheDocument();await waitFor(()=>expect(updateDoc.mock.calls.some(([ref,patch])=>ref.collection==='playerPrivateSettings'&&(patch['appOptions.personalLists']||patch.appOptions?.personalLists)?.[0]?.gameIds.includes('history-halo'))).toBe(true),{timeout:3000});
});
test('hardware collection filters combine brand and obtained year without removing data',async()=>{
 mockHardwareDocuments=[{id:'sony-five',name:'PS5 Slim test',catalogId:'ps5',type:'console',brand:'Sony',status:'possédé',acquiredYear:2024},{id:'nin-switch',name:'Switch test',type:'console',brand:'Nintendo',status:'possédé',acquiredYear:2020}];await openSearch();fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Matériel',exact:true}));fireEvent.click(await screen.findByText('Rechercher et filtrer mon matériel'));fireEvent.change(screen.getByRole('combobox',{name:'Marque',exact:true}),{target:{value:'Sony'}});await waitFor(()=>expect(document.querySelectorAll('.hardware-card-v3').length).toBeGreaterThan(0));expect(document.querySelector('.hardware-collection-sections')).toHaveTextContent('PS5 Slim test');expect(document.querySelector('.hardware-collection-sections')).not.toHaveTextContent('Switch test');fireEvent.change(screen.getByRole('combobox',{name:'Année d’obtention',exact:true}),{target:{value:'2020'}});expect(screen.getByText('Aucun matériel ne correspond aux filtres')).toBeInTheDocument();fireEvent.click(screen.getByText('Effacer les filtres du matériel'));expect(document.querySelector('.hardware-collection-sections')).toHaveTextContent('Switch test');expect(updateDoc.mock.calls.filter(([ref])=>ref.collection==='hardware')).toHaveLength(0);
});


test('Checkpoint experiences save time capsules only in the private account settings',async()=>{
 await openSearch();fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Accueil',exact:true}));fireEvent.click(await screen.findByRole('button',{name:/Expériences Checkpoint.*Ouvrir/}));fireEvent.click(await screen.findByRole('button',{name:/04 Capsules temporelles/}));fireEvent.click(screen.getByText('Préparer une capsule'));fireEvent.change(screen.getByLabelText('Titre de ma capsule'),{target:{value:'Ma prochaine aventure'}});fireEvent.change(screen.getByLabelText('Mon message'),{target:{value:'Ma prédiction privée'}});fireEvent.click(screen.getByText('Sceller ma capsule'));await waitFor(()=>expect(updateDoc.mock.calls.some(([ref,patch])=>ref.collection==='playerPrivateSettings'&&(patch['appOptions.experiences.capsules']||patch['appOptions.experiences']?.capsules||patch.appOptions?.experiences?.capsules)?.[0]?.title==='Ma prochaine aventure')).toBe(true),{timeout:3000});expect(setDoc.mock.calls.filter(([ref])=>ref.collection==='publicProfiles')).toHaveLength(0);
});

test('a retrospective memory persists privately without editing the game review or publishing it',async()=>{
 const now=new Date(),date=new Date(Date.UTC(now.getUTCFullYear()-2,now.getUTCMonth(),now.getUTCDate())).toISOString();
 mockGameDocuments=[{id:'memory-halo',name:'Halo',status:'collection',completed:true,completedAt:date,rating:8,review:'Avis initial'}];
 await openSearch({homeLayout:{groupActivities:false,order:['rendezvous']}});
 fireEvent.click(within(document.querySelector('.bottom-tabs')).getByRole('button',{name:'Accueil',exact:true}));
 fireEvent.click(await screen.findByRole('button',{name:'Souvenirs',exact:true}));fireEvent.click(screen.getByRole('button',{name:'Ajouter un mot avec le recul'}));
 fireEvent.change(screen.getByLabelText('Ce que j’en retiens aujourd’hui'),{target:{value:'Mon regard après deux ans'}});fireEvent.click(screen.getByRole('button',{name:'Conserver mon souvenir'}));
 await waitFor(()=>expect(updateDoc.mock.calls.some(([ref,patch])=>ref.collection==='playerPrivateSettings'&&Object.keys(patch).some(key=>key==='appOptions'||key.startsWith('appOptions.engagement'))&&JSON.stringify(patch).includes('Mon regard après deux ans'))).toBe(true),{timeout:3000});
 expect(updateDoc.mock.calls.filter(([ref])=>ref.collection==='games')).toHaveLength(0);expect(setDoc.mock.calls.filter(([ref])=>ref.collection==='publicProfiles')).toHaveLength(0);
});


test('the owner’s two startup paths share one news import and failed HTTP is not cached as success',async()=>{
 GameService.getUpcomingGames.mockResolvedValue({results:[]});GameService.rawg.mockResolvedValue({results:[]});
 const {auth}=require('./firebase'),{ownerUid}=require('./services/accountConfig');
 const previous=auth.currentUser.uid;auth.currentUser.uid=ownerUid;
 let finish;const pending=new Promise(resolve=>{finish=resolve;});
 global.fetch=jest.fn(url=>String(url).includes('rss2json')?pending:Promise.resolve({ok:true,json:async()=>({items:[]}),headers:{get:()=> 'application/json'}}));
 const quiet=jest.spyOn(console,'error').mockImplementation(()=>{});
 try{
  render(<App/>);
  await waitFor(()=>expect(global.fetch.mock.calls.filter(([url])=>String(url).includes('rss2json'))).toHaveLength(1));
  await act(async()=>finish({ok:false,status:503,json:async()=>({error:'Unavailable'})}));
  expect(mockStore.has('checkpoint-last-news-import')).toBe(false);
  expect(setDoc.mock.calls.some(([ref])=>ref.collection==='news')).toBe(false);
 }finally{auth.currentUser.uid=previous;quiet.mockRestore();}
});
