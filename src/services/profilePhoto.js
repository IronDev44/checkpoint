export async function prepareProfilePhoto(file) {
  if (!file?.type?.startsWith("image/") || file.type === "image/svg+xml") throw new Error("Choisis une photo au format JPG, PNG ou WebP.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Cette photo est trop volumineuse. Choisis une image de moins de 20 Mo.");
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Impossible de lire cette photo."));
    reader.readAsDataURL(file);
  });
  const image = await new Promise((resolve, reject) => {
    const picture = new Image();
    picture.onload = () => resolve(picture);
    picture.onerror = () => reject(new Error("Impossible d’ouvrir cette image. Essaie une version JPG ou PNG."));
    picture.src = source;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 320; canvas.height = 320;
  const context = canvas.getContext("2d");
  if (!context || !image.width || !image.height) throw new Error("Impossible de préparer cette photo.");
  const side = Math.min(image.width, image.height);
  context.fillStyle = "#151b24";
  context.fillRect(0, 0, 320, 320);
  context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 320, 320);
  return canvas.toDataURL("image/jpeg", .82);
}
