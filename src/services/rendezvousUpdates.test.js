import {rendezvousUpdates} from './rendezvousUpdates';
test('invites and revealed challenges have real destinations; expired unanswered challenges do not notify',()=>{
 const list=rendezvousUpdates({now:new Date('2026-10-23'),preferences:{rendezvous:false},challenges:[{id:'invite',author:'Alice',question:'OST',myVote:null,closed:false},{id:'done',author:'Alice',friend:'Bob',question:'OST',myVote:1,revealed:true},{id:'expired',myVote:null,closed:true}]});
 expect(list.map(n=>n.challengeId)).toEqual(['invite','done']);expect(list.every(n=>n.type==='challenge')).toBe(true);
 expect(rendezvousUpdates({preferences:{rendezvous:false,challenges:false},challenges:[{id:'invite',myVote:null}]})).toHaveLength(0);
});
