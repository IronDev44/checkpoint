import {matchesLibraryShortcut} from './libraryShortcuts';
const now=Date.parse('2026-10-25T12:00:00Z'),rating=g=>g.rating;
test('recent additions use the actual addition date and never the last edit or release',()=>{
 expect(matchesLibraryShortcut({addedAt:'2026-10-20',createdAt:'2001-01-01'},'recent',rating,now)).toBe(true);
 expect(matchesLibraryShortcut({createdAt:'2001-01-01',updatedAt:'2026-10-25',released:'2026-10-24'},'recent',rating,now)).toBe(false);
 expect(matchesLibraryShortcut({addedAt:{_seconds:(now-86400000)/1000}},'recent',rating,now)).toBe(true);
 expect(matchesLibraryShortcut({createdAt:'2027-01-01'},'recent',rating,now)).toBe(false);
});
test('unrated and paused shortcuts reflect their own data',()=>{
 expect(matchesLibraryShortcut({rating:8},'unrated',rating,now)).toBe(false);
 expect(matchesLibraryShortcut({},'unrated',rating,now)).toBe(true);
 expect(matchesLibraryShortcut({progressStatus:'paused'},'paused',rating,now)).toBe(true);
 expect(matchesLibraryShortcut({progressStatus:'abandoned'},'paused',rating,now)).toBe(false);
});
