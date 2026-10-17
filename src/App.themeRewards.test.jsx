import { render, waitFor } from "@testing-library/react";
import App from "./App";
import { setDoc } from "./services/d1Data";

const mockStore = new Map();
let mockSettings;
const mockAccountStorage = {
  getItem: key => mockStore.get(key) ?? null,
  setItem: jest.fn((key,value)=>mockStore.set(key,value)),
  removeItem: key => mockStore.delete(key),
};
jest.mock("./firebase",()=>({db:{},auth:{currentUser:{uid:"theme-reward-fixture",displayName:"Fixture",email:"fixture@example.test"}}}));
jest.mock("./services/accountData",()=>({
  accountsEnabled:true,
  accountStorage:{getItem:(...args)=>mockAccountStorage.getItem(...args),setItem:(...args)=>mockAccountStorage.setItem(...args),removeItem:(...args)=>mockAccountStorage.removeItem(...args)},
  collection:(_,collection)=>({collection}),doc:(_,collection,id)=>({collection,id}),
}));
jest.mock("./services/d1Data",()=>({
  d1Enabled:true,
  collection:(_,collection)=>({collection}),doc:(_,collection,id)=>({collection,id}),
  onSnapshot:(ref,callback)=>{let active=true;Promise.resolve().then(()=>{if(active)callback(ref.id?{exists:()=>false,data:()=>({})}:{docs:[]});});return()=>{active=false;};},
  getDoc:async ref=>ref.collection==="playerPrivateSettings" ? {exists:()=>true,data:()=>mockSettings} : {exists:()=>true,data:()=>({completed:{25:true,50:true}})},
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
  jest.spyOn(window,"scrollTo").mockImplementation(()=>{});
  window.matchMedia=jest.fn(()=>({matches:false,addEventListener:jest.fn(),removeEventListener:jest.fn()}));
  global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>[],headers:{get:()=>"application/json"}});
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
