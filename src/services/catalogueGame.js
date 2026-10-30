// Library document IDs are not catalogue IDs: never send them to a provider.
const positiveId = value => /^[1-9]\d*$/.test(String(value || '')) ? String(value) : '';
export function getCatalogueId(game = {}) {
  const rawg = positiveId(game.rawgId || game.rawg_id || game.rawgID || game.sourceIds?.rawg || game.normalized?.sourceIds?.rawg);
  if (rawg) return rawg;
  const prefixed = [game.rawgId, game.canonicalId, game.id].map(value => String(value || '').match(/^igdb:([1-9]\d*)$/)?.[1]).find(Boolean);
  const igdb = positiveId(game.igdbId || game.sourceIds?.igdb || game.normalized?.sourceIds?.igdb || prefixed);
  return igdb ? `igdb:${igdb}` : '';
}
const titleKey = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f™®]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function selectCatalogueMatch(game, candidates = []) {
  const title = titleKey(game.name);
  const year = String(game.released || '').slice(0, 4);
  const exact = candidates.filter(item => title && titleKey(item.name) === title && getCatalogueId(item));
  const dated = /^\d{4}$/.test(year) ? exact.filter(item => String(item.released || '').startsWith(year)) : exact;
  // Ambiguous titles, reboots and unknown editions require explicit selection.
  return dated.length === 1 ? dated[0] : null;
}
export function toCatalogueGame(game, id = getCatalogueId(game)) {
  return {...game, id, background_image:game.background_image || game.image || '', rating:0,
    platforms:game.platforms || (game.platformNames || []).map(name => ({platform:{name}})),
    genres:game.genres || (game.genreNames || []).map(name => ({name}))};
}
