import {compareLatestLibraryAdditions,libraryAddedTime} from './libraryOrder';
import {getWishlistOriginLabel,getDealAlertLabel} from './wishlistLabels';
test('recent means date added, including serialized Firestore dates, not release date or last rating',()=>{
 const games=[{name:'Old addition',createdAt:'2020-01-01',updatedAt:'2030-01-01',released:'2030-01-01'},{name:'Latest',createdAt:new Date('2026-01-02')},{name:'Timestamp',createdAt:{seconds:Date.parse('2025-01-01')/1000,nanoseconds:500000000}},{name:'Unknown'}];
 expect([...games].sort(compareLatestLibraryAdditions).map(g=>g.name)).toEqual(['Latest','Timestamp','Old addition','Unknown']);
 expect(libraryAddedTime({createdAt:{toMillis:()=>1234}})).toBe(1234);
 expect(libraryAddedTime({addedAt:'2026-02-01',createdAt:'2020-01-01'})).toBe(Date.parse('2026-02-01'));
 expect(libraryAddedTime({createdAt:{}})).toBe(0);
});
test('wishlist origin and sale store are distinct and manual Checkpoint entries never become store wishlists',()=>{
 expect(getWishlistOriginLabel({source:'steam-wishlist'})).toBe('Wishlist Steam importée');
 expect(getWishlistOriginLabel({source:'epic-wishlist'})).toBe('Wishlist Epic importée');
 expect(getWishlistOriginLabel({steamAppId:'123'})).toBe('Wishlist Checkpoint');
 expect(getDealAlertLabel({storeLabel:'Epic'})).toBe('Alerte prix Epic');
});
