"""Remove o fundo de packshots e salva PNG quadrado transparente em public/products/.

Uso:  python scripts/process_photos.py <pasta_de_entrada> [margem=0.07]
Cada arquivo vira <nome>.png (1000x1000). Renomeie na entrada como o produto/ângulo
desejado, ex.: under-labz-dimethylex-2.jpg -> public/products/under-labz-dimethylex-2.png
"""
import sys
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

SIZE = 1000
OUT = Path(__file__).resolve().parent.parent / "public" / "products"


def square(im: Image.Image, margin: float) -> Image.Image:
    bbox = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if bbox:
        im = im.crop(bbox)
    inner = int(SIZE * (1 - 2 * margin))
    im.thumbnail((inner, inner), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((SIZE - im.width) // 2, (SIZE - im.height) // 2))
    return canvas


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    margin = float(sys.argv[2]) if len(sys.argv) > 2 else 0.07
    session = new_session("u2net")
    for f in sorted(p for p in src.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}):
        im = Image.open(f).convert("RGBA")
        out = square(remove(im, session=session), margin)
        target = OUT / (f.stem + ".png")
        out.save(target, optimize=True)
        print("salvo", target.name)


if __name__ == "__main__":
    main()
