import {GameService} from './gameService';

const cache = new Map();
let queue = Promise.resolve();
let nextRequestAt = 0;
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
export const seriesGameKey = game => normalize(game.name).replace(/\b(?:(?:digital|limited|legendary|collectors?|standard|complete|deluxe|ultimate|definitive)\s+)+edition\b/g, '').replace(/\b(remastered|remaster|hd|game of the year edition|goty)\b/g, '').replace(/\s+/g, ' ').trim();

export function belongsToSeries(game, name) {
  const title = ` ${normalize(game.name)} `;
  const key = normalize(name).replace(/^the /, '');
  const aliases = {
    'middle earth': ['middle earth', 'shadow of mordor', 'shadow of war'],
    'the lord of the rings': ['lord of the rings'],
    'red dead redemption': ['red dead'],
  };
  const candidates = aliases[normalize(name)] || [key];
  const associations = [...(game.franchises || []).map(item => item.name), ...(game.normalized?.collections || []), game.collection?.name].filter(Boolean).map(value => normalize(value).replace(/^the /, ''));
  if (associations.some(value => candidates.some(alias => value === alias || value.startsWith(`${alias} `)))) return true;
  if (associations.length && !key.includes(' ')) return false;
  const titleKey = title.trim().replace(/^the /, '');
  return candidates.some(alias => titleKey === alias || titleKey.startsWith(`${alias} `));
}

export function isSeriesCatalogGame(game, name, today = new Date().toISOString().slice(0, 10)) {
  if (!belongsToSeries(game, name) || !/^\d{4}-\d{2}-\d{2}$/.test(game.released || '') || game.released > today || game.tba) return false;
  const type = String(game.normalized?.gameType?.type || '').toLowerCase().replace(/[_-]/g, ' ');
  if (type && !['main game', 'standalone expansion', 'remake'].includes(type)) return false;
  if (!type && ![0, 4, 8].includes(Number(game.igdbCategory ?? 0))) return false;
  if (game.normalized?.versionParent) return false;
  return !/\b(dlc|season pass|soundtrack|demo|bundle|pack|collection|edition|remastered|remaster)\b/.test(normalize(game.name));
}

function cancelled(signal) {
  if (signal?.aborted) throw new DOMException('Catalogue fermé.', 'AbortError');
}

export function loadSeriesCatalog(name, {signal} = {}) {
  const key = normalize(name);
  const saved = cache.get(key);
  if (saved && Date.now() - saved.at < 24 * 3600000) return Promise.resolve(saved.data);
  const task = queue.catch(() => {}).then(async () => {
    cancelled(signal);
    const recent = cache.get(key);
    if (recent && Date.now() - recent.at < 24 * 3600000) return recent.data;
    const games = [];
    let complete = false;
    for (let page = 1; page <= 4; page++) {
      cancelled(signal);
      const wait = Math.max(0, nextRequestAt - Date.now());
      if (wait) await new Promise(resolve => setTimeout(resolve, wait));
      cancelled(signal);
      nextRequestAt = Date.now() + 300;
      const search = key === 'red dead redemption' ? 'Red Dead' : name.replace(/’/g, "'");
      const data = await GameService.igdb('/games', {search, page_size:'50', page:String(page)}, {timeout:9000, signal});
      cancelled(signal);
      games.push(...(data.results || []).filter(game => isSeriesCatalogGame(game, name)));
      if (!data.next) {complete = true; break;}
    }
    const unique = games.filter((game, index, list) => list.findIndex(other => seriesGameKey(other) === seriesGameKey(game)) === index);
    const data = {games:unique, complete};
    cache.set(key, {at:Date.now(), data});
    if (cache.size > 64) cache.delete(cache.keys().next().value);
    return data;
  });
  queue = task.catch(() => {});
  return task;
}

export function seriesRemaining(catalog, localGames, isFinished) {
  const finished = new Set(localGames.filter(isFinished).map(seriesGameKey));
  const present = new Set(localGames.map(seriesGameKey));
  const remaining = catalog.games.filter(game => !finished.has(seriesGameKey(game)));
  return {remaining:remaining.length, outside:remaining.filter(game => !present.has(seriesGameKey(game))).length};
}
