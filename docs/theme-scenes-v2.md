> Historique : les cinq illustrations ci-dessous ont été retirées de la version publiée le 17 octobre 2026. Voir [les scènes animées originales](theme-scenes-v3.md).

# Intros and tab transitions — 16 October 2026

The 16 recent universes now have separate startup establishing shots. Short tab
motion no longer replays their startup scenes. The older Harry Potter, Marvel,
Arcade Sunset, Carbon Ice, Circuit Mint, Neon Tokyo, Pokemon, Final Fantasy and
Steam Deck intros also have new startup-only vignettes.

Halo has a redrawn Mark VI helmet with independent armor and visor gradients;
its transition is an orbital/slipspace scan. Portal opens in a test chamber and
keeps the companion cube and portals for tab motion. God of War opens on the axe
in a Nordic landscape and changes tabs through a fractured rune seal. Red Dead
opens on a western panorama; its ink wipe and moving mesas are separate from the
rider. Assassin's Creed opens over Florence and uses an Animus synchronization
for navigation. Back to the Future opens with the time machine and changes tabs
with 88 mph, tire tracks and a single electrical discharge. Jurassic Park opens
at the actual park entrance motif and uses perspective-opening gates for tabs.

Full, reduced and disabled transition preferences keep their existing semantics.
Reduced scenes use fewer particles and omit extra burst layers. Tab transitions
do not fetch the intro plates. They finish within the existing 840 ms lifecycle.
Startup authentication, progress and account isolation are unchanged.

## Generated assets

Five original background illustrations were generated with the built-in image
generation tool, then encoded as WebP (quality 83). No external image service is
called by the application. Only the selected intro's image is loaded.

| Asset under `public/theme-scenes/` | Bytes |
| --- | ---: |
| `leviathan-v2.webp` | 225382 |
| `western-v2.webp` | 105614 |
| `florence-v2.webp` | 160378 |
| `time-machine-v2.webp` | 167116 |
| `park-gates-v2.webp` | 268520 |

### Final generation prompts

**leviathan**

A God of War Norse cinematic intro background plate, portrait 1024x1536, photoreal AAA environment concept art. A beautifully crafted single bladed Leviathan axe, engraved crescent steel blade on RIGHT side of an aged carved wooden handle, leather wrappings, faint icy blue rune inlays, embedded in a massive weathered stump. Axe dominates upper 55% centered, tilted slightly. Misty Nordic pine forest, monumental snowy crag and cold dawn in background, delicate snow. A narrow torn red cloth tied to handle. Real physical materials, sophisticated atmospheric depth, NO character, no cartoon, no icon style. Bottom 40% dark blue-black with negative space for app typography added separately. No text, no watermarks, no UI.

**western**

Red Dead Redemption inspired cinematic western background plate for gaming app intro. Portrait 1024x1536, extremely high quality painterly realistic film key art, deep vermilion dusk sky and large setting sun, Monument Valley weathered sandstone mesas, desert haze. A small anatomically accurate horse and lone cowboy rider seen from behind at bottom of upper half, quiet contemplative silhouette on ridge, occupying only 12% of image height, NOT a large toy horse, NO cartoon. Upper 60% vivid dramatic western landscape; bottom 40% fades into very dark burgundy-black negative space for UI text later. Layers of dust, restrained film grain. No weapons focus, no text, no logo, no border.

**florence**

Assassin's Creed inspired premium cinematic background plate, portrait 1024x1536. A highly realistic white hooded Renaissance assassin seen from behind perched on a weathered Gothic rooftop eagle gargoyle, looking out over Florence's cathedral dome and terracotta rooftops at hazy sunrise. Main figure small enough to show whole upper silhouette with natural human proportions, facing AWAY, no face visible, richly detailed white linen hood and layered off-white leather cloak, red sash, aged stone, cinematic desaturated silver and muted red grading. Figure centered upper 35%, skyline upper 60%, lower 40% fades into charcoal-black negative space for app UI text added separately. AAA game cinematic, not cartoon, not simplistic illustration. No text, no logo, no watermark.

**time-machine**

Back to the Future cinematic background plate for premium app intro, portrait 1024x1536. Iconic brushed stainless steel DeLorean time machine parked at night in empty rain-slicked Twin Pines mall parking lot, three quarter rear view, gull wing door raised, detailed glowing blue time coils and red rear lamps, believable low sports car proportions, realistic mechanical vents and rear machinery. Center car upper third of image, atmospheric blue lightning in clouds, warm distant parking lights and reflections. Movie-quality realistic concept art, restrained teal and amber lighting. Bottom 40% nearly black with empty negative space for app typography. No people, no text, no watermarks, no UI, no logos.

**park-gates**

Jurassic Park original movie iconic entrance gates, premium cinematic environmental background plate portrait 1024x1536. Massive tall weathered stone pillars with blazing amber torches, huge heavy CLOSED double wooden gates, recognizable curved overhead red and yellow sign reading exactly 'JURASSIC PARK', dense lush tropical jungle, nighttime rain, wet wood and stone, warm flame reflections, misty track leading into the gate. Symmetrical grand entrance dominates upper 65%, realistic practical movie set atmosphere, tactile detailed materials, not an illustration icon, not cartoon. Bottom 35% path fades to dark jungle black for UI copy added later. No dinosaur foreground, no amber mosquito, no extra text, no watermark, no UI.

## Validation

145 targeted tests passed across startup, theme dispatch, progress, portal cleanup,
reduced mode, unique SVG identifiers and intro/transition separation. Browser
checks cover the 25 modified intros, the six replaced transitions, mobile/desktop
sizes and the reduced variant. Browser viewport testing is not physical Android
or iPhone hardware testing.
