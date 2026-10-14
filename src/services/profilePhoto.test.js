import { prepareProfilePhoto } from "./profilePhoto";

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
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 200, 0, 400, 400, 0, 0, 320, 320);
    expect(encode).toHaveBeenCalledWith("image/jpeg", expect.any(Number));
  } finally { context.mockRestore(); encode.mockRestore(); global.FileReader = Reader; global.Image = Picture; }
});
