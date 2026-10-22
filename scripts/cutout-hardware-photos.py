"""Deterministic matting of catalogue packshots, without generative AI.

Requires Pillow, NumPy and OpenCV. Originals remain untouched. The manifest
retains their paths and records that the displayed photo has been cut out.
Run with --ids ID ... for a review batch, or without it for all opaque photos.
Lifestyle photos require a reviewed polygon in hardware-photo-masks.json.
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCAL_TOOLS = ROOT / '.account-backups/image-tools'
if LOCAL_TOOLS.exists():
    sys.path.insert(0, str(LOCAL_TOOLS))
import cv2
import numpy as np
from PIL import Image, ImageDraw


def packshot_mask(rgb, threshold=225, keep_components=False):
    """Remove only near-white pixels connected to the canvas border.

    White areas enclosed by the device outline stay opaque. Keep the largest
    connected subject so catalogue captions and specks do not become cutouts.
    """
    near_white = (rgb.min(axis=2) >= threshold).astype(np.uint8)
    _, labels = cv2.connectedComponents(near_white, connectivity=8)
    border = np.unique(np.concatenate((labels[0], labels[-1], labels[:, 0], labels[:, -1])))
    background = np.isin(labels, border[border != 0])
    subject = (~background).astype(np.uint8)
    count, components, stats, _ = cv2.connectedComponentsWithStats(subject, connectivity=8)
    if count < 2:
        raise ValueError('No subject found')
    selected = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    if keep_components:
        # Paired Joy-Con and product views must retain both separate devices.
        significant = np.where(stats[:, cv2.CC_STAT_AREA] >= max(20, stats[selected, cv2.CC_STAT_AREA] * .025))[0]
        mask = np.isin(components, significant[significant != 0]).astype(np.uint8) * 255
    else:
        mask = (components == selected).astype(np.uint8) * 255
    # Classical graph cut separates pale studio shadows from the actual shell.
    # Interior seeds also protect white plastic from being mistaken for the set.
    interior = cv2.erode(mask, np.ones((15, 15), np.uint8))
    exterior = cv2.dilate(mask, np.ones((9, 9), np.uint8)) == 0
    graph = np.full(mask.shape, cv2.GC_PR_BGD, np.uint8)
    graph[mask > 0] = cv2.GC_PR_FGD
    graph[interior > 0] = cv2.GC_FGD
    graph[exterior] = cv2.GC_BGD
    cv2.setRNGSeed(0)
    cv2.grabCut(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), graph, None,
                np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64),
                5, cv2.GC_INIT_WITH_MASK)
    return np.where((graph == cv2.GC_FGD) | (graph == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)


def cutout(source, config=None):
    original = Image.open(source).convert('RGBA')
    config = config or {}
    if config.get('crop'):
        original = original.crop(tuple(config['crop']))
    if config.get('preserveAlpha'):
        # Reviewed crops of native transparent carousel images keep their original edges.
        image = original.crop(original.getbbox())
        margin = max(8, round(max(image.size) * .05))
        canvas = Image.new('RGBA', (image.width + margin * 2, image.height + margin * 2))
        canvas.paste(image, (margin, margin))
        return canvas
    if config.get('nativeAlphaSubject'):
        # Some official transparent assets also contain a detached game logo.
        # Keep the largest alpha-connected object, preserving the native edges.
        rgba = np.array(original)
        _, labels, stats, _ = cv2.connectedComponentsWithStats((rgba[:, :, 3] > 0).astype(np.uint8), connectivity=8)
        selected = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        rgba[labels != selected, 3] = 0
        image = Image.fromarray(rgba)
        image = image.crop(image.getbbox())
        canvas = Image.new('RGBA', (image.width + 16, image.height + 16))
        canvas.paste(image, (8, 8))
        return canvas
    rgb = np.array(original)[:, :, :3]
    polygon = config.get('polygon')
    if polygon:
        mask_image = Image.new('L', original.size)
        ImageDraw.Draw(mask_image).polygon([tuple(point) for point in polygon], fill=255)
        mask = np.array(mask_image)
    else:
        mask = packshot_mask(rgb, config.get('threshold', 225), config.get('keepComponents', False))
    if config.get('clearFloor'):
        floor = config['clearFloor']
        yy = np.arange(mask.shape[0])[:, None]
        mask[(yy >= round(mask.shape[0] * floor['start'])) & (rgb.min(axis=2) > floor['threshold'])] = 0
    # Subpixel coverage at the boundary only; the device interior is unchanged.
    alpha = cv2.GaussianBlur(mask, (3, 3), .45).astype(np.float32) / 255
    if not polygon:
        edge = (alpha > 0) & (alpha < 1)
        clean = rgb.astype(np.float32)
        clean[edge] = (clean[edge] - (1 - alpha[edge, None]) * 255) / alpha[edge, None]
        rgb = np.clip(clean, 0, 255).astype(np.uint8)
    rgba = np.dstack((rgb, np.rint(alpha * 255).astype(np.uint8)))
    image = Image.fromarray(rgba)
    bounds = image.getbbox()
    if not bounds:
        raise ValueError('Empty cutout')
    image = image.crop(bounds)
    margin = max(8, round(max(image.size) * .06))
    canvas = Image.new('RGBA', (image.width + margin * 2, image.height + margin * 2))
    canvas.paste(image, (margin, margin))
    return canvas


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--ids', nargs='+')
    args = parser.parse_args()
    manifest = ROOT / 'src/data/hardware/editionPhotos.json'
    photos = json.loads(manifest.read_text(encoding='utf8'))
    masks_path = ROOT / 'scripts/hardware-photo-masks.json'
    masks = json.loads(masks_path.read_text(encoding='utf8')) if masks_path.exists() else {}
    output = ROOT / 'public/images/hardware/editions/cutouts'
    output.mkdir(exist_ok=True)
    skipped = []
    for photo in photos:
        if args.ids and photo['id'] not in args.ids:
            continue
        source_path = photo.get('originalImage', photo['image'])
        source = ROOT / 'public' / source_path.lstrip('/')
        original = Image.open(source).convert('RGBA')
        if original.getextrema()[3][0] < 255 and not photo.get('originalImage'):
            continue
        rgb = np.array(original)[:, :, :3]
        corners = rgb[[0, 0, -1, -1], [0, -1, 0, -1]]
        config = dict(masks.get(photo['id'], {}))
        if not config.get('polygon') and photo['versionIds'] == ['dualsense']:
            config['clearFloor'] = {'start': .75, 'threshold': 200}
        if not config.get('polygon') and photo['versionIds'] == ['xbox-series-controller']:
            config['clearFloor'] = {'start': .85, 'threshold': 200}
        if not config.get('polygon') and not config.get('nativeAlphaSubject') and np.min(corners) < 235:
            skipped.append(photo['id'])
            continue
        image = cutout(source, config)
        file = output / (photo['id'] + '.webp')
        image.save(file, 'WEBP', lossless=True, exact=True)
        photo['originalImage'] = source_path
        photo['image'] = '/images/hardware/editions/cutouts/' + file.name
        photo['processing'] = 'Vue de face recadrée, sans génération IA' if config.get('preserveAlpha') else 'Fond retiré par détourage classique, sans génération IA'
        photo['processingKind'] = 'crop' if config.get('preserveAlpha') else 'cutout'
        print(photo['id'], original.size, '->', image.size)
    manifest.write_text(json.dumps(photos, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    if skipped:
        print('Reviewed masks required:', ', '.join(skipped))


if __name__ == '__main__':
    main()
