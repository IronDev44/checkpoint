import { isValidReleaseDate, localDateKey, selectUpcomingReleases } from './upcomingReleases';

const today = new Date(2026, 9, 1, 18);
const game = (name, released, extra = {}) => ({ name, released, ...extra });

test('past, absent, malformed and unannounced dates never enter the calendar', () => {
  expect(selectUpcomingReleases([
    game('Past', '2026-09-30'), game('Unknown', ''), game('TBA', '2026-12-01', { tba: true }),
    game('Invalid', '2026-02-30'), game('Year only', '2027'), game('Far away', '2028-01-01'),
    game('Today', '2026-10-01'), game('Future', '2026-12-01'),
  ], today).map((item) => item.name)).toEqual(['Today', 'Future']);
});

test('dates are chronological and duplicate titles appear once', () => {
  expect(selectUpcomingReleases([
    game('Later', '2027-01-01'), game('Game', '2026-12-01'), game(' game ', '2026-12-01'), game('First', '2026-10-02'),
  ], today).map((item) => item.name)).toEqual(['First', 'Game', 'Later']);
});

test('an already loaded game disappears when the day changes', () => {
  const releases = [game('Today', '2026-10-01')];
  expect(selectUpcomingReleases(releases, today)).toHaveLength(1);
  expect(selectUpcomingReleases(releases, new Date(2026, 9, 2))).toHaveLength(0);
  expect(localDateKey(today)).toBe('2026-10-01');
});

test('only real calendar dates pass, including leap years', () => {
  expect(isValidReleaseDate('2028-02-29')).toBe(true);
  for (const value of ['2026-02-29', '2026-13-01', '2026-04-31', null, 'not a date']) {
    expect(isValidReleaseDate(value)).toBe(false);
  }
});
