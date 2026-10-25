import {detectSeriesName} from './seriesIdentity';
const names = (game, key, fallback) => (game[key] || game[fallback] || []).map(value => typeof value === 'string' ? value : value.name || value.platform?.name).filter(Boolean);
export function recommendationReason(candidate, games = []) {
  const genres = names(candidate, 'genreNames', 'genres');
  const platforms = names(candidate, 'platformNames', 'platforms');
  const liked = games.filter(game => game.status !== 'wishlist' && (game.favorite || Number(game.rating) >= 8));
  const series=detectSeriesName(candidate);
  const episode=series&&liked.find(game=>detectSeriesName(game)===series);
  if(episode)return `Tu as aimé ${episode.name}. Ce jeu appartient aussi à la série ${series}.`;
  const match = liked.find(game => game.name && names(game, 'genreNames', 'genres').some(genre => genres.includes(genre)));
  if (match) return `Un genre en commun avec ${match.name}, que tu as ${match.favorite ? 'mis en favori' : 'bien noté'}.`;
  const genre = genres.find(value => games.some(game => game.status !== 'wishlist' && names(game, 'genreNames', 'genres').includes(value)));
  if (genre) return `Le genre ${genre} revient dans ta collection.`;
  const platform = platforms.find(value => games.some(game => game.status !== 'wishlist' && names(game, 'platformNames', 'platforms').includes(value)));
  return platform ? `Disponible sur ${platform}, une plateforme de ta collection.` : 'Une découverte du catalogue, sans lien personnel confirmé.';
}
