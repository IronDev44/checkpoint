import { getKartSceneBudget, projectKartRoad, paintKartRoad, paintKartSky } from "./kartScene";

test.each([[390,844],[844,390],[1366,900],[3840,2160]])("limits canvas memory at %s × %s, including high density screens", (width, height) => {
  const full = getKartSceneBudget(width, height, { dpr: 3 });
  const light = getKartSceneBudget(width, height, { dpr: 3, light: true });
  expect(width * height * full.pixelRatio ** 2).toBeLessThanOrEqual(1800001);
  expect(width * height * light.pixelRatio ** 2).toBeLessThanOrEqual(650001);
  expect(light.rows).toBeLessThan(full.rows);
  expect(light.fps).toBe(30);
  expect(full.fps).toBe(60);
  expect(light.items).toBe(false);
});

test("left and right bends mirror each other without changing road size or camera height", () => {
  const right = projectKartRoad(12, 390, 844, 20, 1);
  const left = projectKartRoad(12, 390, 844, 20, -1);
  expect(left.x + right.x).toBeCloseTo(390);
  expect(left.y).toBe(right.y);
  expect(left.half).toBe(right.half);
  const near = projectKartRoad(1, 390, 844);
  expect(near.half).toBeGreaterThan(right.half);
  expect(near.y).toBeGreaterThan(right.y);
});

test("the projected route remains finite and ordered through forward travel", () => {
  for (let distance = 0; distance < 100; distance += 3.7) {
    let lastY = Infinity;
    for (let z = .55; z < 65; z += .75) {
      const point = projectKartRoad(z, 320, 568, distance);
      for (const value of Object.values(point)) expect(Number.isFinite(value)).toBe(true);
      expect(point.y).toBeLessThanOrEqual(lastY);
      lastY = point.y;
    }
  }
});

test("calm mode keeps the road but removes decorative items and speed rays", () => {
  expect(getKartSceneBudget(390, 844, { effects: "calm" })).toMatchObject({ reduced: true, rows: 42, items: false, stars: 38 });
});

test("both renderers emit finite geometry in full and reduced mode", () => {
  const gradient = { addColorStop: jest.fn() };
  const ctx = new Proxy({}, { get(target, key) {
    if (!(key in target)) target[key] = jest.fn((...args) => {
      args.filter(value => typeof value === "number").forEach(value => expect(Number.isFinite(value)).toBe(true));
      return String(key).includes("Gradient") ? gradient : undefined;
    });
    return target[key];
  } });
  for (const light of [false, true]) {
    const budget = getKartSceneBudget(390, 844, { light });
    paintKartSky(ctx, 390, 844, budget);
    paintKartRoad(ctx, 390, 844, 12.7, .4, { budget, direction: -1, boost: true });
  }
  expect(ctx.fill).toHaveBeenCalled();
});
