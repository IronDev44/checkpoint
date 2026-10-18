# Weekly quiz

The home page shows five questions after the next-session card, before the
library preview and deals. Players select an answer, explicitly confirm it,
then see the correction, explanation and awarded XP. They may skip between
the five questions and return to unanswered ones. Completed rounds remain
readable until the next week.

## Rotation and history

- Weeks start Monday at midnight in `Europe/Paris`, independently of the device
  timezone. The current week refreshes every minute and when the app regains
  focus or visibility. A submission from an expired week is rejected.
- A deterministic editorial deck deals five questions without replacement.
  The 260-question bank provides 52 distinct packs before repeating; each pack
  has at least three categories. Preserve stable IDs. Changes to this deck
  should be planned between weekly rounds to avoid changing a live selection.
- The bank retains 115 reviewed entries, removes 114 old entries and adds 145.
  Duplicated facts, ambiguous prompts, self-answering questions and distracting
  joke alternatives were removed or rewritten. Questions and explanations are
  authored in French, across consoles, series, mechanics and hardware.
- Progress stays in the existing account-scoped local key
  `checkpoint-weekly-quiz`. Existing XP, badge streaks and free-play history
  remain intact. Old single-question weekly records are recognized when the
  question matches. This change does not add cloud synchronization or a server
  scheduler; all clients derive the same selection locally.
- New records use `weekKey:questionId`. The service validates the current pack
  and answer index and refuses a replay. The App also claims synchronously in a
  ref before updating React state to prevent duplicate rewards from rapid taps.
- Correct answers award 120 XP, plus 30 XP per successive correct answer up to
  120 bonus XP. A miss awards 20 XP and resets the streak. Missing a week resets
  its bonus. There is no new automatic completion reward; the existing weekly
  goal now requires all five answers instead of a single answer.

## Editorial references

Primary-source spot checks used while revising specific facts (not a claim that
every retained fact was independently re-researched):

- [Nintendo: inserting GBA cartridges into a DS Lite](https://en-americas-support.nintendo.com/app/answers/detail/a_id/4098)
- [Nintendo: original DS compatibility](https://en-americas-support.nintendo.com/app/answers/detail/a_id/4798/~/game-boy-game-doesnt-fit)
- [PlayStation: ASTRO BOT and the Dual Speeder](https://www.playstation.com/en-us/games/astro-bot/)
- [Atlus: Persona 4 Golden and Inaba](https://persona.atlus.com/p4g/)
- [Nintendo: Fire Emblem Shadow Dragon manual](https://www.nintendo.com/eu/media/downloads/games_8/emanuals/nintendo_ds_21/Manual_NintendoDS_FireEmblemShadowDragon_EN.pdf)
- [Nintendo: F-ZERO manual](https://www.nintendo.co.jp/clvs/manuals/common/pdf/CLV-P-SAABE.pdf)
- [Nintendo: The Minish Cap](https://www.nintendo.com/fr-fr/Jeux/Game-Boy-Advance/The-Legend-of-Zelda-The-Minish-Cap-267486.html)
- [Supergiant: Hades updates](https://www.supergiantgames.com/blog/hades-updates/)

The trial-room GBA question is also replaced with a concrete compatibility
question; several vague prompts and implausible distractors in the later rooms
were revised without changing completion thresholds or earned rewards.

## Validation

Tests cover the complete bank, a 52-week rotation, Paris midnight and DST/ISO
year changes, invalid or expired submissions, idempotence, legacy history,
streak rewards, answer confirmation, week rollover, and real App persistence
across remounts with in-memory account doubles. Browser QA uses a local mock
account, not production accounts.
