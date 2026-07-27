from pathlib import Path
import re

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "builder-stickers"


def safe_name(value: str) -> str:
    return re.sub(r"[^a-z0-9_-]+", "-", value.lower()).strip("-")


def crop_stickers(image_path: str, tasks: list[tuple[str, float, float, float, float]]) -> None:
    source = ROOT / image_path
    image = Image.open(source).convert("RGB")
    width, height = image.size
    folder = OUT / safe_name(source.stem)
    folder.mkdir(parents=True, exist_ok=True)

    for target, x, y, w, h in tasks:
        left = max(0, round(width * x / 100))
        top = max(0, round(height * y / 100))
        right = min(width, round(width * (x + w) / 100))
        bottom = min(height, round(height * (y + h) / 100))
        crop = image.crop((left, top, right, bottom))
        crop.save(folder / f"{safe_name(target)}.webp", "WEBP", quality=92, method=6)


for html_path in ROOT.glob("spelletjes_*.html"):
    text = html_path.read_text(encoding="utf-8")
    config = re.search(
        r'window\.BONUS_MISSION=\{.*?image:"([^"]+)".*?tasks:\[(.*?)\]\};',
        text,
        re.S,
    )
    if not config:
        continue
    image_path, task_block = config.groups()
    tasks = [
        (target, float(x), float(y), float(w), float(h))
        for target, x, y, w, h in re.findall(
            r'\{target:"([^"]+)".*?x:([\d.]+),y:([\d.]+),w:([\d.]+),h:([\d.]+)\}',
            task_block,
        )
    ]
    crop_stickers(image_path, tasks)


crop_stickers(
    "assets/games/jef-poes-zoekplaat.webp",
    [
        ("boom", 0, 0, 24, 72),
        ("jef", 20, 12, 24, 62),
        ("vlinder", 42, 13, 8, 14),
        ("poes", 46, 40, 20, 34),
        ("deur", 65, 0, 24, 59),
        ("gieter", 81, 57, 18, 28),
    ],
)

print(f"Beeldstukken gemaakt in {OUT}")
