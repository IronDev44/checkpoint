const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export async function loadProfilePhoto(input, { forEditing = true } = {}) {
  let source;
  if (typeof input === "string") {
    if (!input || /^(?:javascript|blob):/i.test(input) || (forEditing && /^data:image\/svg/i.test(input))) throw new Error("Choisis une photo au format JPG, PNG ou WebP.");
    source = input;
  } else {
    if (!input?.type?.startsWith("image/") || input.type === "image/svg+xml") throw new Error("Choisis une photo au format JPG, PNG ou WebP.");
    if (input.size > 20 * 1024 * 1024) throw new Error("Cette photo est trop volumineuse. Choisis une image de moins de 20 Mo.");
    source = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Impossible de lire cette photo."));
      reader.readAsDataURL(input);
    });
  }
  const image = await new Promise((resolve, reject) => {
    const picture = new Image();
    if (forEditing && !source.startsWith("data:")) picture.crossOrigin = "anonymous";
    picture.onload = () => resolve(picture);
    picture.onerror = () => reject(new Error("Impossible d’ouvrir cette image. Essaie une version JPG ou PNG."));
    picture.src = source;
  });
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) throw new Error("Impossible de préparer cette photo.");
  return { image, source, width, height };
}

// The preview and the exported JPEG use the same source coordinates.
export function getPhotoViewport(width, height, crop = {}, fit = "cover") {
  const w = Math.max(1, finite(width, 1));
  const h = Math.max(1, finite(height, 1));
  const zoom = clamp(finite(crop.zoom, 1), 1, 4);
  const side = (fit === "contain" ? Math.max(w, h) : Math.min(w, h)) / zoom;
  const marginX = Math.min(.5, side / (2 * w));
  const marginY = Math.min(.5, side / (2 * h));
  const centerX = clamp(finite(crop.centerX, .5), marginX, 1 - marginX);
  const centerY = clamp(finite(crop.centerY, .5), marginY, 1 - marginY);
  return { zoom, centerX, centerY, side, x: centerX * w - side / 2, y: centerY * h - side / 2 };
}

export function cropProfilePhoto(photo, crop = {}) {
  if (!photo?.image || !photo.width || !photo.height) throw new Error("Impossible de préparer cette photo.");
  const { x, y, side } = getPhotoViewport(photo.width, photo.height, crop);
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Impossible de préparer cette photo.");
  context.fillStyle = "#151b24";
  context.fillRect(0, 0, 512, 512);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(photo.image, x, y, side, side, 0, 0, 512, 512);
  try { return canvas.toDataURL("image/jpeg", .85); }
  catch { throw new Error("Impossible d’enregistrer cette image. Essaie de choisir la photo d’origine."); }
}

export async function prepareProfilePhoto(file, crop = {}) {
  return cropProfilePhoto(await loadProfilePhoto(file), crop);
}
