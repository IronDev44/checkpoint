export const EXPERIENCE_OPTIONS = [
  { id: 'completed', label: 'Terminé', hint: 'Ton expérience complète' },
  { id: 'partial', label: 'Joué, non terminé', hint: 'Un avis sur ce que tu as découvert' },
  { id: 'tried', label: 'Essayé', hint: 'Une découverte, à ton rythme' },
];

export const DISCOVERY_FEELINGS = [
  { id: 'style', label: '🎮 Pas tout à fait mon style' },
  { id: 'explore', label: '🌍 Envie d’explorer un autre jeu' },
  { id: 'timing', label: '⏳ Pas le bon moment pour moi' },
  { id: 'later', label: '🔖 Je garde la suite pour plus tard' },
  { id: 'challenge', label: '🧩 Un peu trop corsé pour moi' },
  { id: 'more_challenge', label: '🍃 J’aurais aimé plus de défi' },
  { id: 'slow', label: '🐢 Un rythme un peu lent pour moi' },
  { id: 'intense', label: '⚡ Un rythme un peu intense pour moi' },
  { id: 'story', label: '📖 L’histoire ne m’a pas accroché' },
  { id: 'controls', label: '🕹️ Pas à l’aise avec les commandes' },
  { id: 'technical', label: '🔧 Quelques soucis techniques' },
  { id: 'friends', label: '👥 À retrouver avec des amis' },
  { id: 'curiosity', label: '✨ J’ai surtout joué par curiosité' },
  { id: 'other', label: '💬 Un autre ressenti' },
];

export function getGameExperience(game = {}) {
  if (EXPERIENCE_OPTIONS.some((option) => option.id === game.ratingExperience)) return game.ratingExperience;
  if (game.completed || game.progressStatus === 'completed' || /termin/i.test(game.status || '')) return 'completed';
  if (game.progressStatus === 'tried') return 'tried';
  if (['playing', 'in_progress', 'deep_play'].includes(game.progressStatus) || game.status === 'en cours' || ['rating', 'ratingGraphics', 'ratingGameplay', 'ratingStory', 'ratingSound', 'ratingLongevity'].some((key) => Number(game[key]) > 0)) return 'partial';
  return null;
}

export function getExperiencePatch(game, experience) {
  if (!EXPERIENCE_OPTIONS.some((option) => option.id === experience)) return {};
  return {
    ratingExperience: experience,
    completed: experience === 'completed',
    progressStatus: experience === 'completed' ? 'completed' : experience === 'tried' ? 'tried' : 'deep_play',
    status: experience === 'partial' && game.status === 'en cours' ? 'en cours' : 'collection',
  };
}

export function getExperienceRatingFields(game, fields) {
  const experience = getGameExperience(game);
  if (experience === 'tried' || !experience) return [];
  return experience === 'partial' ? fields.filter((field) => field.key !== 'ratingLongevity') : fields;
}
