import {GameService} from './gameService';
import {isFanGame} from './fanGames';

const cache = new Map();
let queue = Promise.resolve();
let nextRequestAt = 0;
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const numerals = {i:'1', ii:'2', iii:'3', iv:'4', v:'5', vi:'6', vii:'7', viii:'8', ix:'9', x:'10', xi:'11', xii:'12', xiii:'13', xiv:'14', xv:'15', xvi:'16'};
export const seriesGameKey = game => normalize(game.name)
  .replace(/\b(?:(?:digital|limited|legendary|collectors?|standard|complete|deluxe|ultimate|definitive)\s+)+edition\b/g, '')
  .replace(/\b(remastered|remaster|hd|game of the year edition|goty)\b/g, '')
  .replace(/\b(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi)\b/g, token => numerals[token])
  .replace(/\s+/g, ' ').trim();

function episode(game, seriesName) {
  const key = seriesGameKey(game);
  const year = key.match(/\b((?:19|20)\d{2})$/)?.[1] || '';
  const title = year ? key.slice(0, -year.length).trim() : key;
  const first = title === `${seriesGameKey({name:seriesName})} 1`;
  return {key:first ? title.slice(0, -2) : title, first, year,
    releaseYear: String(game.released || '').slice(0, 4)};
}

function ids(game) {
  const result = new Set();
  for (const value of [game.canonicalId, game.id, game.rawgId]) {
    if (value == null) continue;
    if (/^(igdb|rawg):/.test(String(value))) result.add(String(value));
  }
  for (const [source, value] of Object.entries(game.sourceIds || {})) {
    if (value != null) result.add(`${source}:${value}`);
  }
  // Legacy saved numeric rawgId values belong to RAWG, never to IGDB.
  if (game.rawgId != null && /^\d+$/.test(String(game.rawgId))) result.add(`rawg:${game.rawgId}`);
  if (game.id != null && /^\d+$/.test(String(game.id)) && game.source !== 'igdb') result.add(`rawg:${game.id}`);
  return result;
}

export function findSeriesLibraryMatch(game, localGames, seriesName, catalogGames = []) {
  const identity = ids(game);
  const byId = localGames.find(local => [...ids(local)].some(id => identity.has(id)));
  if (byId) return byId;
  const target = episode(game, seriesName);
  const years = [...new Set(catalogGames.filter(other => episode(other, seriesName).key === target.key)
    .map(other => episode(other, seriesName).year || episode(other, seriesName).releaseYear).filter(Boolean))].sort();
  const targetYear = target.year || target.releaseYear;
  const candidates = localGames.filter(local => {
    const other = episode(local, seriesName);
    if (other.key !== target.key) return false;
    if (other.first) return years.length < 2 || targetYear === years[0];
    if (other.year && targetYear) return other.year === targetYear;
    if (target.year && other.releaseYear) return target.year === other.releaseYear;
    if (years.length > 1) return Boolean(other.releaseYear && other.releaseYear === targetYear);
    return true;
  });
  return candidates[0] || null;
}

export function dedupeSeriesGames(games, seriesName, isFinished) {
  const groups = [];
  const originals = games.filter(game => !/\b(remaster|remastered|hd)\b/.test(normalize(game.name)));
  for (const game of games) {
    const info = episode(game, seriesName);
    const match = groups.find(group => {
      const other = episode(group[0], seriesName);
      if (info.key !== other.key) return false;
      if (info.year || other.year) return (info.year || info.releaseYear) === (other.year || other.releaseYear);
      const homonymYears = new Set(originals.filter(item => episode(item, seriesName).key === info.key).map(item => episode(item, seriesName).releaseYear).filter(Boolean));
      if (info.first || other.first) {
        const nonFirst = info.first ? other : info;
        return homonymYears.size < 2 || nonFirst.releaseYear === [...homonymYears].sort()[0];
      }
      return homonymYears.size < 2 || info.releaseYear === other.releaseYear;
    });
    if (match) match.push(game); else groups.push([game]);
  }
  return groups.map(group => isFinished
    ? group.find(isFinished) || group[0]
    : group[0]);
}

export function isSeriesLibraryEpisode(game) {
  const type = normalize(game.normalized?.gameType?.type || game.discoveryMetadata?.gameType);
  return !['dlc addon', 'bundle', 'mod', 'demo', 'season', 'episode'].includes(type)
    && !isFanGame(game)
    && !/\b(dlc|season pass|soundtrack|demo|bundle|collection|saga|trilogy)\b/.test(normalize(game.name));
}

export function seriesCatalogTitle(game, catalogGames) {
  const sameTitle = catalogGames.filter(other => seriesGameKey(other) === seriesGameKey(game));
  const years = new Set(sameTitle.map(other => String(other.released || '').slice(0,4)).filter(Boolean));
  return years.size > 1 && game.released ? `${game.name} (${game.released.slice(0,4)})` : game.name;
}

export function belongsToSeries(game, name) {
  const title = ` ${normalize(game.name)} `;
  const key = normalize(name).replace(/^the /, '');
  const aliases = {
    'middle earth': ['middle earth', 'shadow of mordor', 'shadow of war'],
    'the lord of the rings': ['lord of the rings'],
    'red dead redemption': ['red dead'],
    'tom clancys splinter cell': ['tom clancys splinter cell', 'splinter cell'],
    'tom clancys ghost recon': ['tom clancys ghost recon', 'ghost recon'],
    'tom clancys rainbow six': ['tom clancys rainbow six', 'rainbow six'],
    'tom clancys the division': ['tom clancys the division', 'the division'],
  };
  const candidates = aliases[normalize(name)] || [key];
  const associations = [...(game.franchises || []).map(item => item.name), ...(game.normalized?.collections || []), game.collection?.name].filter(Boolean).map(value => normalize(value).replace(/^the /, ''));
  if (associations.some(value => candidates.some(alias => value === alias || value.startsWith(`${alias} `)))) return true;
  if (associations.length && !key.includes(' ')) return false;
  const titleKey = title.trim().replace(/^the /, '');
  return candidates.some(alias => titleKey === alias || titleKey.startsWith(`${alias} `));
}

export function isSeriesCatalogGame(game, name, today = new Date().toISOString().slice(0, 10)) {
  if (!belongsToSeries(game, name) || isFanGame(game) || !/^\d{4}-\d{2}-\d{2}$/.test(game.released || '') || game.released > today || game.tba) return false;
  const type = String(game.normalized?.gameType?.type || '').toLowerCase().replace(/[_-]/g, ' ');
  if (type && !['main game', 'standalone expansion', 'remake'].includes(type)) return false;
  if (!type && ![0, 4, 8].includes(Number(game.igdbCategory ?? 0))) return false;
  if (game.normalized?.versionParent) return false;
  return !/\b(dlc|season pass|soundtrack|demo|bundle|pack|collection|edition|remastered|remaster|saga|trilogy)\b/.test(normalize(game.name));
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
    const unique = dedupeSeriesGames(games, name).sort((a,b) => a.released.localeCompare(b.released) || a.name.localeCompare(b.name));
    const data = {name, games:unique, complete};
    cache.set(key, {at:Date.now(), data});
    if (cache.size > 64) cache.delete(cache.keys().next().value);
    return data;
  });
  queue = task.catch(() => {});
  return task;
}

export function seriesRemaining(catalog, localGames, isFinished) {
  const localEpisodes = dedupeSeriesGames(localGames.filter(isSeriesLibraryEpisode), catalog.name || '', isFinished);
  const rows = catalog.games.map(game => ({game, local:findSeriesLibraryMatch(game, localEpisodes, catalog.name || '', catalog.games)}));
  const remaining = rows.filter(row => !row.local || !isFinished(row.local));
  return {remaining:remaining.length, outside:remaining.filter(row => !row.local).length};
}
