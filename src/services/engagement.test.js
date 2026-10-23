import {personalMemories,normalizeEngagement} from './engagement';
test('only dated past anniversaries are used; wishlist and missing dates never generate a memory',()=>{
 const games=[{id:'one',name:'Halo',status:'collection',completedAt:'2024-10-22T12:00:00Z'},{id:'wish',status:'wishlist',completedAt:'2024-10-22'},{id:'undated',status:'collection',completed:true},{id:'future',status:'collection',completedAt:'2030-10-22'}];
 const result=personalMemories(games,new Date('2026-10-23T12:00:00Z'));
 expect(result).toHaveLength(1);expect(result[0]).toMatchObject({id:'one:completed:2024-10-22',years:2,days:1});
});
test('leap day and year boundaries produce real anniversaries rather than invented dates',()=>{
 expect(personalMemories([{id:'leap',status:'collection',completedAt:'2024-02-29'}],new Date('2027-02-28T12:00:00Z'))[0].years).toBe(3);
 expect(personalMemories([{id:'dec',status:'collection',completedAt:'2020-12-31'}],new Date('2027-01-02T12:00:00Z'))[0]).toMatchObject({years:6,days:2});
});
test('private retrospective data is bounded and does not mutate the original game review',()=>{
 const game={id:'one',review:'Original',rating:8},value=normalizeEngagement({reflections:{one:{text:'x'.repeat(1200),at:'bad',ratingAtReflection:99}},expeditions:{test:{answers:[2,1,3],score:99,completedAt:'2026-10-23'}}});
 expect(value.reflections.one.text).toHaveLength(1000);expect(value.reflections.one.at).toBeNull();expect(value.expeditions.test.answers).toEqual([2,1]);expect(game.review).toBe('Original');
});
