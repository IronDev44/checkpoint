export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isValidReleaseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function selectUpcomingReleases(games = [], reference = new Date(), months = 6) {
  const today = localDateKey(reference);
  const end = new Date(reference.getFullYear(), reference.getMonth() + months, 1);
  const lastDayOfMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
  end.setDate(Math.min(reference.getDate(), lastDayOfMonth));
  const lastDay = localDateKey(end);
  const seen = new Set();
  return games
    .filter((game) => game?.name?.trim() && !game.tba && isValidReleaseDate(game.released) && game.released >= today && game.released <= lastDay)
    .sort((a, b) => a.released.localeCompare(b.released) || a.name.trim().localeCompare(b.name.trim(), 'fr', { sensitivity: 'base' }))
    .filter((game) => {
      const key = game.name.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
