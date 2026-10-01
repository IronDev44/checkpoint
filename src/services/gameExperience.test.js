import { getGameExperience, getExperiencePatch, getExperienceRatingFields, DISCOVERY_FEELINGS } from './gameExperience';

test('existing completion and tried progression are recognized', () => {
  expect(getGameExperience({ completed: true })).toBe('completed');
  expect(getGameExperience({ progressStatus: 'tried' })).toBe('tried');
  expect(getGameExperience({ ratingGameplay: 7 })).toBe('partial');
  expect(getGameExperience({ status: 'collection' })).toBeNull();
});

test('changing experience preserves ratings, review and discovery feelings', () => {
  const game = { id: 'a', rating: 7, ratingLongevity: 8, review: 'Souvenir', discoveryFeelings: ['later'] };
  const tried = { ...game, ...getExperiencePatch(game, 'tried') };
  const completed = { ...tried, ...getExperiencePatch(tried, 'completed') };
  expect(tried.completed).toBe(false);
  expect(tried.progressStatus).toBe('tried');
  expect(completed).toMatchObject({ ...game, completed: true, ratingExperience: 'completed' });
});

test('partial criteria exclude longevity while full criteria return after completion', () => {
  const fields = ['ratingGameplay', 'ratingStory', 'ratingLongevity'].map((key) => ({ key }));
  expect(getExperienceRatingFields({ ratingExperience: 'partial' }, fields).map((item) => item.key)).toEqual(['ratingGameplay', 'ratingStory']);
  expect(getExperienceRatingFields({ ratingExperience: 'tried' }, fields)).toEqual([]);
  expect(getExperienceRatingFields({ ratingExperience: 'completed' }, fields)).toEqual(fields);
  expect(new Set(DISCOVERY_FEELINGS.map((item) => item.id)).size).toBe(14);
});
