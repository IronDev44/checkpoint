function timestamp(value) {
  if (value == null || value === '') return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.toDate === 'function') return timestamp(value.toDate());
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : 0;
  if (typeof value === 'object') {
    const seconds = value.seconds ?? value._seconds;
    return Number.isFinite(Number(seconds)) ? Number(seconds) * 1000 + Number(value.nanoseconds ?? value._nanoseconds ?? 0) / 1e6 : 0;
  }
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function libraryAddedTime(game) {
  return timestamp(game.addedAt) || timestamp(game.createdAt) || timestamp(game.importedAt);
}

export function compareLatestLibraryAdditions(a, b) {
  return libraryAddedTime(b) - libraryAddedTime(a);
}
