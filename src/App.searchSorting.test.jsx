import {TAB_TUTORIALS} from './data/tabTutorials';
import { render, waitFor, screen, fireEvent, within, act } from "@testing-library/react";
import App from "./App";
import {GameService} from "./services/gameService";
jest.mock("./services/gameService",()=>({...jest.requireActual("./services/gameService"),GameService:{...jest.requireActual("./services/gameService").GameService,rawg:jest.fn(),igdb:jest.fn(),getUpcomingGames:jest.fn(async()=>({results:[]}))}}));
import { setDoc } from "./services/d1Data";
import { getWeeklyQuiz, getWeeklyQuizKey, getQuizAnswerKey } from "./services/weeklyQuiz";

const mockStore = new Map();
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
  collection:(_,collection)=>({collection}),doc:(_,collection,id)=>({collection,id}),
  onSnapshot:(ref,callback)=>{let active=true;Promise.resolve().then(()=>{if(active)callback(ref.id?{exists:()=>false,data:()=>({})}:{docs:[]});});return()=>{active=false;};},
  getDoc:async ref=>ref.collection==="playerPrivateSettings" ? {exists:()=>true,data:()=>mockSettings} : {exists:()=>true,data:()=>({completed:mockTrialCompleted})},
  setDoc:jest.fn(async()=>{}),updateDoc:jest.fn(async()=>{}),deleteDoc:jest.fn(async()=>{}),addDoc:jest.fn(async()=>({id:"fixture"})),
  serverTimestamp:()=>"fixture-time",arrayUnion:(...values)=>values,
}));

// Each case uses an in-memory account; no authentication or network writes.
const mockOriginalFetch = global.fetch;
beforeEach(()=>{
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
