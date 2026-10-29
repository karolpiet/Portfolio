"""
Krok 1: DTM, DSM, CHM z chmury ALS (ISOK 2014, już sklasyfikowanej).

Uruchomienie:  python 01_rastry.py <folder_z_LAZ> <folder_wyników>
Wymaga:        pip install "laspy[lazrs]" numpy scipy rasterio

Co się tu dzieje:
- DTM (numeryczny model terenu): tylko punkty klasy 2 (grunt), zamienione
  na siatkę przez interpolację liniową po trójkątach (TIN).
- DSM (model pokrycia terenu): najwyższy punkt w każdej komórce siatki,
  bez szumu (klasa 7). Puste komórki łatamy interpolacją.
- CHM (model wysokości koron) = DSM - DTM, czyli wysokość obiektów nad gruntem.
"""
import sys
from pathlib import Path

import laspy
import numpy as np
import rasterio
from rasterio.transform import from_origin
from scipy import ndimage
from scipy.interpolate import griddata

RES = 0.5          # rozmiar piksela [m]
CRS = "EPSG:2180"  # PUWG 1992 - układ, w którym są dane ISOK

src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("LAZ")
out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("wyniki")
out.mkdir(parents=True, exist_ok=True)

# --- wczytanie wszystkich arkuszy ---------------------------------------
xs, ys, zs, cls = [], [], [], []
for f in sorted(src.glob("*.laz")):
    with laspy.open(f) as r:
        print(f.name, r.header.point_count, "pkt")
        for ch in r.chunk_iterator(2_000_000):  # czytamy kawałkami, żeby oszczędzać RAM
            xs.append(np.asarray(ch.x)); ys.append(np.asarray(ch.y))
            zs.append(np.asarray(ch.z, dtype="float32")); cls.append(np.asarray(ch.classification))
x, y, z, c = map(np.concatenate, (xs, ys, zs, cls))
del xs, ys, zs, cls

xmin, ymax = np.floor(x.min()), np.ceil(y.max())
ncol = int(np.ceil((x.max() - xmin) / RES))
nrow = int(np.ceil((ymax - y.min()) / RES))
transform = from_origin(xmin, ymax, RES, RES)
col = np.clip(((x - xmin) / RES).astype(int), 0, ncol - 1)
row = np.clip(((ymax - y) / RES).astype(int), 0, nrow - 1)
print(f"siatka {ncol} x {nrow} pikseli po {RES} m")


# maska zasięgu danych: piksele dalej niż 3 m od jakiegokolwiek punktu = brak danych
cnt = np.bincount(row * ncol + col, minlength=nrow * ncol).reshape(nrow, ncol)
nodata = ndimage.distance_transform_edt(cnt == 0) * RES > 3


def save(name, arr):
    arr = np.where(nodata, np.nan, arr)
    with rasterio.open(out / name, "w", driver="GTiff", height=nrow, width=ncol, count=1,
                       dtype="float32", crs=CRS, transform=transform, nodata=-9999,
                       compress="deflate") as dst:
        dst.write(np.where(np.isnan(arr), -9999, arr).astype("float32"), 1)
    print("zapisano", name)


# --- DTM ------------------------------------------------------------------
g = c == 2
# najniższy punkt gruntu w komórce -> mniej punktów do TIN, bez utraty szczegółu
key = row[g] * ncol + col[g]
zmin = np.full(nrow * ncol, np.inf)
np.minimum.at(zmin, key, z[g])
zmin = zmin.reshape(nrow, ncol)
# TIN liczymy w kafelkach 500x500 px z zakładką, bo cała siatka naraz nie mieści się w RAM
TILE, BUF = 500, 40
dtm = np.full((nrow, ncol), np.nan, dtype="float32")
for r0 in range(0, nrow, TILE):
    for c0 in range(0, ncol, TILE):
        ra, rb = max(r0 - BUF, 0), min(r0 + TILE + BUF, nrow)
        ca, cb = max(c0 - BUF, 0), min(c0 + TILE + BUF, ncol)
        sub = zmin[ra:rb, ca:cb]
        rr, cc = np.nonzero(np.isfinite(sub))
        if len(rr) < 3:
            continue
        tr, tc = np.mgrid[r0 - ra:min(r0 + TILE, nrow) - ra, c0 - ca:min(c0 + TILE, ncol) - ca]
        dtm[r0:r0 + tr.shape[0], c0:c0 + tr.shape[1]] = griddata(
            (rr, cc), sub[rr, cc], (tr, tc), method="linear")
# brzegi poza zasięgiem TIN - najbliższy sąsiad
hole = np.isnan(dtm)
ind = ndimage.distance_transform_edt(hole, return_distances=False, return_indices=True)
dtm = dtm[tuple(ind)]
save("DTM.tif", dtm)

# --- DSM ------------------------------------------------------------------
ok = c != 7
key = row[ok] * ncol + col[ok]
zmax = np.full(nrow * ncol, -np.inf)
np.maximum.at(zmax, key, z[ok])
zmax = zmax.reshape(nrow, ncol)
empty = ~np.isfinite(zmax)
print(f"puste komórki DSM: {empty.mean():.1%}")
# łatanie dziur wartością najbliższego sąsiada
ind = ndimage.distance_transform_edt(empty, return_distances=False, return_indices=True)
dsm = zmax[tuple(ind)]
save("DSM.tif", dsm)

# --- CHM ------------------------------------------------------------------
chm = np.clip(dsm - dtm, 0, None)
# "dołki" w koronach (promień przeszedł przez lukę) - lekki filtr medianowy
# tylko tam, gdzie piksel jest wyraźnie niższy niż otoczenie
med = ndimage.median_filter(chm, size=3)
chm = np.where(med - chm > 2, med, chm)
chm[chm > 45] = np.nan  # wysokości nierealne w tym terenie = błędy
save("CHM.tif", chm)
