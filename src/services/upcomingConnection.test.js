import { GameService } from './gameService';
import { selectUpcomingReleases } from './upcomingReleases';

afterEach(() => { jest.restoreAllMocks(); });

test('the upcoming service calls IGDB and preserves valid Ghost/Lost titles through display filtering', async () => {
  const date = new Date(2026, 9, 1);
  const release = Math.floor(Date.UTC(2026, 10, 1) / 1000);
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => ({ sourceStatus: 'ok', results: [
      { id: 1, name: 'Ghost Adventure', first_release_date: release },
      { id: 2, name: 'Lost World', first_release_date: release },
      { id: 3, name: 'Undated game' },
    ] }),
  });
  const data = await GameService.getUpcomingGames({ months: '6', limit: '40' });
  expect(fetchMock.mock.calls[0][0]).toBe('/api/igdb/upcoming?months=6&limit=40');
  expect(selectUpcomingReleases(data.results, date).map((game) => game.name)).toEqual(['Ghost Adventure', 'Lost World']);
});

test('an HTML SPA response is an explicit routing error, not an empty calendar', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, headers: { get: () => 'text/html' } });
  await expect(GameService.getUpcomingGames({})).rejects.toMatchObject({ code: 'IGDB_INVALID_RESPONSE' });
});
