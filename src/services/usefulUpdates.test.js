import {buildUsefulUpdates,notificationAllowed,normalizeNotificationPreferences} from './usefulUpdates';
import {parseSpoilers,spoilerExcerpt,spoilerSummary,wrapSpoilerSelection,reviewActivityFields} from './spoilers';
const now=new Date(2026,9,19),base={id:'one',author:'Alex',createdAt:'2026-10-18',endsAt:'2026-10-25',myVote:null,total:0};
test('invites disappear after voting and results replace them after closing',()=>{
 expect(buildUsefulUpdates({polls:[base],now})[0].id).toBe('poll-invite-one');expect(buildUsefulUpdates({polls:[{...base,myVote:0}],now})).toEqual([]);
 expect(buildUsefulUpdates({polls:[{...base,myVote:0,closed:true}],now})[0].id).toBe('poll-ended-one');expect(buildUsefulUpdates({polls:[{...base,isOwner:true}],now})).toEqual([]);expect(buildUsefulUpdates({polls:[{...base,isOwner:true,closed:true}],now})[0].type).toBe('poll');
});
test('monthly reminder uses previous month with dated activity and preferences disable groups',()=>{
 const games=[{id:'a',createdAt:new Date(2026,8,4).toISOString()}];const list=buildUsefulUpdates({games,polls:[base],now});expect(list.map(n=>n.id)).toContain('monthly-2026-09');expect(buildUsefulUpdates({games,polls:[base],now,preferences:{polls:false,monthly:false}})).toEqual([]);expect(notificationAllowed({type:'release'},{releases:false})).toBe(false);expect(normalizeNotificationPreferences().polls).toBe(true);
});
test('expired polls produce results only for owner or a voter, and old results fade out',()=>{
 expect(buildUsefulUpdates({polls:[{...base,endsAt:'2026-10-18',myVote:0}],now})[0].type).toBe('poll');expect(buildUsefulUpdates({polls:[{...base,endsAt:'2026-08-01',myVote:0}],now})).toEqual([]);expect(buildUsefulUpdates({polls:[{...base,closed:true}],now})).toEqual([]);
});
test('spoiler tokens preserve prose and protect nested and unfinished excerpts',()=>{
 expect(parseSpoilers('Bien. [spoiler]le secret[/spoiler] Suite')).toEqual([{text:'Bien. ',spoiler:false},{text:'le secret',spoiler:true},{text:' Suite',spoiler:false}]);expect(parseSpoilers('[spoiler]secret sans fin')[0].spoiler).toBe(true);expect(parseSpoilers('[spoiler]a[spoiler]b[/spoiler]c[/spoiler]')).toEqual([{text:'abc',spoiler:true}]);expect(parseSpoilers(spoilerExcerpt('[spoiler]secret tres long[/spoiler]',5))[0]).toEqual({spoiler:true,text:'secre'});expect(spoilerSummary('A[spoiler]secret[/spoiler]B')).toBe('A[spoiler masqué]B');expect(wrapSpoilerSelection('abcdef',2,4)).toBe('ab[spoiler]cd[/spoiler]ef');
});

test('private reviews of rated games stay private unless explicitly shared',()=>{
 const game={review:'[spoiler]Texte privé[/spoiler]',rating:8,reviewSpoiler:true};expect(reviewActivityFields(game).reviewText).toBe('');expect(reviewActivityFields({...game,reviewShared:true}).reviewText).toContain('[spoiler]');expect(reviewActivityFields({...game,rating:0,reviewShared:false}).reviewText).toBe('');expect(reviewActivityFields({...game,rating:0}).reviewText).toContain('[spoiler]');
});
