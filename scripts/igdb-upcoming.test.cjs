const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function loadEndpoint(fetchGames) {
  const source = fs.readFileSync(path.join(__dirname, '../public/_worker.js'), 'utf8')
    .replace('export default', 'const worker =');
  return new Function('fetchGames', `${source}\nfetchIgdb = fetchGames; return getIgdbUpcoming;`)(fetchGames);
}

test('the upcoming endpoint returns IGDB games successfully, even without artwork', async () => {
  const game = { id: 12, name: 'Future game', first_release_date: 1900000000, category: 0 };
  const endpoint = loadEndpoint(async () => [game]);
  const response = await endpoint(new Request('https://checkpoint.test/api/igdb/upcoming?limit=40'), {});
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.sourceStatus, 'ok');
  assert.deepEqual(data.results, [game]);
  assert.equal(data.hasNextPage, false);
});

test('a full page reports pagination without referencing an undefined variable', async () => {
  const games = [1, 2].map((id) => ({ id, name: `Game ${id}` }));
  const endpoint = loadEndpoint(async () => games);
  const data = await (await endpoint(new Request('https://checkpoint.test/api/igdb/upcoming?limit=2'), {})).json();
  assert.equal(data.sourceStatus, 'ok');
  assert.equal(data.hasNextPage, true);
  assert.equal(data.results.length, 2);
  assert.match(data.next, /page=2/);
});

test('an actual provider failure remains an unavailable response', async () => {
  const endpoint = loadEndpoint(async () => { throw new Error('Provider unavailable'); });
  const data = await (await endpoint(new Request('https://checkpoint.test/api/igdb/upcoming'), {})).json();
  assert.equal(data.sourceStatus, 'unavailable');
  assert.deepEqual(data.results, []);
});

test('modern IGDB records work without category, while DLCs stay out', async () => {
  let sentQuery;
  const endpoint = loadEndpoint(async (_, query) => {
    sentQuery = query;
    return [
      { id: 1, name: 'Future game', game_type: { id: 1, type: 'Main Game' } },
      { id: 2, name: 'Extra content', game_type: { id: 2, type: 'DLC / Addon' } },
    ];
  });
  const data = await (await endpoint(new Request('https://checkpoint.test/api/igdb/upcoming?limit=40'), {})).json();
  assert.equal(data.sourceStatus, 'ok');
  assert.deepEqual(data.results.map((game) => game.id), [1]);
  assert.match(sentQuery, /game_type\.type/);
  assert.doesNotMatch(sentQuery, /category\s*=/);
});

test('platform, genre and date filters combine in the upstream query', async () => {
  let query;
  const endpoint = loadEndpoint(async (_, value) => { query = value; return []; });
  await endpoint(new Request('https://checkpoint.test/api/igdb/upcoming?platform_names=PlayStation%205%2CNintendo%20Switch%202&genres=5&dates=2027-01-01%2C2027-01-31'), {});
  assert.match(query, /platforms\.name = \("PlayStation 5","Nintendo Switch 2"\)/);
  assert.match(query, /genres = \(12\)/);
  assert.match(query, /first_release_date >=/);
});
