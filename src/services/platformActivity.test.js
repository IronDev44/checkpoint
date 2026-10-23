import {platformSyncPatch,platformActivityRows,mergeXboxPages} from './platformActivity';
const now=new Date('2026-10-23T12:00:00Z');
test('wishlist synchronization never erases recorded playtime or gameplay achievements',()=>{
 const patch=platformSyncPatch('steam',{steamAppId:1,playtimeForever:0,steamWishlistPriority:0},{wishlist:true,profileId:'profile',now});expect(patch.steamPlaytimeForever).toBeUndefined();expect(patch.steamLastSyncedAt).toBeUndefined();expect(patch.steamWishlistPriority).toBe(0);expect(patch.steamWishlistLastSyncedAt).toBe(now.toISOString());
});
test('unknown platform metrics are omitted; explicit zeros remain real values and no player fields are touched',()=>{
 const patch=platformSyncPatch('xbox',{xboxTitleId:'12',xboxCurrentGamerscore:0,xboxTotalAchievements:null,rating:9,completed:true},{now});expect(patch.xboxCurrentGamerscore).toBe(0);expect(patch.xboxTotalAchievements).toBeUndefined();expect(patch.rating).toBeUndefined();expect(patch.completed).toBeUndefined();expect(patch.playtime).toBeUndefined();expect(patch.status).toBeUndefined();
 expect(platformSyncPatch('steam',{steamAppId:1,playtimeForever:null},{now}).steamPlaytimeForever).toBeUndefined();expect(platformActivityRows({},'steam')[0].value).toBe('Non communiqué');expect(platformActivityRows({steamPlaytimeForever:125},'steam')[0].value).toBe('2 h 5 min');
});
test('Xbox pages stay bound to one profile, deduplicate titles and reject repeated continuation tokens',()=>{
 const before={profile:{xuid:'a'},continuationToken:'one',games:[{xboxTitleId:'1',name:'Halo'}]},next={profile:{xuid:'a'},continuationToken:'two',games:[{xboxTitleId:'1',name:'Halo'},{xboxTitleId:'2',name:'Portal'}]};
 const merged=mergeXboxPages(before,next);expect(merged.games).toHaveLength(2);expect(()=>mergeXboxPages(merged,{...next,continuationToken:'one'})).toThrow('même page');expect(()=>mergeXboxPages(before,{...next,profile:{xuid:'b'}})).toThrow('compte Xbox');
});
