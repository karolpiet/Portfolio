"""
Krok 2: ładne mapy z rastrów (cieniowanie terenu, wysokości koron).

Uruchomienie:  python 02_mapy.py <folder_wyników>
Wymaga:        pip install numpy rasterio matplotlib
"""
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import rasterio

out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("wyniki")


def read(name):
    with rasterio.open(out / name) as r:
        return r.read(1, masked=True).filled(np.nan), r.res[0], r.bounds


def hillshade(z, res, azimuth=315, altitude=35, exag=3):
    """Cieniowanie: oświetlamy teren wirtualnym słońcem z północnego zachodu."""
    dy, dx = np.gradient(z * exag, res)
    slope = np.pi / 2 - np.arctan(np.hypot(dx, dy))
    aspect = np.arctan2(-dx, dy)
    az, alt = np.radians(360 - azimuth + 90), np.radians(altitude)
    return np.clip(np.sin(alt) * np.sin(slope)
                   + np.cos(alt) * np.cos(slope) * np.cos(az - aspect), 0, 1)


dtm, res, b = read("DTM.tif")
dsm, _, _ = read("DSM.tif")
chm, _, _ = read("CHM.tif")
ext = (b.left, b.right, b.bottom, b.top)

# Cieniowanie wielokierunkowe - widać więcej form terenu niż z jednego kierunku
hs_dtm = np.mean([hillshade(dtm, res, a) for a in (270, 315, 0, 45)], axis=0)
hs_dsm = hillshade(dsm, res, exag=1)

panels = [
    ("DTM - goły teren (cieniowanie x3)", hs_dtm, "gray", None),
    ("DSM - las z góry", hs_dsm, "gray", None),
    ("CHM - wysokość koron [m]", chm, "viridis", (0, 32)),
]
for title, arr, cmap, lim in panels:
    fig, ax = plt.subplots(figsize=(6, 11), dpi=150)
    if title.startswith("DTM"):
        # cieniowanie + kolor wysokości = mapa hipsometryczna
        ax.imshow(dtm, cmap="terrain", extent=ext, alpha=1)
        ax.imshow(hs_dtm, cmap="gray", extent=ext, alpha=0.6)
    else:
        im = ax.imshow(arr, cmap=cmap, extent=ext,
                       vmin=lim[0] if lim else None, vmax=lim[1] if lim else None)
        if lim:
            fig.colorbar(im, ax=ax, shrink=0.5, label="m")
    ax.set_title(title)
    ax.ticklabel_format(useOffset=False, style="plain")
    ax.tick_params(labelsize=6)
    fig.tight_layout()
    name = title.split(" ")[0]
    fig.savefig(out / f"mapa_{name}.png")
    plt.close(fig)
    print("zapisano", f"mapa_{name}.png")

# Rozkład wysokości drzewostanu
fig, ax = plt.subplots(figsize=(7, 4), dpi=150)
v = chm[np.isfinite(chm) & (chm > 2)]
ax.hist(v, bins=np.arange(2, 36, 0.5), color="#3a7d44")
ax.set_xlabel("wysokość nad gruntem [m]")
ax.set_ylabel("liczba pikseli 0,5 m")
ax.set_title("Rozkład wysokości koron (CHM > 2 m)")
fig.tight_layout()
fig.savefig(out / "histogram_CHM.png")
print("zapisano histogram_CHM.png")
