"""Figures for the project page (English labels).
Usage: python tools/figures.py <analysis results folder> [output folder]"""
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import tifffile

src = Path(sys.argv[1])
out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parents[1] / "Data"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10, "axes.spines.top": False,
                     "axes.spines.right": False, "axes.edgecolor": "#888", "axes.labelcolor": "#333"})
GREEN, ORANGE = "#2e6d2e", "#f4894c"

d = np.genfromtxt(src / "drzewa.csv", delimiter=";", names=True)
chm = tifffile.imread(src / "CHM.tif").astype(float)
dtm = tifffile.imread(src / "DTM.tif").astype(float)
chm[chm == -9999] = np.nan
dtm[dtm == -9999] = np.nan

# 1. maps: hillshaded terrain and canopy height
gy, gx = np.gradient(np.nan_to_num(dtm, nan=np.nanmean(dtm)), 0.5)
slope = np.arctan(np.hypot(gx, gy) * 3)
aspect = np.arctan2(-gx, gy)
hs = np.sin(np.radians(45)) * np.cos(slope) + np.cos(np.radians(45)) * np.sin(slope) * np.cos(np.radians(315) - aspect)
hs[np.isnan(dtm)] = np.nan
ext = [0, chm.shape[1] * 0.5, 0, chm.shape[0] * 0.5]
fig, ax = plt.subplots(1, 3, figsize=(11, 7.2), gridspec_kw={"width_ratios": [1, 1, 1]})
ax[0].imshow(hs, cmap="gray", extent=ext)
ax[0].set_title("Terrain (DTM, hillshade)")
im = ax[1].imshow(chm, cmap="viridis", vmin=0, vmax=32, extent=ext)
ax[1].set_title("Canopy height model (CHM)")
fig.colorbar(im, ax=ax[1], fraction=0.05, pad=0.02, label="m")
ax[2].imshow(chm, cmap="Greens", vmin=-5, vmax=34, extent=ext, interpolation="nearest")
x0, y0 = 674651.0, 371982.0 - chm.shape[0] * 0.5
ax[2].scatter(d["x"] - x0, d["y"] - y0, s=7, c=ORANGE, edgecolors="white", linewidths=0.4)
ax[2].set_xlim(100, 300); ax[2].set_ylim(1900, 2200)
ax[2].set_title("Detected tree tops (detail)")
for a in ax:
    a.set_xticks([]); a.set_yticks([])
    for sp in a.spines.values():
        sp.set_visible(False)
ax[0].set_xlabel("1.2 km"); ax[2].set_xlabel("200 m")
fig.tight_layout()
fig.savefig(out / "maps.jpg", dpi=110, pil_kwargs={"quality": 85})

# 2. tree heights and crown closure
fig, ax = plt.subplots(1, 2, figsize=(10, 3.6))
ax[0].hist(d["wysokosc_m"], bins=np.arange(5, 36, 1), color=GREEN, edgecolor="white")
ax[0].set_xlabel("Tree height [m]"); ax[0].set_ylabel("Number of trees")
ax[0].set_title(f"{len(d):,} trees detected".replace(",", " "))
h, z = d["wysokosc_m"], d["zwarcie"]
bins = np.arange(5, 35, 2)
idx = np.digitize(h, bins)
mids = [(bins[i - 1] + 1) for i in range(1, len(bins)) if (idx == i).sum() > 20]
q = [np.nanpercentile(z[idx == i], [25, 50, 75]) for i in range(1, len(bins)) if (idx == i).sum() > 20]
q = np.array(q)
ax[1].fill_between(mids, q[:, 0], q[:, 2], color=GREEN, alpha=0.25, lw=0, label="25–75%")
ax[1].plot(mids, q[:, 1], color=GREEN, lw=2, label="median")
ax[1].set_xlabel("Tree height [m]"); ax[1].set_ylabel("Crown closure")
ax[1].set_title("Crown closure by tree height"); ax[1].legend(frameon=False)
fig.tight_layout()
fig.savefig(out / "heights.png", dpi=110)
print("saved", out / "maps.jpg", out / "heights.png")
