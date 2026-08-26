from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


SOURCE = Path(
    "/Users/huming/Library/Containers/com.tencent.xinWeChat/Data/Documents/"
    "xwechat_files/www773556327_f2de/temp/RWTemp/2026-08/"
    "d79c330ea76929eafab3b9a352793787/"
    "a44857d1786c852091768835a746a7fb.jpg"
)
OUTPUT_DIR = Path("extracted-assets")


def polygon_mask(size, points):
    from PIL import ImageDraw

    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    return np.asarray(mask, dtype=np.uint8)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    screenshot = Image.open(SOURCE).convert("RGB")
    artwork = screenshot.crop((208, 800, 972, 1760))
    artwork.save(OUTPUT_DIR / "original-artwork.png")

    rgb = np.asarray(artwork, dtype=np.uint8)
    height, width = rgb.shape[:2]
    maxc = rgb.max(axis=2).astype(np.int16)
    minc = rgb.min(axis=2).astype(np.int16)
    luminance = (
        0.2126 * rgb[:, :, 0] + 0.7152 * rgb[:, :, 1] + 0.0722 * rgb[:, :, 2]
    )
    chroma = maxc - minc

    # The solid paper areas are filled geometrically. The lace border is
    # selected photometrically so its scalloped edge and open holes survive.
    solid = polygon_mask(
        (width, height),
        [(164, 220), (600, 220), (612, 430), (637, 454), (637, 780),
         (126, 780), (126, 454), (151, 430)],
    )
    lace_zone = polygon_mask(
        (width, height),
        [(124, 170), (642, 170), (642, 456), (118, 456)],
    )
    lace_pixels = ((luminance > 138) & (chroma < 72)).astype(np.uint8) * 255
    lace = np.minimum(lace_zone, lace_pixels)
    lace = np.asarray(
        Image.fromarray(lace).filter(ImageFilter.MaxFilter(3)), dtype=np.uint8
    )
    alpha = np.maximum(solid, lace)

    # Recover delicate anti-aliased edge pixels without making the cutout haloed.
    alpha = np.asarray(
        Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.7)), dtype=np.uint8
    )
    cutout = np.dstack((rgb, alpha))
    subject_bbox = (112, 160, 650, 790)
    Image.fromarray(cutout, "RGBA").crop(subject_bbox).save(
        OUTPUT_DIR / "envelope-transparent.png"
    )

    # Reconstruct the deliberately motion-blurred backdrop row by row from the
    # untouched material on both sides. The broad blur matches the source style.
    background = rgb.astype(np.float32).copy()
    sample_left = (18, 92)
    sample_right = (672, 746)
    xmix = np.linspace(0.0, 1.0, width, dtype=np.float32)
    xmix = xmix[None, :, None]
    left_colors = rgb[:, sample_left[0]:sample_left[1]].mean(axis=1)[:, None, :]
    right_colors = rgb[:, sample_right[0]:sample_right[1]].mean(axis=1)[:, None, :]
    interpolated = left_colors * (1.0 - xmix) + right_colors * xmix

    rng = np.random.default_rng(44857)
    noise_small = Image.fromarray(
        rng.integers(0, 256, size=(48, 48), dtype=np.uint8)
    ).resize((width, height), Image.Resampling.BICUBIC).filter(
        ImageFilter.GaussianBlur(10)
    )
    noise = np.asarray(noise_small, dtype=np.float32)
    noise = (noise - noise.mean())[:, :, None] * 0.16
    interpolated += noise

    def smoothstep(values):
        values = np.clip(values, 0.0, 1.0)
        return values * values * (3.0 - 2.0 * values)

    xs = np.arange(width, dtype=np.float32)
    ys = np.arange(height, dtype=np.float32)
    x_blend = np.minimum(
        smoothstep(xs / 138.0), smoothstep((width - 1 - xs) / 138.0)
    )
    y_blend = np.minimum(
        smoothstep((ys - 112.0) / 58.0), smoothstep((866.0 - ys) / 76.0)
    )
    blend = (y_blend[:, None] * x_blend[None, :])[:, :, None]
    background = background * (1.0 - blend) + interpolated * blend
    background = Image.fromarray(np.clip(background, 0, 255).astype(np.uint8))
    background = background.filter(ImageFilter.GaussianBlur(2.2))
    background.save(OUTPUT_DIR / "background-only.png")


if __name__ == "__main__":
    main()
