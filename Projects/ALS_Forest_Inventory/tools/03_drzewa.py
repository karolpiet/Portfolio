"""
Krok 3: pojedyncze drzewa + zwarcie (gęstość) ich koron.

Uruchomienie:  python 03_drzewa.py <folder_z_LAZ> <folder_wyników>
Wymaga:        pip install "laspy[lazrs]" numpy scipy rasterio scikit-image matplotlib

1. Wierzchołki drzew = lokalne maksima na wygładzonym CHM. Okno szukania
   rośnie z wysokością drzewa (wyższe drzewo = szersza korona).
2. Korony = segmentacja "wododziałowa" (watershed): z każdego wierzchołka
   "zalewamy" CHM w dół, aż korony się spotkają.
3. Zwarcie korony = jaki odsetek pierwszych odbić lasera nad koroną zatrzymał
   się w niej (wyżej niż 2 m), a nie przeleciał do gruntu. 1.0 = korona
   szczelna, 0.5 = połowa promieni przechodzi. Rzadsze korony mają drzewa na
   skrajach, w lukach, po trzebieżach i drzewa słabsze.

Uwaga, czego tu NIE robimy: algorytm grupujący (np. GaussianMixture) zawsze
podzieli drzewa na tyle grup, o ile go poprosisz, nawet gdy w lesie jest jeden
gatunek. W tym lesie (100% sosna) taki podział dawał fałszywe "liściaste".
"""
import sys
from pathlib import Path

import laspy
import matplotlib.pyplot as plt
import numpy as np
import rasterio
from scipy import ndimage
from skimage.segmentation import watershed

src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("LAZ")
out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("wyniki")
MIN_H = 5.0  # niższe obiekty pomijamy (krzewy, podrost)

with rasterio.open(out / "CHM.tif") as r:
    chm = r.read(1, masked=True).filled(np.nan)
    tf, res, profile = r.transform, r.res[0], r.profile
with rasterio.open(out / "DTM.tif") as r:
    dtm = r.read(1, masked=True).filled(np.nan)
nrow, ncol = chm.shape

# --- 1. wierzchołki ---------------------------------------------------------
chm0 = np.nan_to_num(chm)
smooth = ndimage.gaussian_filter(chm0, sigma=1.0)  # usuwa drobne "zęby" w koronie
peaks = np.zeros_like(smooth, dtype=bool)
# okno zależne od wysokości: promień ~ 0.6 m + 6% wysokości drzewa
for h_lo, h_hi in [(5, 10), (10, 15), (15, 20), (20, 25), (25, 50)]:
    radius_m = 0.6 + 0.06 * (h_lo + h_hi) / 2
    rp = max(1, int(round(radius_m / res)))
    yy, xx = np.ogrid[-rp:rp + 1, -rp:rp + 1]
    fp = xx ** 2 + yy ** 2 <= rp ** 2
    is_max = smooth == ndimage.maximum_filter(smooth, footprint=fp)
    peaks |= is_max & (smooth >= h_lo) & (smooth < h_hi)
peaks &= smooth >= MIN_H
markers, n = ndimage.label(peaks)
print("wykryte wierzchołki:", n)

# --- 2. korony --------------------------------------------------------------
crowns = watershed(-smooth, markers, mask=smooth > 2.0)
# korona nie może schodzić niżej niż ~40% wysokości swojego wierzchołka
top_h = ndimage.maximum(chm0, crowns, index=np.arange(n + 1))
top_h = np.asarray(top_h)
crowns[chm0 < 0.4 * top_h[crowns]] = 0
with rasterio.open(out / "korony.tif", "w", **{**profile, "dtype": "int32", "nodata": 0}) as dst:
    dst.write(crowns.astype("int32"), 1)

ids = np.arange(1, n + 1)
area = np.bincount(crowns.ravel(), minlength=n + 1)[1:] * res * res
pr, pc = np.nonzero(peaks)
lab = markers[pr, pc]
tx = np.empty(n); ty = np.empty(n); th = np.empty(n)
tx[lab - 1] = tf.c + (pc + 0.5) * res
ty[lab - 1] = tf.f - (pr + 0.5) * res
th[lab - 1] = chm0[pr, pc]

# --- 3. cechy z punktów ------------------------------------------------------
first_all = np.zeros(n + 1); first_canopy = np.zeros(n + 1)
int_sum = np.zeros(n + 1); int_n = np.zeros(n + 1)
for f in sorted(src.glob("*.laz")):
    with laspy.open(f) as rd:
        for ch in rd.chunk_iterator(3_000_000):
            keep = np.asarray(ch.classification) != 7
            ch = ch[keep]
            col = ((np.asarray(ch.x) - tf.c) / res).astype(int)
            row = ((tf.f - np.asarray(ch.y)) / res).astype(int)
            ok = (col >= 0) & (col < ncol) & (row >= 0) & (row < nrow)
            col, row, ch = col[ok], row[ok], ch[ok]
            seg = crowns[row, col]
            hn = np.asarray(ch.z) - dtm[row, col]          # wysokość nad gruntem
            first = np.asarray(ch.return_number) == 1
            # przepuszczalność korony: jaki odsetek pierwszych odbić trafia w koronę
            m = first & (seg > 0)
            np.add.at(first_all, seg[m], 1)
            np.add.at(first_canopy, seg[m], (hn[m] > 2).astype(float))
            # intensywność - tylko górna część korony
            top = m & (hn > 0.6 * top_h[seg])
            s = seg[top]
            np.add.at(int_sum, s, np.asarray(ch.intensity)[top])
            np.add.at(int_n, s, 1)
    print("przetworzono", f.name)

with np.errstate(invalid="ignore", divide="ignore"):
    closure = (first_canopy / first_all)[1:]
    inten = (int_sum / int_n)[1:]

closure[(first_all[1:] < 10)] = np.nan  # za mało punktów, żeby coś mówić
ok = np.isfinite(closure) & (th >= MIN_H)
q = np.nanpercentile(closure[ok], [10, 50, 90])
print(f"zwarcie koron: 10% drzew < {q[0]:.2f}, mediana {q[1]:.2f}, 10% drzew > {q[2]:.2f}")
# korelacja z wysokością: czy niższe drzewa mają rzadsze korony?
print("korelacja zwarcie-wysokość:", round(np.corrcoef(closure[ok], th[ok])[0, 1], 2))

# --- zapis -------------------------------------------------------------------
diam = 2 * np.sqrt(area / np.pi)
with open(out / "drzewa.csv", "w", encoding="utf-8") as fo:
    fo.write("id;x;y;wysokosc_m;pow_korony_m2;sr_korony_m;zwarcie;intensywnosc\n")
    for i in np.flatnonzero(th >= MIN_H):
        fo.write(f"{ids[i]};{tx[i]:.2f};{ty[i]:.2f};{th[i]:.2f};{area[i]:.1f};{diam[i]:.2f};"
                 f"{closure[i]:.3f};{inten[i]:.1f}\n")
print("zapisano drzewa.csv (CRS EPSG:2180, do QGIS: Warstwa > Dodaj tekst rozdzielany)")

# mapa zwarcia: każda korona pokolorowana wartością swojego zwarcia
cmap = plt.get_cmap("RdYlGn")
lo, hi = 0.5, 1.0
val = np.full(n + 1, np.nan); val[1:] = closure
rgb = np.ones((nrow, ncol, 3)) * 0.92
rgb[np.isnan(chm)] = 1
v = val[crowns]
m = (crowns > 0) & np.isfinite(v)
rgb[m] = cmap(np.clip((v[m] - lo) / (hi - lo), 0, 1))[:, :3]
plt.imsave(out / "mapa_zwarcie_pelna.png", rgb)  # pełna rozdzielczość 0,5 m/px
fig, ax = plt.subplots(figsize=(6, 11), dpi=150)
ext = (tf.c, tf.c + ncol * res, tf.f - nrow * res, tf.f)
ax.imshow(rgb, extent=ext, interpolation="nearest")
sm = plt.cm.ScalarMappable(cmap=cmap, norm=plt.Normalize(lo, hi))
fig.colorbar(sm, ax=ax, shrink=0.5, label="zwarcie korony (1 = szczelna)")
ax.set_title("Zwarcie koron sosen")
ax.ticklabel_format(useOffset=False, style="plain"); ax.tick_params(labelsize=6)
fig.tight_layout(); fig.savefig(out / "mapa_zwarcie.png"); plt.close(fig)

fig, ax = plt.subplots(figsize=(7, 4), dpi=150)
hb = ax.hexbin(th[ok], closure[ok], gridsize=50, cmap="Greens", mincnt=1)
ax.set_xlabel("wysokość drzewa [m]"); ax.set_ylabel("zwarcie korony")
ax.set_title("Czy niższe sosny mają rzadsze korony?")
fig.colorbar(hb, label="liczba drzew")
fig.tight_layout(); fig.savefig(out / "zwarcie_vs_wysokosc.png"); plt.close(fig)
print("zapisano mapy")
