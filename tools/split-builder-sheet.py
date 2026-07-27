from argparse import ArgumentParser
from pathlib import Path

from PIL import Image, ImageChops


parser = ArgumentParser()
parser.add_argument("--input", required=True)
parser.add_argument("--source-name", required=True)
parser.add_argument("--targets", required=True)
parser.add_argument("--cols", type=int, default=0)
args = parser.parse_args()

root = Path(__file__).resolve().parents[1]
image = Image.open(args.input).convert("RGBA")
targets = [target.strip() for target in args.targets.split(",") if target.strip()]
out_dir = root / "assets" / "builder-cutouts" / args.source_name
out_dir.mkdir(parents=True, exist_ok=True)

if args.cols:
    rows = (len(targets) + args.cols - 1) // args.cols
    cell_w = image.width / args.cols
    cell_h = image.height / rows
    boxes = []
    masks = [None] * len(targets)
    for index in range(len(targets)):
        col = index % args.cols
        row = index // args.cols
        boxes.append((
            round(col * cell_w),
            round(row * cell_h),
            round((col + 1) * cell_w),
            round((row + 1) * cell_h),
        ))
else:
    from collections import deque

    scale = 4
    alpha = image.getchannel("A")
    small = alpha.resize(
        (max(1, image.width // scale), max(1, image.height // scale)),
        Image.Resampling.NEAREST,
    )
    pixels = small.load()
    seen = set()
    components = []
    label_image = Image.new("L", small.size, 0)
    label_pixels = label_image.load()
    label_id = 0
    for y in range(small.height):
        for x in range(small.width):
            if (x, y) in seen or pixels[x, y] <= 24:
                continue
            queue = deque([(x, y)])
            seen.add((x, y))
            label_id += 1
            label_pixels[x, y] = min(label_id, 255)
            min_x = max_x = x
            min_y = max_y = y
            area = 0
            while queue:
                px, py = queue.popleft()
                area += 1
                min_x, max_x = min(min_x, px), max(max_x, px)
                min_y, max_y = min(min_y, py), max(max_y, py)
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if 0 <= nx < small.width and 0 <= ny < small.height and (nx, ny) not in seen:
                        if pixels[nx, ny] > 24:
                            seen.add((nx, ny))
                            label_pixels[nx, ny] = min(label_id, 255)
                            queue.append((nx, ny))
            if area > 80:
                components.append((area, min_x, min_y, max_x + 1, max_y + 1, min(label_id, 255)))
    components = sorted(components, reverse=True)[:len(targets)]
    if len(components) != len(targets):
        raise SystemExit(f"Verwacht {len(targets)} losse figuren, maar vond {len(components)} hoofdvormen.")
    selected = sorted(components, key=lambda item: item[1])
    boxes = []
    masks = []
    for _, x1, y1, x2, y2, component_id in selected:
        box = (x1 * scale, y1 * scale, min(image.width, x2 * scale), min(image.height, y2 * scale))
        boxes.append(box)
        component_mask = label_image.point(lambda value, wanted=component_id: 255 if value == wanted else 0)
        component_mask = component_mask.resize(image.size, Image.Resampling.NEAREST).crop(box)
        masks.append(component_mask)

for target, box, component_mask in zip(targets, boxes, masks):
    cell = image.crop(box)
    if component_mask is not None:
        cell.putalpha(ImageChops.multiply(cell.getchannel("A"), component_mask))
    alpha_box = cell.getchannel("A").getbbox()
    if alpha_box:
        cell = cell.crop(alpha_box)
    padding = max(8, round(max(cell.size) * 0.04))
    padded = Image.new("RGBA", (cell.width + 2 * padding, cell.height + 2 * padding))
    padded.alpha_composite(cell, (padding, padding))
    padded.save(out_dir / f"{target}.png", optimize=True)

print(f"{len(targets)} transparante beeldstukken gemaakt in {out_dir}")
