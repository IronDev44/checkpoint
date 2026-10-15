import { accountStorage } from "./accountData";

export const DEFAULT_SOUND_SETTINGS = { enabled: true, style: "balanced", volume: 55 };
export const SOUND_EVENTS = [
  { id: "click", label: "Navigation" }, { id: "success", label: "Ajout" },
  { id: "delete", label: "Retrait" }, { id: "badge", label: "Badge" }, { id: "levelup", label: "Niveau" },
];
export const SOUND_PRESETS = [
  { id: "balanced", name: "Checkpoint doux", description: "Des notes rondes et discrètes.", wave: "sine", base: 76, steps: [0, 3, 7, 10, 12], beat: .065, length: .11, cutoff: 3400, gain: 1, attack: .012 },
  { id: "nes", name: "Arcade 8-bit", description: "Des bips courts, comme sur une console rétro.", wave: "square", base: 72, steps: [0, 4, 7, 12, 16], beat: .055, length: .07, cutoff: 4200, gain: .57, attack: .004 },
  { id: "handheld", name: "Console portable", description: "Des petites notes vives et légères.", wave: "triangle", base: 81, steps: [0, 2, 7, 9, 14], beat: .043, length: .075, cutoff: 5200, gain: 1.05, attack: .006 },
  { id: "adventure", name: "Aventure fantasy", description: "Un son de harpe pour les découvertes et les trésors.", wave: "triangle", base: 69, steps: [0, 5, 7, 12, 14], beat: .085, length: .23, cutoff: 3100, gain: 1.05, attack: .016, harmonic: .018 },
  { id: "crystal", name: "RPG cristal", description: "Des clochettes claires et un accord de récompense.", wave: "sine", base: 79, steps: [0, 4, 7, 11, 16], beat: .08, length: .28, cutoff: 7500, gain: .95, attack: .004, harmonic: .036 },
  { id: "space", name: "Station orbitale", description: "Des pulsations et des balayages de science-fiction.", wave: "sine", base: 65, steps: [0, 7, 12, 14, 19], beat: .075, length: .15, cutoff: 4200, gain: 1, attack: .01, slide: 1.7, harmonic: .025 },
  { id: "racing", name: "Course arcade", description: "Un petit boost pour chaque action.", wave: "sawtooth", base: 57, steps: [0, 7, 12, 16, 19], beat: .048, length: .12, cutoff: 2600, gain: .62, attack: .008, slide: 2 },
  { id: "battle", name: "Combat arcade", description: "Des sons plus graves et une victoire bien marquée.", wave: "square", base: 60, steps: [0, 3, 7, 10, 15], beat: .063, length: .095, cutoff: 2300, gain: .65, attack: .005, slide: .82 },
];
const presets = new Map(SOUND_PRESETS.map(preset => [preset.id, preset]));
const validStyle = style => style === "retro" ? "nes" : presets.has(style) ? style : "balanced";
export function normalizeSoundSettings(value = {}, fallback = DEFAULT_SOUND_SETTINGS) {
  const source = value && typeof value === "object" ? value : {};
  const volume = source.volume !== "" && source.volume != null ? Number(source.volume) : NaN;
  return {
    enabled: typeof source.enabled === "boolean" ? source.enabled : fallback.enabled,
    style: validStyle(source.style || fallback.style),
    volume: Math.max(0, Math.min(100, Math.round(Number.isFinite(volume) ? volume : fallback.volume))),
  };
}
export function readLegacySoundSettings(storage = accountStorage) {
  try { return normalizeSoundSettings({ enabled: storage.getItem("checkpoint-sound-enabled") !== "false", style: storage.getItem("checkpoint-sound"), volume: storage.getItem("checkpoint-sound-volume") }); }
  catch { return { ...DEFAULT_SOUND_SETTINGS }; }
}
export function readSoundSettings(storage = accountStorage) {
  const legacy = readLegacySoundSettings(storage);
  try { return normalizeSoundSettings(JSON.parse(storage.getItem("checkpoint-app-options") || "{}").sound, legacy); }
  catch { return legacy; }
}
export const soundVolumeToGain = volume => .65 * (normalizeSoundSettings({ volume }).volume / 100) ** 1.6;

export function getSoundSequence(style, event = "click") {
  const preset = presets.get(validStyle(style));
  const recipes = {
    click: [0], success: [0, 1, 2], delete: [1, -1], badge: [0, 2, 3, 4], levelup: [0, 1, 2, 3, 4],
  };
  const action = recipes[event] ? event : "click";
  let melody = recipes[action];
  if (preset.id === "handheld" && action === "success") melody = [2, 1, 3];
  if (preset.id === "battle" && action === "levelup") melody = [0, 0, 2, 3, 4];
  const beat = action === "click" ? .025 : preset.beat;
  const result = melody.map((step, index) => {
    const frequency = 440 * 2 ** ((preset.base + (step < 0 ? -5 : preset.steps[step]) - 69) / 12);
    const duration = action === "click" ? Math.min(.07, preset.length * .5) : preset.length * (index === melody.length - 1 ? 1.35 : 1);
    return { frequency, endFrequency: frequency * (action === "delete" ? .8 : preset.slide || 1), start: index * beat, duration, volume: .065 * preset.gain, waveform: preset.wave, attack: preset.attack, cutoff: preset.cutoff };
  });
  if (preset.harmonic) {
    const last = result[result.length - 1];
    result.push({ ...last, frequency: last.frequency * 2, endFrequency: last.endFrequency * 2, start: last.start + .012, volume: preset.harmonic, waveform: "sine" });
  }
  return result;
}

function browserContext() {
  const Context = window.AudioContext || window.webkitAudioContext;
  return Context ? new Context() : null;
}

export function createSoundPlayer({ createContext = browserContext, readSettings = readSoundSettings } = {}) {
  let context = null, generation = 0, previewRequest = 0, lastClick = -Infinity, appliedStyle = "";
  const voices = new Set();
  function stopAll() {
    generation++; previewRequest++;
    [...voices].forEach(voice => voice.stop());
  }
  function applySettings(value) {
    const settings = normalizeSoundSettings(value);
    generation++;
    if (!settings.enabled || !settings.volume || (appliedStyle && settings.style !== appliedStyle)) stopAll();
    else voices.forEach(voice => {
      voice.master.gain.cancelScheduledValues(context.currentTime);
      voice.master.gain.setTargetAtTime(soundVolumeToGain(settings.volume), context.currentTime, .015);
    });
    appliedStyle = settings.style;
  }
  async function play(type, options = {}) {
    const settings = normalizeSoundSettings(options && typeof options === "object" && options.settings ? options.settings : readSettings());
    if (typeof options === "string") settings.style = validStyle(options);
    const preview = options?.preview === true || options?.force === true;
    if (!settings.volume) return { ok: false, reason: "volume" };
    if (!settings.enabled && !preview) return { ok: false, reason: "muted" };
    const request = preview ? ++previewRequest : 0, revision = generation;
    if (preview) [...voices].filter(voice => voice.preview).forEach(voice => voice.stop());
    let release = () => {};
    try {
      if (!context || context.state === "closed") context = createContext();
      if (!context) return { ok: false, reason: "unsupported" };
      if (context.state === "suspended" || context.state === "interrupted") await context.resume();
      if (generation !== revision || (preview && request !== previewRequest)) return { ok: false, reason: "cancelled" };
      if (context.state !== "running") return { ok: false, reason: "blocked" };
      const now = context.currentTime + .008;
      if (type === "click" && !preview && now - lastClick < .045) return { ok: false, reason: "throttled" };
      if (type === "click" && !preview) lastClick = now;
      while (voices.size >= 4) voices.values().next().value.stop();
      const sequence = getSoundSequence(settings.style, type);
      const master = context.createGain();
      release = () => master.disconnect();
      const filter = context.createBiquadFilter();
      release = () => { filter.disconnect(); master.disconnect(); };
      master.gain.value = soundVolumeToGain(settings.volume); master.connect(context.destination);
      filter.type = "lowpass"; filter.frequency.value = sequence[0].cutoff; filter.Q.value = .65; filter.connect(master);
      const nodes = [filter, master], oscillators = [];
      let remaining = sequence.length, timer, stopped = false, cleaned = false;
      const cleanup = () => {
        if (cleaned) return; cleaned = true; clearTimeout(timer); voices.delete(voice);
        nodes.forEach(node => { try { node.disconnect(); } catch {} });
      };
      const voice = { master, preview, stop: () => {
        if (stopped || cleaned) return; stopped = true; voices.delete(voice); clearTimeout(timer);
        master.gain.cancelScheduledValues(context.currentTime);
        master.gain.setTargetAtTime(.0001, context.currentTime, .006);
        oscillators.forEach(oscillator => { try { oscillator.stop(context.currentTime + .025); } catch {} });
        timer = setTimeout(cleanup, 40);
      } };
      voices.add(voice);
      release = voice.stop;
      sequence.forEach(note => {
        const oscillator = context.createOscillator();
        nodes.push(oscillator); oscillators.push(oscillator);
        const gain = context.createGain();
        nodes.push(gain);
        oscillator.type = note.waveform;
        oscillator.frequency.setValueAtTime(note.frequency, now + note.start);
        if (note.endFrequency !== note.frequency) oscillator.frequency.exponentialRampToValueAtTime(note.endFrequency, now + note.start + note.duration * .8);
        gain.gain.setValueAtTime(.0001, now + note.start);
        gain.gain.exponentialRampToValueAtTime(note.volume, now + note.start + Math.min(note.attack, note.duration * .4));
        gain.gain.exponentialRampToValueAtTime(.0001, now + note.start + note.duration);
        oscillator.connect(gain); gain.connect(filter);
        oscillator.onended = () => { remaining--; if (!remaining) cleanup(); };
        oscillator.start(now + note.start); oscillator.stop(now + note.start + note.duration);
      });
      const duration = Math.max(...sequence.map(note => note.start + note.duration));
      timer = setTimeout(cleanup, (duration + .15) * 1000);
      return { ok: true, duration };
    } catch { try { release(); } catch {} return { ok: false, reason: "blocked" }; }
  }
  return { play, applySettings, stopAll };
}

const player = createSoundPlayer();
export const playSound = (type, options) => player.play(type, options);
export const applySoundSettings = settings => player.applySettings(settings);
export const stopAllSounds = () => player.stopAll();
