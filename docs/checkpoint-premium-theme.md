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
- Obsidian base, dark lacquered actions and cut-crystal edges, deliberately distinct from solid pearl/platinum Premium. Shared signature layouts and specular effects retain the same mobile navigation and enlarged wordmark.
- The original C keeps its silhouette but uses independent cut-crystal geometry: dark tables, narrow bevels, a faceted gem and a clipped optical light sweep. Gold/platinum and installed icons are unchanged. Intro: a one-shot studio reveal, a faint floor reflection and a delayed wordmark; it settles at 3.2 seconds, within the existing minimum startup time. Long loads keep the final frame rather than looping the reveal. Transition: three crossing glass planes and the cut-crystal seal, using the existing 840ms cleanup.
- Reduced mode omits glass planes and the boot reflection, and shows a stationary intro. System reduced motion also stops the studio reveal. Calm UI and system reduced motion stop continuous reflections. Unique SVG paint IDs, pre-auth appearance-only storage and private-settings sync also apply to Ultime.
- No changes to installed icons, XP calculations, collections or database schema. The intro temporarily suppresses document scrolling through a scoped CSS selector, which releases as soon as the intro unmounts.
- Validation for the crystal revision: 63 tests across six focused suites, final SVG/intro checks rerun after the clipped-light correction, production build, and browser checks at 320×568, 390×844, 844×390 and 1440×900. Full/reduced appearance, real loading value, skip, restored scrolling, unique paint references and transition teardown were checked. Physical iPhone/Android testing remains separate.

The authenticated configured owner receives early Ultime access after private account data has loaded. Ownership uses the configured UID, never a public profile flag or display name. The grant is stored in the same private unlock list and does not change the selected theme.


Home polish: the collection overview now uses the shared panel material, a semantic stats grid (two columns on phones, four on desktop) and three explicit actions. The secondary library preview is a single panel with cover thumbnails, two-line titles, status/rating metadata and direct game links. It is absent when no secondary game is available.

Premium/Ultime card-edge reflections now use a one-pixel rounded perimeter mask, with no side inset. The gradient travels at a constant rate from fully outside one edge to fully outside the other, so the cycle resets invisibly. When motion is disabled the overlay has zero opacity, rather than leaving a bright band parked on the card. Controls ignore pointer events. Home navigation and game-opening callbacks remain unchanged.
