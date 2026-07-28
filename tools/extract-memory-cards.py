from pathlib import Path
import subprocess
from PIL import Image

SOURCE = Path(r"C:\Users\isabe\OneDrive\Webshop\Producten\Leestasje\leestasjes AVI M3-E5")
OUTPUT = Path(r"C:\GitHub\leestasjes\assets\memory")
TEMP = Path(r"C:\GitHub\leestasjes\tmp\pdfs\memory-cards")
PDFTOPPM = Path(
    r"C:\Users\isabe\.cache\codex-runtimes\codex-primary-runtime"
    r"\dependencies\native\poppler\Library\bin\pdftoppm.exe"
)

SETS = [
    ("noor-bal", "Leestasje - AVI M3/Noor_en_de_bal/Memoryspel - AVi M3 Noor en de bal.pdf",
     ["tuin", "bal", "hond", "gras", "geel", "boom", "zoen", "rolt", "blij"]),
    ("jef-poes", "Leestasje - AVI M3/Jef_en_de_poes/Memoryspel - AVi M3 Jef en de poes.pdf",
     ["huis", "vis", "poes", "moe", "eet", "deur", "kijkt"]),
    ("jef-bos", "Leestasje - AVI E3/Jef_en_de_klas_in_het_bos/Memoryspel - AVi E3 Jef en de klas in het bos.pdf",
     ["eekhoorn", "blaadjes", "mos", "bos", "konijn", "nest", "struik", "fluiten", "tak"]),
    ("nore-schatkaart", "Leestasje - AVI E3/Nore_en _de_schatkaart/Memoryspel - AVi E3 Nore en de schatkaart.pdf",
     ["kaart", "briefje", "haag", "bank", "doosje", "muntje", "steentjes", "grond", "glimt"]),
    ("jef-speurtocht", "Leestasje - AVI M4/Jef_en_de_klas_op_bosspeurtocht/Memoryspel - AVI M4 Jef en de klas op bosspeurtocht-1.pdf",
     ["speurtocht", "symbool", "kastanje", "paddenstoel", "boomstronk", "vogelveertje", "mos", "aarde", "gouden ster"]),
    ("nore-sleutel", "Leestasje - AVI M4/Nore_en_de_geheime_sleutel/Memoryspel - AVI M4 Nore en de geheime sleutel.pdf",
     ["hangslotje", "roestig", "snuffelt", "ketting", "sleutel", "tuinhuisje", "spinnenweb", "knikker", "hangertje"]),
    ("jef-brandweer", "Leestasje - AVI E4/Jef_en_de_klas_bij_de_brandweer/Memoryspel - AVI E4 Jef en de klas bij de brandweer.pdf",
     ["brandweerwagen", "alarm", "waterslang", "kazerne", "sirene", "brandweerhelm", "uitrusting", "brandweerman", "oefening"]),
    ("nore-molen", "Leestasje - AVI E4/Nore_en_het_geheim_van_de_molen/Memoryspel - AVI E4 Nore en het geheim van de molen.pdf",
     ["molen", "hangertje", "tuinhuisje", "tandwielen", "fotoalbum", "meel", "ketting", "handgeschreven briefje", "houten wand"]),
    ("jef-zee", "Leestasje - AVI M5/Jef_en_de_klas_aan_zee/Memoryspel - AVI M5 Jef en de klas aan zee.pdf",
     ["zee", "strand", "vloedlijn", "krab", "rots", "glazen fles", "opgerold briefje", "golven", "zeewier"]),
    ("nore-tijdscapsule", "Leestasje - AVI M5/Nore_en_de_tijdscapsule/Memoryspel - AVI M5 Nore en de tijdscapsule.pdf",
     ["fotoalbum", "envelop", "dagboek", "leren bandje", "metalen doos", "muntje", "molen", "was", "plakband"]),
    ("jef-bosklassen", "Leestasje - AVI E5/Jef_en_de_klas_op_bosklassen/Memoryspel - AVI E5 Jef en de klas op bosklassen.pdf",
     ["slaapzaal", "stapelbed", "kampvuur", "pootafdruk", "marshmallow", "touwbrug", "team", "zaklamp", "dennenappel"]),
    ("nore-verhaal", "Leestasje - AVI E5/Nore_en_het_verhaal_dat_doorgaat/Memoryspel - AVI E5 Nore en het verhaal dat doorgaat.pdf",
     ["fotoalbum", "zilveren ketting", "familieboek", "tijdscapsule", "plastic zakje", "stoffig", "molen", "zebra-hangertje", "houten kistje"]),
]


def safe_name(word):
    return (
        word.lower()
        .replace(" ", "-")
        .replace("ë", "e")
        .replace("é", "e")
    )


def render_page(pdf, page, prefix):
    subprocess.run(
        [str(PDFTOPPM), "-png", "-r", "140", "-f", str(page), "-l", str(page),
         str(pdf), str(prefix)],
        check=True,
    )
    rendered = prefix.parent / f"{prefix.name}-{page}.png"
    if not rendered.exists():
        rendered = prefix.parent / f"{prefix.name}-1.png"
    return rendered


def card_box(width, height, index):
    columns = [(0.026, 0.337), (0.346, 0.655), (0.664, 0.973)]
    rows = [(0.088, 0.305), (0.334, 0.551), (0.579, 0.795)]
    col, row = index % 3, index // 3
    x1, x2 = columns[col]
    y1, y2 = rows[row]
    padding_x = round(width * 0.004)
    padding_y = round(height * 0.004)
    return (
        max(0, round(width * x1) - padding_x),
        max(0, round(height * y1) - padding_y),
        min(width, round(width * x2) + padding_x),
        min(height, round(height * y2) + padding_y),
    )


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    TEMP.mkdir(parents=True, exist_ok=True)
    image_cells = [(1, 1), (1, 3), (1, 5), (1, 7),
                   (3, 0), (3, 2), (3, 4), (3, 6), (3, 8)]

    for slug, relative_pdf, words in SETS:
        pdf = SOURCE / Path(relative_pdf)
        target = OUTPUT / slug
        target.mkdir(parents=True, exist_ok=True)
        renders = {}
        for page in {page for page, _ in image_cells[:len(words)]}:
            renders[page] = render_page(pdf, page, TEMP / f"{slug}-p{page}")

        for word, (page, cell) in zip(words, image_cells):
            with Image.open(renders[page]) as image:
                crop = image.crop(card_box(image.width, image.height, cell)).convert("RGB")
                crop.thumbnail((520, 520), Image.Resampling.LANCZOS)
                crop.save(target / f"{safe_name(word)}.webp", "WEBP", quality=88, method=6)

    print(f"{sum(len(words) for _, _, words in SETS)} memorybeelden gemaakt.")


if __name__ == "__main__":
    main()
