from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets" / "visuals"

TARGETS = {
    "cuteLogoClearBackground.png": 1200,
    "drive-download-20260424T030625Z-3-001/JH_Icons_Orange.png": 256,
    "drive-download-20260424T030637Z-3-001/blobBlue.png": 900,
    "drive-download-20260424T030637Z-3-001/blobOrange.png": 900,
    "drive-download-20260424T030637Z-3-001/cubesBlue.png": 800,
    "drive-download-20260424T030637Z-3-001/cubesOrange.png": 800,
    "drive-download-20260424T030637Z-3-001/cubesWhite.png": 800,
    "drive-download-20260424T030637Z-3-001/squiggleBlue.png": 900,
    "drive-download-20260424T030637Z-3-001/squiggleGradient.png": 900,
    "drive-download-20260424T030637Z-3-001/squiggleOrange.png": 900,
    "drive-download-20260424T030637Z-3-001/squiggle2Blue.png": 900,
    "drive-download-20260424T030637Z-3-001/squiggle2Gradient.png": 900,
    "drive-download-20260424T030637Z-3-001/squiggle2Orange.png": 900,
    "drive-download-20260424T030637Z-3-001/squiggle2White.png": 900,
    "drive-download-20260424T030657Z-3-001/pawprintBlack.png": 256,
    "drive-download-20260424T030657Z-3-001/pawprintGradient.png": 512,
    "drive-download-20260424T030657Z-3-001/pawprintWhite.png": 256,
}

for relative_path, max_dimension in TARGETS.items():
    source = ASSETS / relative_path
    if not source.exists():
        continue
    destination = source.with_suffix(".webp")
    with Image.open(source) as image:
        image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=82, method=6, exact=True)
    print(f"{source.relative_to(ROOT)} -> {destination.relative_to(ROOT)} ({destination.stat().st_size} bytes)")
