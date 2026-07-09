import { SONY_HARDWARE } from "./sony";
import { MICROSOFT_HARDWARE } from "./microsoft";
import { NINTENDO_HARDWARE } from "./nintendo";
import { SEGA_HARDWARE } from "./sega";
import { PC_HANDHELDS_HARDWARE } from "./pc-handhelds";
import { RETRO_HARDWARE } from "./retro";
import { ALTERNATIVE_HARDWARE } from "./alternative";
import { CONTROLLERS_HARDWARE } from "./controllers";
import { AUDIO_HARDWARE } from "./audio";
import { DISPLAYS_HARDWARE } from "./displays";
import { MICE_HARDWARE } from "./mice";
import { KEYBOARDS_HARDWARE } from "./keyboards";

export const HARDWARE_CATALOG = [
  ...SONY_HARDWARE,
  ...MICROSOFT_HARDWARE,
  ...NINTENDO_HARDWARE,
  ...SEGA_HARDWARE,
  ...PC_HANDHELDS_HARDWARE,
  ...RETRO_HARDWARE,
  ...ALTERNATIVE_HARDWARE,
  ...CONTROLLERS_HARDWARE,
  ...AUDIO_HARDWARE,
  ...DISPLAYS_HARDWARE,
  ...MICE_HARDWARE,
  ...KEYBOARDS_HARDWARE,
];
