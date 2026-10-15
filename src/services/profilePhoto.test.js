import { getPhotoViewport, prepareProfilePhoto } from "./profilePhoto";

test("rejects unsupported and oversized uploads before decoding", async () => {
  await expect(prepareProfilePhoto({ type: "text/plain", size: 3 })).rejects.toThrow("JPG");
  await expect(prepareProfilePhoto({ type: "image/jpeg", size: 21 * 1024 * 1024 })).rejects.toThrow("20 Mo");
});

test("a wide photo is cropped around its center into a compact square JPEG", async () => {
  const Reader = global.FileReader, Picture = global.Image;
  global.FileReader = class { readAsDataURL() { this.result = "data:image/png;base64,source"; this.onload(); } };
  global.Image = class { constructor() { this.width = 800; this.height = 400; } set src(value) { this.onload(); } };
  const drawImage = jest.fn();
  const context = jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ fillRect: jest.fn(), drawImage });
  const encode = jest.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/jpeg;base64,square");
  try {
    await expect(prepareProfilePhoto({ type: "image/png", size: 100 })).resolves.toBe("data:image/jpeg;base64,square");
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 200, 0, 400, 400, 0, 0, 512, 512);
    expect(encode).toHaveBeenCalledWith("image/jpeg", expect.any(Number));
  } finally { context.mockRestore(); encode.mockRestore(); global.FileReader = Reader; global.Image = Picture; }
});

test("chosen zoom and position match the pixels exported to the JPEG", async () => {
  const Reader = global.FileReader, Picture = global.Image;
  global.FileReader = class { readAsDataURL() { this.result = "data:image/png;base64,source"; this.onload(); } };
  global.Image = class { constructor() { this.width = 800; this.height = 400; } set src(value) { this.onload(); } };
  const drawImage = jest.fn();
  const context = jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ fillRect: jest.fn(), drawImage });
  const encode = jest.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/jpeg;base64,cropped");
  try {
    await prepareProfilePhoto({ type: "image/png", size: 100 }, { zoom: 2, centerX: .75, centerY: .5 });
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 500, 100, 200, 200, 0, 0, 512, 512);
  } finally { context.mockRestore(); encode.mockRestore(); global.FileReader = Reader; global.Image = Picture; }
});

test("crops stay inside portrait, landscape and square photos at every zoom", () => {
  for (const [width, height] of [[800, 400], [400, 800], [500, 500]]) {
    for (const zoom of [0, 1, 2, 4, 100]) {
      for (const center of [-100, .5, 100]) {
        const crop = getPhotoViewport(width, height, { zoom, centerX: center, centerY: center });
        expect(crop.zoom).toBeGreaterThanOrEqual(1); expect(crop.zoom).toBeLessThanOrEqual(4);
        expect(crop.x).toBeGreaterThanOrEqual(0); expect(crop.y).toBeGreaterThanOrEqual(0);
        expect(crop.x + crop.side).toBeLessThanOrEqual(width); expect(crop.y + crop.side).toBeLessThanOrEqual(height);
      }
    }
  }
});

test("zooming in keeps the selected subject centered rather than moving it toward an edge", () => {
  const first = getPhotoViewport(800, 400, { zoom: 1, centerX: .7, centerY: .5 });
  const next = getPhotoViewport(800, 400, { zoom: 2, centerX: first.centerX, centerY: first.centerY });
  expect(first.x + first.side / 2).toBeCloseTo(next.x + next.side / 2);
});

test("the enlarged viewer initially fits the entire photo, while the editor fills the avatar", () => {
  expect(getPhotoViewport(800, 400, {}, "contain").side).toBe(800);
  expect(getPhotoViewport(800, 400).side).toBe(400);
});
