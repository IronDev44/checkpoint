import { selectTimelineEvents } from './gamingTimeline';
const events = [
  { id: 'now', type: 'checkpoint', year: null },
  { id: 'goty', type: 'goty', year: 2024 },
  { id: 'console', type: 'hardware', year: 2020 },
  { id: 'game', type: 'game', year: 2024 },
];
test('the timeline is chronological and keeps the current checkpoint', () => {
  expect(selectTimelineEvents(events).map((event) => event.id)).toEqual(['console', 'goty', 'game', 'now']);
  expect(events[0].id).toBe('now');
});
test('the newest-first view starts with the current checkpoint', () => {
  expect(selectTimelineEvents(events, 'all', true).map((event) => event.id)).toEqual(['now', 'goty', 'game', 'console']);
});
test('games, GOTY and hardware have distinct filters', () => {
  expect(selectTimelineEvents(events, 'games')).toHaveLength(2);
  expect(selectTimelineEvents(events, 'goty').map((event) => event.id)).toEqual(['goty']);
  expect(selectTimelineEvents(events, 'hardware').map((event) => event.id)).toEqual(['console']);
});
