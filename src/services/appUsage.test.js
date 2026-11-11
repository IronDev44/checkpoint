import {auth} from '../firebase';
import {startUsageTracking,usageRequest} from './appUsage';
jest.mock('../firebase',()=>({auth:{currentUser:null}}));
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
const originalFetch=global.fetch;
const visits=()=>fetch.mock.calls.filter(([url])=>url.includes('collection=appUsage')).length;
beforeEach(()=>{
 jest.useFakeTimers('modern');jest.setSystemTime(new Date('2026-10-25T12:00:00Z'));
 auth.currentUser={uid:'alice',getIdToken:jest.fn().mockResolvedValue('token')};
 Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});
 global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({ok:true,usage:true})});
});
afterEach(()=>{jest.useRealTimers();global.fetch=originalFetch;auth.currentUser=null;});
test('deduplicates activity, ignores hidden and idle tabs, and cleans up',async()=>{
 const stop=startUsageTracking();await flush();expect(visits()).toBe(1);
 document.dispatchEvent(new Event('pointerdown'));await flush();expect(visits()).toBe(1);
 Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});
 jest.advanceTimersByTime(10*60000);await flush();expect(visits()).toBe(1);
 Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});document.dispatchEvent(new Event('visibilitychange'));await flush();expect(visits()).toBe(2);
 jest.advanceTimersByTime(20*60000);await flush();
 const idleCalls=visits();jest.advanceTimersByTime(10*60000);await flush();expect(visits()).toBe(idleCalls);
 stop();document.dispatchEvent(new Event('pointerdown'));jest.advanceTimersByTime(10*60000);await flush();expect(visits()).toBe(idleCalls);
});
test('backs off when tracking fails without interrupting the app',async()=>{
 fetch.mockRejectedValue(Error('Offline'));const stop=startUsageTracking();await flush();
 for(let i=0;i<5;i++)document.dispatchEvent(new Event('pointerdown'));await flush();expect(fetch).toHaveBeenCalledTimes(1);expect(visits()).toBe(0);stop();
});
test('does not transmit a token after the account changes',async()=>{
 auth.currentUser.getIdToken=async()=>{auth.currentUser={uid:'bob'};return 'alice-token';};
 await expect(usageRequest()).rejects.toThrow('Le compte a changé.');expect(fetch).not.toHaveBeenCalled();
});

test('no activity is sent without positive consent',async()=>{fetch.mockResolvedValue({ok:true,json:async()=>({usage:false})});const stop=startUsageTracking();await flush();document.dispatchEvent(new Event('pointerdown'));jest.advanceTimersByTime(10*60000);await flush();expect(visits()).toBe(0);stop();});
