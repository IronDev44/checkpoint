import {selectionCalendar,weeklySelection,monthlyFinal,EXPEDITIONS} from './rendezvousCatalog';
test('one weekly ballot has the same Monday ID across clients and closes on the next Monday',()=>{
 const list=selectionCalendar(new Date('2026-10-25T23:59:59Z'));
 expect(list[0]).toMatchObject({id:'week-2026-10-19',startsAt:'2026-10-19T00:00:00.000Z',endsAt:'2026-10-26T00:00:00.000Z'});
 expect(selectionCalendar(new Date('2026-10-26T00:00:00Z'))[0].id).toBe('week-2026-10-26');
});
test('the monthly final includes the straddling week, all tied winners, and no winner from a zero-vote week',()=>{
 const rounds=selectionCalendar(new Date('2026-11-02T00:00:00Z')),a=rounds.find(r=>r.id==='week-2026-10-19'),b=rounds.find(r=>r.id==='week-2026-10-26');
 const final=monthlyFinal('2026-10',rounds,{[a.id]:{[a.options[0].id]:2,[a.options[1].id]:2},[b.id]:{[b.options[0].id]:1}});
 expect(final.startsAt).toBe('2026-11-02T00:00:00.000Z');expect(final.endsAt).toBe('2026-11-09T00:00:00.000Z');
 expect(final.options.map(g=>g.id)).toEqual(expect.arrayContaining([a.options[0].id,a.options[1].id,b.options[0].id]));expect(final.options).toHaveLength(3);
 expect(monthlyFinal('2026-10',rounds,{}).options).toHaveLength(0);
});
test('February and years beyond the first calendar keep producing valid ballots',()=>{
 expect(selectionCalendar(new Date('2027-02-28'))[0].options).toHaveLength(4);
 expect(selectionCalendar(new Date('2029-12-31'))[0].options).toHaveLength(4);
 expect(weeklySelection(new Date('2026-10-12'))).toBeNull();
 expect(new Set(EXPEDITIONS.map(e=>e.id)).size).toBe(EXPEDITIONS.length);
});
