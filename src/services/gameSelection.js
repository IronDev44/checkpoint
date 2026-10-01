// A save may finish after the detail was closed or another game was opened.
export function applySelectedGamePatch(currentGame, gameId, patch) {
  if (!currentGame || currentGame.id !== gameId) return currentGame;
  return { ...currentGame, ...patch };
}
