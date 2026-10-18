const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function relevance(game, query) {
  const name = normalize(game.name), words = query.split(' ').filter(Boolean), nameWords = name.split(' ');
  if (!query || !name) return 0;
  let score = (name === query ? 10000 : 0) + (name.startsWith(query) ? 5000 : 0) + (name.includes(query) ? 2500 : 0);
  words.forEach((word, index) => {
    if (nameWords[index] === word) score += 450;
    if (nameWords.includes(word)) score += 260;
    if (name.includes(word)) score += 120;
    else score -= 900;
  });
  return score - Math.abs(nameWords.length - words.length) * 35 + Math.min(Number(game.ratings_count) || 0, 12000) / 40 + (Number(game.rating) || 0) * 35;
}

export function sortSearchResults(results, query = '', ordering = 'relevance') {
  const normalizedQuery = normalize(query);
  const text = normalizedQuery === 'gta' ? 'grand theft auto' : normalizedQuery;
  const byName = (a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'fr', {numeric:true, sensitivity:'base'});
  return [...results].sort((a, b) => {
    if (ordering === 'name') return byName(a, b);
    if (ordering === '-rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0) || byName(a, b);
    if (ordering === 'released' || ordering === '-released') {
      const left = a.tba ? NaN : Date.parse(a.released), right = b.tba ? NaN : Date.parse(b.released);
      const hasLeft = Number.isFinite(left), hasRight = Number.isFinite(right);
      if (hasLeft !== hasRight) return hasLeft ? -1 : 1;
      return (hasLeft ? (left - right) * (ordering === 'released' ? 1 : -1) : 0) || byName(a, b);
    }
    if (!text) return 0; // Keep the provider's discovery order without a query.
    return relevance(b, text) - relevance(a, text) || (Number(b.ratings_count) || 0) - (Number(a.ratings_count) || 0);
  });
}
