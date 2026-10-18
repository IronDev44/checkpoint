# Weekly quiz

The home page shows three questions after the next-session card, before the
library preview and deals. Players select an answer, explicitly confirm it,
then see the correction, explanation and awarded XP. They may skip between
the three questions and return to unanswered ones. Completed rounds remain
readable until the next week.

## Rotation and history

- The three-question format starts on Monday 19 October 2026 (Paris time).
  Earlier packs are derived from the frozen original 260-question bank and keep
  all five entries, original order and answer IDs. Players finishing the already
  published week lose neither questions nor XP. The last old pack is placed at
  the end of the new deck to avoid repeating it on the first new Monday.

- Weeks start Monday at midnight in `Europe/Paris`, independently of the device
  timezone. The current week refreshes every minute and when the app regains
  focus or visibility. A submission from an expired week is rejected.
- A deterministic editorial deck deals three questions without replacement.
  The 500-question bank supplies 166 full weeks (498 distinct questions). The
  next pack deals the last two entries before starting the next cycle, so no
  questions are lost and every week still has three. Preserve stable IDs. Changes to this deck
  should be planned between weekly rounds to avoid changing a live selection.
- The first revision retained 115 reviewed entries, removed 114 old entries and
  added 145. The current expansion adds another 240 authored questions across
  24 groups, bringing the total to 500.
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
  goal requires the full current pack, rather than one fixed number of answers.

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

Tests cover the complete bank, a complete 500-question rotation, Paris midnight and DST/ISO
year changes, invalid or expired submissions, idempotence, legacy history,
streak rewards, answer confirmation, week rollover, and real App persistence
across remounts with in-memory account doubles. Browser QA uses a local mock
account, not production accounts.

Additional primary-source spot checks for the expanded reserve:

- [Bandai Namco: Elden Ring gameplay guide](https://www.bandainamcoent.com/news/elden-ring-introduction-part-3-gameplay-overview)
- [PlayStation: Bloodborne starter guide](https://blog.fr.playstation.com/2018/03/06/12-conseils-pour-bien-commencer-bloodborne/)
- [Konami: Metal Gear Solid character manual](https://metalgear.konami.net/manual/mc1/mgs1/pc/en/page18.html)
- [Nintendo: Breath of the Wild and Polaris](https://www.nintendo.com/fr-fr/News/2016/Juin/Nintendo-met-en-lumiere-The-Legend-of-Zelda-Breath-of-the-Wild-lors-de-la-premiere-journee-de-l-E3-1113663.html)
- [Bethesda: making Morrowind](https://bethesda.net/en-US/news/making-morrowind-20th-anniversary)
