import {recommendationReason} from './recommendationReason';

test('a personal explanation names only an appreciated game with a confirmed shared genre',()=>{
 expect(recommendationReason({genres:[{name:'RPG'}]},[{name:'Persona 5',genreNames:['RPG'],rating:9,status:'collection'}])).toContain('Persona 5, que tu as bien noté');
 expect(recommendationReason({genres:[{name:'Racing'}]},[{name:'Persona 5',genreNames:['RPG'],favorite:true,status:'collection'}])).not.toContain('Persona');
});
test('wishlist games do not become evidence of personal tastes',()=>{
 expect(recommendationReason({genres:[{name:'RPG'}]},[{name:'Persona 5',genreNames:['RPG'],favorite:true,status:'wishlist'}])).toBe('Une découverte du catalogue, sans lien personnel confirmé.');
});
test('platform availability is explained without claiming a shared gameplay style',()=>{
 expect(recommendationReason({platforms:[{platform:{name:'PC'}}]},[{name:'Doom',platformNames:['PC'],status:'collection'}])).toBe('Disponible sur PC, une plateforme de ta collection.');
});
test('a liked episode explains a recommendation without confusing unrelated assassins',()=>{
 expect(recommendationReason({name:'God of War Ragnarök'},[{name:'God of War (2018)',rating:9,status:'collection'}])).toContain('Tu as aimé God of War (2018)');
 expect(recommendationReason({name:'The Witcher 2: Assassins of Kings'},[{name:'Assassin’s Creed II',favorite:true,status:'collection'}])).not.toContain('Assassin’s Creed');
});
