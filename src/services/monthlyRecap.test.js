import {monthlyRecap,stampGameMilestones,recapMonths,activityDate} from './monthlyRecap';
test('uses specific dates, excludes wishlists and refuses undated completion guesses',()=>{
 const games=[{id:'a',name:'Portal',createdAt:'2026-10-02',completed:true},{id:'b',name:'Halo',createdAt:'2026-09-02',completed:true,completedAt:'2026-10-04',favorite:true,favoriteAt:'2026-10-05'},{id:'c',status:'wishlist',createdAt:'2026-10-03'},{id:'d',createdAt:'2026-09-01',collectionAddedAt:'2026-10-01'}];
 const result=monthlyRecap(games,'2026-10');expect(result.added.map(g=>g.id)).toEqual(['a','d']);expect(result.completed.map(g=>g.id)).toEqual(['b']);expect(result.favorites.map(g=>g.id)).toEqual(['b']);expect(result.undatedCompleted).toBe(1);
});
test('month boundaries and Firestore timestamps are handled',()=>{
 const start=new Date(2026,9,1),end=new Date(2026,10,1);expect(monthlyRecap([{createdAt:start},{createdAt:end}],'2026-10').added).toHaveLength(1);expect(activityDate({seconds:start.getTime()/1000})).toEqual(start);expect(activityDate('bad')).toBeNull();
});
test('stamps transitions once and preserves explicit undo dates',()=>{
 expect(stampGameMilestones({completed:false,favorite:false},{completed:true,favorite:true},'now')).toEqual({completed:true,favorite:true,completedAt:'now',favoriteAt:'now'});
 expect(stampGameMilestones({completed:true},{review:'ok'},'now')).toEqual({review:'ok'});
 expect(stampGameMilestones({completed:true},{completed:false,completedAt:'old'},'now').completedAt).toBe('old');
 expect(stampGameMilestones({status:'wishlist'},{status:'collection'},'now').collectionAddedAt).toBe('now');
});
test('offers current months and actual older dated history',()=>{expect(recapMonths([{createdAt:'2020-02-01'},{createdAt:'invalid'}],new Date(2026,9,19))).toEqual(expect.arrayContaining(['2026-10','2025-11','2020-02']));});
