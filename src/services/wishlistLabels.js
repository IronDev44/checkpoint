export function getWishlistOriginLabel(game = {}) {
  if (game.source === 'steam-wishlist' || game.steamWishlistAddedAt) return 'Wishlist Steam importée';
  if (game.source === 'epic-wishlist' || game.epicWishlistAddedAt) return 'Wishlist Epic importée';
  return 'Wishlist Checkpoint';
}

export function getDealAlertLabel(deal = {}) {
  return `Alerte prix ${deal.storeLabel || (deal.store === 'epic' ? 'Epic' : deal.store === 'steam' ? 'Steam' : 'boutique')}`;
}
