import {mergeConfirmedFriends,friendshipRequest} from './friendships';
import {auth} from '../firebase';
jest.mock('../firebase',()=>({auth:{currentUser:null}}));
afterEach(()=>{auth.currentUser=null;delete global.fetch;});
test('only accepted invitations become friends; existing friends are preserved and removal is reciprocal',()=>{
 const legacy={handle:'legacy',displayName:'Old friend'};
 const request={id:'one',status:'pending',profile:{handle:'alice',displayName:'Alice'},createdAt:'2026-10-24'};
 expect(mergeConfirmedFriends([legacy],[request])).toEqual([legacy]);
 const confirmed=mergeConfirmedFriends([legacy],[{...request,status:'accepted'}]);
 expect(confirmed).toHaveLength(2);expect(confirmed[1].handle).toBe('alice');
 expect(mergeConfirmedFriends(confirmed,[{...request,status:'removed'}])).toEqual([legacy]);
 expect(mergeConfirmedFriends(confirmed,[{...request,status:'accepted'}])).toEqual(confirmed);
});
test('requires authentication and uses the authenticated endpoint for responses',async()=>{
 await expect(friendshipRequest()).rejects.toThrow('Connecte-toi');
 auth.currentUser={uid:'alice',getIdToken:jest.fn().mockResolvedValue('token')};
 global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({ok:true})});
 await friendshipRequest('accept',{id:'one'});
 expect(fetch).toHaveBeenCalledWith('/api/account-data?collection=friendships',expect.objectContaining({method:'POST',headers:expect.objectContaining({Authorization:'Bearer token'}),body:JSON.stringify({id:'one',action:'accept'})}));
});

test('an unexpected successful response is reported without replacing the friend list',async()=>{
 auth.currentUser={uid:'alice',getIdToken:jest.fn().mockResolvedValue('token')};
 global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({items:[]})});
 await expect(friendshipRequest()).rejects.toThrow('temporairement indisponibles');
});
