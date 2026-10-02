import { useCallback, useEffect, useMemo, useState } from 'react';
import { GameService } from '../services/gameService';
import { localDateKey, selectUpcomingReleases } from '../services/upcomingReleases';

export default function useUpcomingReleases(enabled = true) {
  const [day, setDay] = useState(() => localDateKey());
  const [month, setMonth] = useState('');
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ games: [], loading: false, status: 'idle', error: '', hasMore: false });
  const [page, setPage] = useState(1);
  const refresh = useCallback(() => { setPage(1); setRevision((value) => value + 1); }, []);
  const chooseMonth = useCallback((value) => { setPage(1); setMonth(value); }, []);
  const loadMore = useCallback(() => setPage((value) => value + 1), []);
  const months = useMemo(() => {
    const today = new Date(`${day}T12:00:00`);
    return Array.from({ length: 7 }, (_, index) => localDateKey(new Date(today.getFullYear(), today.getMonth() + index, 1)).slice(0, 7));
  }, [day]);

  useEffect(() => {
    const checkDay = () => setDay(localDateKey());
    const timer = window.setInterval(checkDay, 60000);
    document.addEventListener('visibilitychange', checkDay);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', checkDay); };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let current = true;
    setState((previous) => ({ ...previous, games: page === 1 ? [] : previous.games, loading: true, status: 'loading', error: '' }));
    const params = { months: '6', limit: '50', page: String(page) };
    if (month) {
      const [year, number] = month.split('-').map(Number);
      params.dates = `${month}-01,${localDateKey(new Date(year, number, 0))}`;
    }
    GameService.getUpcomingGames(params, { signal: controller.signal, timeout: 20000 })
      .then((data) => {
        if (!current) return;
        const results = selectUpcomingReleases(data.results);
        setState((previous) => ({ games: selectUpcomingReleases(page === 1 ? results : [...previous.games, ...results]), loading: false, status: 'ok', error: '', hasMore: Boolean(data.hasNextPage) }));
      })
      .catch((error) => {
        if (!current) return;
        setState((previous) => ({ ...previous, loading: false, status: 'unavailable', error: error.message || 'Les sorties ne sont pas disponibles pour le moment.', hasMore: false }));
      });
    return () => { current = false; controller.abort(); };
  }, [enabled, day, month, page, revision]);

  return { ...state, month, months, chooseMonth, refresh, loadMore };
}
