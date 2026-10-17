# Checkpoint — Noir & Or

Original flagship theme, based on the approved black and champagne gold concept.

- ID: `theme-checkpoint`. First in Options; default for new profiles and missing or invalid startup preferences. Existing saved themes remain selected.
- Palette: near-black `#090a0c`, charcoal `#17181c`, champagne `#d6b66f`, ivory `#f4f0e7`. Gold buttons use dark text for contrast; ordinary surfaces remain neutral.
- Original SVG mark: an open angular gateway and diamond save point. Shared between the header, intro and transition. No generated bitmap, franchise logo or external image request.
- Intro: gateway traced over 2.2 seconds, arriving diamond, restrained orbit points. Progress comes from the existing authentication and loading coordinator; it does not invent completion. Skip is only available when the coordinator supplies its callback.
- Transition: 840 ms, dark veil, gold diagonal trace, save-point mark and 12 small sparks. Reduced mode removes sparks and trace; disabled mode remains controlled by the existing app setting. System reduced-motion preferences remain respected unless the user explicitly enables full transitions.
- Home: current session, flat collection figures, then level and next actions. DOM and keyboard order match the visual order. Other themes retain their original layout.
- Scope: theme variables, navigation, controls, profile/header options, login/tour surfaces and browser chrome. No changes to account permissions, collection data or XP calculation.

Implementation: `CheckpointEffects.jsx`, `CheckpointTheme.css`, `App.js`, `SplashScreen.jsx`, `ThemeTransition.js`, `startupAppearance.js`, `public/index.html`.

Validation: targeted startup and theme suites, production compilation, real Chromium screenshots at mobile and desktop viewport sizes. Browser viewport checks do not replace physical Android/iPhone testing.
