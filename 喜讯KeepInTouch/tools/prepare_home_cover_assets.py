from argparse import ArgumentParser
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def polygon_mask(size, points):
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    return np.asarray(mask, dtype=np.uint8)


def extract_envelope(source):
    image = Image.open(source).convert("RGB")
    rgb = np.asarray(image, dtype=np.uint8)
    height, width = rgb.shape[:2]
    warmth = rgb[:, :, 0].astype(np.int16) - rgb[:, :, 2].astype(np.int16)

    alpha = np.clip((warmth - 4) * 24, 0, 255).astype(np.uint8)
    alpha = np.asarray(
        Image.fromarray(alpha).filter(ImageFilter.MaxFilter(3)), dtype=np.uint8
    )

    # The center is an open area. Require a stronger warm-color signal there
    # so the baked checkerboard disappears while the floral stems survive.
    center_opening = polygon_mask(
        (width, height),
        [(210, 418), (635, 418), (616, 554), (422, 664), (229, 554)],
    )
    center_detail = np.clip((warmth - 9) * 28, 0, 255).astype(np.uint8)
    center_detail = np.asarray(
        Image.fromarray(center_detail).filter(ImageFilter.MaxFilter(3)),
        dtype=np.uint8,
    )
    alpha = np.where(center_opening > 0, center_detail, alpha).astype(np.uint8)

    # Restore the continuous paper pieces independently of their texture.
    rear_flap = polygon_mask(
        (width, height), [(422, 238), (610, 432), (233, 432)]
    )
    lower_envelope = polygon_mask(
        (width, height),
        [(165, 500), (422, 680), (680, 500), (680, 835), (165, 835)],
    )
    alpha = np.maximum(alpha, rear_flap)
    alpha = np.maximum(alpha, lower_envelope)

    # Remove isolated compression tint outside the physical envelope area.
    physical_zone = polygon_mask(
        (width, height),
        [(130, 168), (715, 168), (715, 862), (130, 862)],
    )
    alpha = np.minimum(alpha, physical_zone)
    alpha = np.asarray(
        Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.45)),
        dtype=np.uint8,
    )

    # Low-alpha pixels otherwise retain the checkerboard's gray tint. Blend
    # those pixels toward the lace's warm thread color while preserving opaque
    # paper and embroidery texture.
    warm_thread = np.array([239, 230, 216], dtype=np.float32)
    texture_weight = np.clip(alpha.astype(np.float32) / 190.0, 0.0, 1.0)[:, :, None]
    cleaned_rgb = (
        rgb.astype(np.float32) * texture_weight
        + warm_thread[None, None, :] * (1.0 - texture_weight)
    )
    cleaned_rgb = np.clip(cleaned_rgb, 0, 255).astype(np.uint8)

    rgba = np.dstack((cleaned_rgb, alpha))
    return Image.fromarray(rgba, "RGBA").crop((125, 160, 720, 865))


def make_preview(background, envelope):
    canvas = background.convert("RGB").resize((506, 1024), Image.Resampling.LANCZOS)
    subject_width = round(canvas.width * 0.58)
    subject_height = round(envelope.height * subject_width / envelope.width)
    subject = envelope.resize((subject_width, subject_height), Image.Resampling.LANCZOS)
    x = (canvas.width - subject.width) // 2
    y = (canvas.height - subject.height) // 2
    canvas.paste(subject, (x, y), subject)
    return canvas


def main():
    parser = ArgumentParser()
    parser.add_argument("background_source", type=Path)
    parser.add_argument("envelope_source", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("preview", type=Path)
    args = parser.parse_args()

    args.output_dir.mkdir(parents=True, exist_ok=True)
    args.preview.parent.mkdir(parents=True, exist_ok=True)

    background = Image.open(args.background_source).convert("RGB")
    background.save(args.output_dir / "cover-background.png")

    envelope = extract_envelope(args.envelope_source)
    envelope.save(args.output_dir / "cover-envelope.png")
    make_preview(background, envelope).save(args.preview)


if __name__ == "__main__":
    main()
