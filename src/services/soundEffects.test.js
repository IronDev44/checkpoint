jest.mock("./accountData", () => ({ accountStorage: { getItem: jest.fn(() => null) } }));
const { DEFAULT_SOUND_SETTINGS, SOUND_PRESETS, SOUND_EVENTS, normalizeSoundSettings, readSoundSettings, soundVolumeToGain, getSoundSequence, createSoundPlayer } = require("./soundEffects");

const storage = entries => ({ getItem: key => entries[key] ?? null });
function fakeContext(state = "running") {
  const param = () => ({ value: 0, setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn(), cancelScheduledValues: jest.fn(), setTargetAtTime: jest.fn() });
  const node = () => ({ connect: jest.fn(), disconnect: jest.fn() });
  const nodes = [], gains = [], oscillators = [];
  const context = {
    state, currentTime: 10, destination: {},
    resume: jest.fn(async () => { context.state = "running"; }),
    createGain: jest.fn(() => { const gain = { ...node(), gain: param() }; nodes.push(gain); gains.push(gain); return gain; }),
    createBiquadFilter: jest.fn(() => { const filter = { ...node(), frequency: param(), Q: param() }; nodes.push(filter); return filter; }),
    createOscillator: jest.fn(() => { const oscillator = { ...node(), frequency: param(), start: jest.fn(), stop: jest.fn() }; nodes.push(oscillator); oscillators.push(oscillator); return oscillator; }),
  };
  return { context, nodes, gains, oscillators };
}

describe("sound preferences", () => {
  test("migrates the old mute and retro choices without losing zero volume", () => {
    expect(readSoundSettings(storage({ "checkpoint-sound-enabled": "false", "checkpoint-sound": "retro", "checkpoint-sound-volume": "0" }))).toEqual({ enabled: false, style: "nes", volume: 0 });
  });
  test("prefers account options and falls back safely for corrupt storage", () => {
    expect(readSoundSettings(storage({ "checkpoint-sound-enabled": "false", "checkpoint-app-options": JSON.stringify({ sound: { enabled: true, style: "crystal", volume: 83 } }) }))).toEqual({ enabled: true, style: "crystal", volume: 83 });
    expect(readSoundSettings(storage({ "checkpoint-app-options": "not JSON" }))).toEqual(DEFAULT_SOUND_SETTINGS);
    expect(readSoundSettings({ getItem: () => { throw new Error("No account"); } })).toEqual(DEFAULT_SOUND_SETTINGS);
  });
  test("bounds invalid values and uses a smooth increasing volume curve", () => {
    expect(normalizeSoundSettings({ style: "unknown", volume: 130 })).toEqual({ ...DEFAULT_SOUND_SETTINGS, volume: 100 });
    expect(normalizeSoundSettings({ volume: -20 }).volume).toBe(0);
    expect(normalizeSoundSettings({ volume: "oops" }).volume).toBe(55);
    expect(soundVolumeToGain(0)).toBe(0);
    expect(soundVolumeToGain(20)).toBeLessThan(soundVolumeToGain(55));
    expect(soundVolumeToGain(55)).toBeLessThan(soundVolumeToGain(100));
  });
  test("all eight families have distinct, finite, short cues with headroom at full volume", () => {
    expect(SOUND_PRESETS).toHaveLength(8);
    const signatures = new Set();
    for (const preset of SOUND_PRESETS) {
      signatures.add(JSON.stringify(getSoundSequence(preset.id, "levelup")));
      for (const event of SOUND_EVENTS) {
        const sequence = getSoundSequence(preset.id, event.id);
        expect(Math.max(...sequence.map(note => note.start + note.duration))).toBeLessThan(.9);
        // Even four overlapping cues remain below full scale.
        expect(sequence.reduce((sum, note) => sum + note.volume, 0) * soundVolumeToGain(100) * 4).toBeLessThan(1);
        sequence.forEach(note => {
          expect(Number.isFinite(note.frequency)).toBe(true);
          expect(note.frequency).toBeGreaterThan(0);
          expect(note.endFrequency).toBeGreaterThan(0);
          expect(note.duration).toBeGreaterThan(note.attack);
        });
      }
    }
    expect(signatures.size).toBe(8);
  });
});

describe("sound playback lifecycle", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => { jest.runOnlyPendingTimers(); jest.useRealTimers(); });
  function setup(settings = DEFAULT_SOUND_SETTINGS, state) {
    const fake = fakeContext(state);
    const createContext = jest.fn(() => fake.context);
    return { ...fake, createContext, player: createSoundPlayer({ createContext, readSettings: () => settings }) };
  }
  test("stays lazy when muted or at zero; explicit previews keep mute unchanged", async () => {
    const muted = setup({ ...DEFAULT_SOUND_SETTINGS, enabled: false });
    expect(await muted.player.play("success")).toEqual({ ok: false, reason: "muted" });
    expect(muted.createContext).not.toHaveBeenCalled();
    expect((await muted.player.play("success", { preview: true })).ok).toBe(true);
    expect(await muted.player.play("success")).toEqual({ ok: false, reason: "muted" });
    const zero = setup({ ...DEFAULT_SOUND_SETTINGS, volume: 0 });
    expect(await zero.player.play("success", { preview: true })).toEqual({ ok: false, reason: "volume" });
    expect(zero.createContext).not.toHaveBeenCalled();
  });
  test("uses the selected style, latest preview settings and one reusable context", async () => {
    const { player, createContext, gains, oscillators } = setup();
    await player.play("success", { preview: true, settings: { enabled: true, style: "nes", volume: 100 } });
    expect(gains[0].gain.value).toBe(soundVolumeToGain(100));
    expect(oscillators[0].type).toBe("square");
    await player.play("levelup", "space");
    expect(createContext).toHaveBeenCalledTimes(1);
    expect(oscillators[3].type).toBe("sine");
    expect(oscillators[3].frequency.exponentialRampToValueAtTime).toHaveBeenCalled();
  });
  test("resumes suspended contexts; reports unsupported or blocked browsers", async () => {
    const { player, context } = setup(DEFAULT_SOUND_SETTINGS, "suspended");
    expect((await player.play("click")).ok).toBe(true);
    expect(context.resume).toHaveBeenCalledTimes(1);
    expect(await createSoundPlayer({ createContext: () => null }).play("click")).toEqual({ ok: false, reason: "unsupported" });
    const blocked = setup(DEFAULT_SOUND_SETTINGS, "suspended");
    blocked.context.resume.mockRejectedValue(new Error("blocked"));
    expect(await blocked.player.play("click")).toEqual({ ok: false, reason: "blocked" });
  });
  test("mute cancels a sound waiting for audio permission", async () => {
    const { player, context, oscillators } = setup(DEFAULT_SOUND_SETTINGS, "suspended");
    let resume;
    context.resume.mockImplementation(() => new Promise(resolve => { resume = () => { context.state = "running"; resolve(); }; }));
    const pending = player.play("badge");
    player.applySettings({ ...DEFAULT_SOUND_SETTINGS, enabled: false });
    resume();
    expect(await pending).toEqual({ ok: false, reason: "cancelled" });
    expect(oscillators).toHaveLength(0);
  });
  test("new previews replace old previews and cleanup all audio nodes", async () => {
    const { player, nodes, oscillators } = setup();
    await player.play("levelup", { preview: true });
    const old = [...oscillators];
    await player.play("badge", { preview: true });
    old.forEach(oscillator => expect(oscillator.stop).toHaveBeenCalledTimes(2));
    jest.runOnlyPendingTimers();
    nodes.forEach(node => expect(node.disconnect).toHaveBeenCalledTimes(1));
  });
  test("limits overlapping actions, adjusts live volume and stops on style change", async () => {
    const { player, gains, oscillators, nodes } = setup();
    player.applySettings(DEFAULT_SOUND_SETTINGS);
    for (let index = 0; index < 5; index++) await player.play("success");
    expect(oscillators[0].stop).toHaveBeenCalledTimes(2);
    player.applySettings({ ...DEFAULT_SOUND_SETTINGS, volume: 80 });
    expect(gains[4].gain.setTargetAtTime).toHaveBeenCalledWith(soundVolumeToGain(80), 10, .015);
    player.applySettings({ ...DEFAULT_SOUND_SETTINGS, style: "racing" });
    jest.runOnlyPendingTimers();
    nodes.forEach(node => expect(node.disconnect).toHaveBeenCalledTimes(1));
  });
  test("debounces clicks and cleans partial playback if scheduling fails", async () => {
    const { player, context, nodes } = setup();
    expect((await player.play("click")).ok).toBe(true);
    expect(await player.play("click")).toEqual({ ok: false, reason: "throttled" });
    context.createOscillator.mockImplementationOnce(() => { throw new Error("audio failed"); });
    expect(await player.play("success")).toEqual({ ok: false, reason: "blocked" });
    jest.runOnlyPendingTimers();
    nodes.forEach(node => expect(node.disconnect).toHaveBeenCalledTimes(1));
  });
});
