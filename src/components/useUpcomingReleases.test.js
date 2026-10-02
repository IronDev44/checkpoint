import { act, renderHook, waitFor } from '@testing-library/react';
import { GameService } from '../services/gameService';
import useUpcomingReleases from './useUpcomingReleases';
import { localDateKey } from '../services/upcomingReleases';

jest.mock('../services/gameService', () => ({ GameService: { getUpcomingGames: jest.fn() } }));
const game = (id) => ({ id, name: `Game ${id}`, released: localDateKey() });
beforeEach(() => GameService.getUpcomingGames.mockReset());

test('loading completes with real dated results and refresh starts a new request', async () => {
  GameService.getUpcomingGames.mockResolvedValue({ results: [game(1)], hasNextPage: false });
  const { result } = renderHook(() => useUpcomingReleases());
  await waitFor(() => expect(result.current.status).toBe('ok'));
  expect(result.current.games.map((item) => item.id)).toEqual([1]);
  act(() => result.current.refresh());
  await waitFor(() => expect(GameService.getUpcomingGames).toHaveBeenCalledTimes(2));
});

test('changing month ignores a late response for the old selection', async () => {
  let resolveOld;
  GameService.getUpcomingGames.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }));
  GameService.getUpcomingGames.mockResolvedValue({ results: [game(2)], hasNextPage: false });
  const { result } = renderHook(() => useUpcomingReleases());
  act(() => result.current.chooseMonth(result.current.months[0]));
  await waitFor(() => expect(result.current.games[0]?.id).toBe(2));
  await act(async () => resolveOld({ results: [game(1)] }));
  expect(result.current.games[0].id).toBe(2);
  expect(GameService.getUpcomingGames.mock.calls[1][0].dates).toMatch(/^\d{4}-\d{2}-01,/);
});

test('pagination appends results without duplicating existing games', async () => {
  GameService.getUpcomingGames.mockResolvedValueOnce({ results: [game(1)], hasNextPage: true }).mockResolvedValueOnce({ results: [game(1), game(2)], hasNextPage: false });
  const { result } = renderHook(() => useUpcomingReleases());
  await waitFor(() => expect(result.current.hasMore).toBe(true));
  act(() => result.current.loadMore());
  await waitFor(() => expect(result.current.games).toHaveLength(2));
  expect(GameService.getUpcomingGames.mock.calls[1][0].page).toBe('2');
});

test('a provider failure leaves loading state and supports retry', async () => {
  GameService.getUpcomingGames.mockRejectedValueOnce(new Error('IGDB indisponible')).mockResolvedValueOnce({ results: [game(1)] });
  const { result } = renderHook(() => useUpcomingReleases());
  await waitFor(() => expect(result.current.status).toBe('unavailable'));
  expect(result.current.loading).toBe(false);
  act(() => result.current.refresh());
  await waitFor(() => expect(result.current.status).toBe('ok'));
});

test('platform and genre filters reach the server and reset pagination', async () => {
  GameService.getUpcomingGames.mockResolvedValue({ results: [game(1)], hasNextPage: true });
  const { result } = renderHook(() => useUpcomingReleases());
  await waitFor(() => expect(result.current.status).toBe('ok'));
  act(() => result.current.loadMore());
  await waitFor(() => expect(GameService.getUpcomingGames.mock.calls.at(-1)[0].page).toBe('2'));
  act(() => { result.current.choosePlatform('PlayStation 5'); result.current.chooseGenre('5'); });
  await waitFor(() => expect(GameService.getUpcomingGames.mock.calls.at(-1)[0]).toMatchObject({ page: '1', platform_names: 'PlayStation 5', genres: '5' }));
  act(() => result.current.resetFilters());
  await waitFor(() => expect(GameService.getUpcomingGames.mock.calls.at(-1)[0]).not.toHaveProperty('platform_names'));
  expect(GameService.getUpcomingGames.mock.calls.at(-1)[0]).not.toHaveProperty('genres');
});
