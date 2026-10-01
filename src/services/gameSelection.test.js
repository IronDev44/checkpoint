import { applySelectedGamePatch } from './gameSelection';

function deferredSave() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

test('a late rating/review save does not reopen a closed game detail', async () => {
  let selected = { id: 'a', name: 'Game A', rating: 5 };
  const save = deferredSave();
  const completion = save.promise.then(() => {
    selected = applySelectedGamePatch(selected, 'a', { rating: 8, review: 'Great' });
  });
  selected = null;
  save.resolve();
  await completion;
  expect(selected).toBeNull();
});

test('a late save for game A leaves newly opened game B intact', async () => {
  let selected = { id: 'a', name: 'Game A' };
  const save = deferredSave();
  const completion = save.promise.then(() => {
    selected = applySelectedGamePatch(selected, 'a', { ratingStory: 9 });
  });
  const gameB = { id: 'b', name: 'Game B', ratingStory: 3 };
  selected = gameB;
  save.resolve();
  await completion;
  expect(selected).toBe(gameB);
});

test('a save updates the open game without losing its render data', () => {
  const game = { id: 'a', name: 'Game A', platformNames: ['PC'], rating: 5 };
  expect(applySelectedGamePatch(game, 'a', { rating: 8 })).toEqual({
    ...game, rating: 8,
  });
  expect(game.rating).toBe(5);
});
