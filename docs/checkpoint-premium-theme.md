# Checkpoint Premium

An additional original Checkpoint theme: near-black ink, platinum metal and restrained pearl/lavender reflections. The standard black-and-gold theme is named **Checkpoint** and stays the default.

- ID: `theme-checkpointpremium`; startup-compatible and independent of the standard theme's saved ID.
- Unlock: displayed **level 50**, including the app's existing checkpoint/trial level rules. The level lives in `CHECKPOINT_PREMIUM_LEVEL` in `src/services/themeRewards.js`.
- The reward stays earned when games or hardware are removed and XP goes down. It is awarded automatically to existing profiles already at level 50 or above. Earning it does not change the selected theme.
- Options shows a compact 56px choice with its name and a lock/level requirement when unavailable, with a checkmark when selected. Colour descriptions and progress subrows are omitted. Selection is guarded both on the card and in the app's theme-change handler.
- Unlocks use UID-scoped `checkpoint-theme-unlocks` storage and the existing private-settings D1 document's `unlockedThemes` array. Local and remote unlocks are merged. Cloud settings, games, hardware and trial progress must finish loading before a saved locked theme can fall back to standard Checkpoint. A failed collection load does not revoke a previously earned reward.
- The pre-authentication appearance hint stores only the theme/effects/light settings, never a level, reward list or account data.
- The shared emblem supports a platinum palette without changing the default gold artwork or installed app icons. Each SVG instance keeps unique paint/mask IDs.
- Intro: a platinum emblem framed by unfolding pearl facets, with an edition label and real startup progress. Transition: two dark diagonal shutters, a pearl seam and the platinum seal. Full and reduced modes retain the existing 840 ms transition cleanup. Reduced mode removes moving shutters and decorative transition facets.
- No bitmap artwork, network image requests, database migration or payment feature is introduced.
- Pearl reflections: brighter metal on primary actions, a clearly contrasted specular sweep every 3.6 seconds on key buttons, a slower sweep on the main XP card, traveling light on hero/rank card edges, a reflective wordmark and an illuminated active navigation tab. Repeated wishlist buttons only animate on desktop hover. Calm effects, reduced UI and system reduced-motion disable the moving reflections while retaining the static metal finish. Reflective overlays ignore pointer events and do not alter button dimensions.

Validation: eight targeted suites (73 tests), production compilation, browser checks at 320×568, 390×844, desktop and landscape sizes; locked/unlocked selection, retained reward after a level decrease, full/reduced animation and transition cleanup. Integration cases mount the real App with in-memory account and D1 doubles to check automatic earning, private-settings persistence, locked-selection fallback and cloud restoration. Physical iPhone/Android rendering remains unverified.

Header sizing is shared with standard Checkpoint: larger responsive lettering and emblem, with symmetric space reserved for the notification button.


## Checkpoint Ultime

- ID `theme-checkpointultimate`; automatically earned at displayed level 100 via the same permanent, account-scoped reward system. Standard and Premium keep their own IDs and level rules.
- Obsidian base, diamond/cyan metal and a fine champagne edge. Shared signature layouts and specular effects retain the same mobile navigation and enlarged wordmark.
- The shared original C has a diamond palette. Intro: a faceted aperture assembles around the mark. Transition: a travelling light seam opens an obsidian veil, with eight rays and a central seal. It uses the existing 840ms cleanup.
- Reduced mode omits transition rays and moving geometry. Calm UI and system reduced motion stop continuous reflections. Unique SVG paint IDs, pre-auth appearance-only storage and private-settings sync also apply to Ultime.
- No changes to installed icons, XP calculations, collections or database schema.

The authenticated configured owner receives early Ultime access after private account data has loaded. Ownership uses the configured UID, never a public profile flag or display name. The grant is stored in the same private unlock list and does not change the selected theme.
