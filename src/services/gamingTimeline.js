export function selectTimelineEvents(timeline, filter = 'all', newestFirst = false) {
  const types = { games: ['game', 'identity', 'goty'], goty: ['goty'], hardware: ['hardware'] };
  const order = { hardware: 0, identity: 1, goty: 2, game: 3, checkpoint: 4 };
  const events = timeline.filter((event) => !types[filter] || types[filter].includes(event.type));
  return [...events].sort((a, b) => {
    const difference = (a.year || 9999) - (b.year || 9999);
    return (newestFirst ? -difference : difference) || (order[a.type] ?? 9) - (order[b.type] ?? 9);
  });
}
