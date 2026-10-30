import {renderHook,act,waitFor} from '@testing-library/react';
import useFriendships from './useFriendships';
import {friendshipRequest} from '../services/friendships';
jest.mock('../services/friendships',()=>({friendshipRequest:jest.fn()}));
beforeEach(()=>friendshipRequest.mockReset());
test('loads requests, refreshes after accepting and syncs the accepted friendship',async()=>{
 const pending={id:'one',status:'pending',profile:{handle:'alice'}};
 friendshipRequest.mockResolvedValueOnce({connections:[pending]}).mockResolvedValueOnce({ok:true}).mockResolvedValueOnce({connections:[{...pending,status:'accepted'}]});
 const onSync=jest.fn();
 const {result}=renderHook(()=>useFriendships({accountUid:'bob',enabled:true,onSync}));
 await waitFor(()=>expect(result.current.connections).toEqual([pending]));
 await act(()=>result.current.act('accept',{id:'one'}));
 expect(onSync).toHaveBeenLastCalledWith([{...pending,status:'accepted'}]);
 expect(result.current.busy).toBe(false);
});
test('ignores a request that completes after an account change',async()=>{
 let finish;friendshipRequest.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;})).mockResolvedValue({connections:[]});
 const onSync=jest.fn();
 const {result,rerender}=renderHook(({uid})=>useFriendships({accountUid:uid,enabled:true,onSync}),{initialProps:{uid:'alice'}});
 rerender({uid:'bob'});
 await waitFor(()=>expect(onSync).toHaveBeenCalledWith([]));
 await act(async()=>finish({connections:[{id:'private-alice-request'}]}));
 expect(result.current.connections).toEqual([]);
 expect(onSync).not.toHaveBeenCalledWith([{id:'private-alice-request'}]);
});

test('does not refresh or synchronize an action completing after unmount',async()=>{
 let finish;
 friendshipRequest.mockResolvedValueOnce({connections:[]}).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
 const onSync=jest.fn();
 const {result,unmount}=renderHook(()=>useFriendships({accountUid:'alice',enabled:true,onSync}));
 await waitFor(()=>expect(onSync).toHaveBeenCalledWith([]));
 let action;
 act(()=>{action=result.current.act('accept',{id:'one'});});
 unmount();
 await act(async()=>{finish({ok:true});await action;});
 expect(friendshipRequest).toHaveBeenCalledTimes(2);
 expect(onSync).toHaveBeenCalledTimes(1);
});

test('a conflict from another device refreshes the actual invitation and keeps the explanation',async()=>{
 friendshipRequest.mockResolvedValueOnce({connections:[{id:'one',status:'pending'}]}).mockRejectedValueOnce(Object.assign(Error('Invitation modifiée ailleurs.'),{status:409})).mockResolvedValue({connections:[{id:'one',status:'cancelled'}]});
 const {result}=renderHook(()=>useFriendships({accountUid:'alice',enabled:true,onSync:jest.fn()}));
 await waitFor(()=>expect(result.current.connections[0]?.status).toBe('pending'));
 await act(async()=>{await result.current.act('accept',{id:'one'}).catch(()=>{});});
 expect(result.current.connections[0].status).toBe('cancelled');expect(result.current.error).toBe('Invitation modifiée ailleurs.');expect(result.current.busy).toBe(false);
});

test('a focus refresh cannot overwrite an action in progress and another tab refreshes afterward',async()=>{
 let finish;friendshipRequest.mockResolvedValueOnce({connections:[]}).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;})).mockResolvedValue({connections:[{id:'one',status:'accepted'}]});
 const {result}=renderHook(()=>useFriendships({accountUid:'alice',enabled:true,onSync:jest.fn()}));
 await waitFor(()=>expect(friendshipRequest).toHaveBeenCalledTimes(1));
 let action;act(()=>{action=result.current.act('accept',{id:'one'});});
 act(()=>{window.dispatchEvent(new Event('focus'));});expect(friendshipRequest).toHaveBeenCalledTimes(2);
 await act(async()=>{finish({ok:true});await action;});expect(result.current.connections[0].status).toBe('accepted');
 await act(async()=>{window.dispatchEvent(new StorageEvent('storage',{key:'checkpoint-social-sync',newValue:'update'}));});
 expect(friendshipRequest).toHaveBeenCalledTimes(4);
});
