"""
Krok 4: wycinek chmury z wynikami analizy, do oglądania w 3D.

Uruchomienie:  python 04_wycinek_3d.py <folder_z_LAZ> <folder_wyników> [x0 y0 bok_m]
Wymaga:        pip install "laspy[lazrs]" numpy rasterio

Zapisuje wycinek_3d.laz z dodatkowymi polami:
  wys_nad_gruntem - wysokość punktu nad DTM [m]
  drzewo_id       - numer korony z kroku 3 (0 = poza koroną)
  zwarcie_korony  - zwarcie korony z kroku 3 (0 = poza koroną)
W CloudCompare: Properties > Colors > Scalar field i wybierz pole.
"""
import sys
from pathlib import Path

import laspy
import numpy as np
import rasterio

src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("LAZ")
out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("wyniki")
x0, y0, side = (float(v) for v in sys.argv[3:6]) if len(sys.argv) > 5 else (674700, 371200, 180)

with rasterio.open(out / "korony.tif") as r:
    crowns = r.read(1); tf = r.transform; res = r.res[0]
with rasterio.open(out / "DTM.tif") as r:
    dtm = r.read(1)

lut = np.zeros(crowns.max() + 1, dtype=np.float32)
with open(out / "drzewa.csv", encoding="utf-8") as f:
    next(f)
    for line in f:
        p = line.rstrip("\n").split(";")
        if p[6] != "nan":
            lut[int(p[0])] = float(p[6])

parts = []
for f in sorted(src.glob("*.laz")):
    with laspy.open(f) as rd:
        header = rd.header
        for ch in rd.chunk_iterator(3_000_000):
            x, y = np.asarray(ch.x), np.asarray(ch.y)
            m = (x >= x0) & (x < x0 + side) & (y >= y0) & (y < y0 + side) & (np.asarray(ch.classification) != 7)
            if m.any():
                parts.append(ch[m])
pts = laspy.ScaleAwarePointRecord(np.concatenate([p.array for p in parts]),
                                  parts[0].point_format, parts[0].scales, parts[0].offsets)
print("punktów w wycinku:", len(pts))

hdr = laspy.LasHeader(point_format=header.point_format.id, version="1.4")
hdr.scales, hdr.offsets = header.scales, header.offsets
hdr.add_extra_dims([laspy.ExtraBytesParams("wys_nad_gruntem", np.float32),
                    laspy.ExtraBytesParams("drzewo_id", np.int32),
                    laspy.ExtraBytesParams("zwarcie_korony", np.float32)])
las = laspy.LasData(hdr)
for dim in pts.point_format.dimension_names:
    las[dim] = pts[dim]
col = ((np.asarray(las.x) - tf.c) / res).astype(int)
row = ((tf.f - np.asarray(las.y)) / res).astype(int)
seg = crowns[row, col]
hn = np.asarray(las.z) - dtm[row, col]
# punkt należy do korony, jeśli jest nad nią i nie niżej niż 2 m nad gruntem
seg = np.where(hn > 2, seg, 0)
las.wys_nad_gruntem = hn.astype(np.float32)
las.drzewo_id = seg.astype(np.int32)
las.zwarcie_korony = lut[seg]
las.write(out / "wycinek_3d.laz")
print("zapisano wycinek_3d.laz")
