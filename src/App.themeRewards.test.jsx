import { render, waitFor, screen, fireEvent, within } from "@testing-library/react";
import App from "./App";
import { setDoc } from "./services/d1Data";

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
  mockStore.clear();mockAccountStorage.setItem.mockImplementation((key,value)=>mockStore.set(key,value));setDoc.mockResolvedValue(undefined);
  mockStore.set("checkpoint-app-options",JSON.stringify({startTab:"options",sound:{enabled:false}}));
  mockStore.set("checkpoint-trial-progress",JSON.stringify({completed:{25:true,50:true}}));
  mockSettings={theme:"theme-checkpoint",unlockedThemes:[]};
  mockTrialCompleted={25:true,50:true};
  jest.spyOn(window,"scrollTo").mockImplementation(()=>{});
  window.matchMedia=jest.fn(()=>({matches:false,addEventListener:jest.fn(),removeEventListener:jest.fn()}));
  global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({items:[],cursor:null}),headers:{get:()=>"application/json"}});
});
afterEach(()=>{jest.restoreAllMocks();global.fetch=mockOriginalFetch;});

test("an existing level-50+ account earns the reward and saves it in private settings",async()=>{
  mockStore.set("checkpoint-weekly-quiz",JSON.stringify({totalXP:125000}));
  render(<App/>);
  await waitFor(()=>expect(JSON.parse(mockStore.get("checkpoint-theme-unlocks")||"[]")).toContain("theme-checkpointpremium"));
  await waitFor(()=>expect(setDoc.mock.calls.some(([ref,data])=>ref.collection==="playerPrivateSettings"&&data.unlockedThemes?.includes("theme-checkpointpremium"))).toBe(true),{timeout:2000});
  expect(document.body.dataset.theme).toBe("theme-checkpoint");
});

test("a saved premium selection below the required level falls back when account data is ready",async()=>{
  mockStore.set("checkpoint-theme","theme-checkpointpremium");mockSettings={theme:"theme-checkpointpremium",unlockedThemes:[]};
  render(<App/>);
  await waitFor(()=>expect(document.body.dataset.theme).toBe("theme-checkpoint"));
  expect(JSON.parse(mockStore.get("checkpoint-theme-unlocks")||"[]")).toEqual([]);
});

test("a cloud-earned reward remains selected for a low-level account",async()=>{
  mockStore.set("checkpoint-theme","theme-checkpointpremium");mockSettings={theme:"theme-checkpointpremium",unlockedThemes:["theme-checkpointpremium"]};
  render(<App/>);
  await waitFor(()=>expect(JSON.parse(mockStore.get("checkpoint-theme-unlocks")||"[]")).toContain("theme-checkpointpremium"));
  expect(document.body.dataset.theme).toBe("theme-checkpointpremium");
  expect(mockAccountStorage.setItem.mock.calls.filter(([key])=>key==="checkpoint-theme").map(([,value])=>value)).not.toContain("theme-checkpoint");
});

 test("a cloud-earned ultimate theme survives low XP and persists both rewards",async()=>{
  mockStore.set("checkpoint-theme","theme-checkpointultimate");
  mockSettings={theme:"theme-checkpointultimate",unlockedThemes:["theme-checkpointpremium","theme-checkpointultimate"]};
  render(<App/>);
  await waitFor(()=>expect(document.body.dataset.theme).toBe("theme-checkpointultimate"));
  await waitFor(()=>expect(JSON.parse(mockStore.get("checkpoint-theme-unlocks")||"[]")).toContain("theme-checkpointultimate"));
  expect(mockAccountStorage.setItem.mock.calls.filter(([key])=>key==="checkpoint-theme").map(([,value])=>value)).not.toContain("theme-checkpoint");
});

test("an unearned saved ultimate selection falls back after account loading",async()=>{
  mockStore.set("checkpoint-theme","theme-checkpointultimate");mockSettings={theme:"theme-checkpointultimate",unlockedThemes:["theme-checkpointpremium"]};
  render(<App/>);
  await waitFor(()=>expect(document.body.dataset.theme).toBe("theme-checkpoint"));
  expect(JSON.parse(mockStore.get("checkpoint-theme-unlocks")||"[]")).not.toContain("theme-checkpointultimate");
});


test("a level-100 account earns ultimate and saves it without changing its theme",async()=>{
  mockTrialCompleted={25:true,50:true,75:true,100:true};
  mockStore.set("checkpoint-trial-progress",JSON.stringify({completed:mockTrialCompleted}));
  mockStore.set("checkpoint-weekly-quiz",JSON.stringify({totalXP:5000000}));
  render(<App/>);
  await waitFor(()=>expect(JSON.parse(mockStore.get("checkpoint-theme-unlocks")||"[]")).toContain("theme-checkpointultimate"));
  await waitFor(()=>expect(setDoc.mock.calls.some(([ref,data])=>ref.collection==="playerPrivateSettings"&&data.unlockedThemes?.includes("theme-checkpointultimate"))).toBe(true),{timeout:2000});
  expect(document.body.dataset.theme).toBe("theme-checkpoint");
});

test("the authenticated owner earns ultimate early and syncs it to private settings",async()=>{
  const {auth}=require('./firebase');const {ownerUid}=require('./services/accountConfig');
  const previous=auth.currentUser;
  auth.currentUser={...previous,uid:ownerUid};
  try {
    render(<App/>);
    await waitFor(()=>expect(JSON.parse(mockStore.get("checkpoint-theme-unlocks")||"[]")).toContain("theme-checkpointultimate"));
    await waitFor(()=>expect(setDoc.mock.calls.some(([ref,data])=>ref.collection==="playerPrivateSettings"&&data.unlockedThemes?.includes("theme-checkpointultimate"))).toBe(true),{timeout:2000});
    expect(document.body.dataset.theme).toBe("theme-checkpoint");
  } finally {auth.currentUser=previous;}
});


test("owner management tools live together inside developer access",async()=>{
 const {auth}=require('./firebase');const {ownerUid}=require('./services/accountConfig');const previous=auth.currentUser;
 auth.currentUser={...previous,uid:ownerUid};
 try {
  render(<App/>);
  const access=await screen.findByRole('button',{name:/Accès développeur/});
  expect(screen.queryByRole('heading',{name:'Retours des testeurs'})).toBeNull();
  fireEvent.click(access);
  fireEvent.change(screen.getByLabelText('Code de l’espace développeur'),{target:{value:'1102'}});
  fireEvent.click(screen.getByRole('button',{name:'Déverrouiller'}));
  const workspace=screen.getByRole('group',{name:'Rubriques développeur'}).parentElement;
  expect(within(workspace).getByRole('button',{name:'Checkpoint 25',exact:true})).toBeVisible();
  fireEvent.click(within(workspace).getByRole('button',{name:'Retours',exact:true}));
  expect(screen.getAllByText('Retours des testeurs')).toHaveLength(1);
  expect(within(workspace).getByRole('heading',{name:'Retours des testeurs'})).toBeVisible();
  await screen.findByText('Aucun retour pour le moment.');
  fireEvent.click(within(workspace).getByRole('button',{name:'Lives et actus',exact:true}));
  expect(within(workspace).getByRole('heading',{name:'Lives et actualités'})).toBeVisible();
  expect(screen.queryByPlaceholderText('Entrer le code')).toBeNull();
  expect(screen.queryByLabelText('Code privé de la boîte de réception')).toBeNull();
 } finally {auth.currentUser=previous;}
});

test("other players can send feedback but cannot see developer tools or the inbox",async()=>{
 render(<App/>);
 await waitFor(()=>expect(document.querySelector('.options-tab')).not.toBeNull());
 expect(screen.getByRole('button',{name:'Faire un retour'})).toBeVisible();
 expect(screen.queryByRole('button',{name:/Accès développeur/})).toBeNull();
 expect(screen.queryByRole('heading',{name:'Retours des testeurs'})).toBeNull();
 expect(screen.queryByRole('heading',{name:/Accès administrateur/})).toBeNull();
 expect(document.querySelector('.developer-tools')).toBeNull();
});
