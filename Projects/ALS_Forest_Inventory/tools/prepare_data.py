"""
Przygotowuje dane z analizy ALS do strony: kompaktowe pliki JS (działają też
po otwarciu index.html z dysku, bez serwera) i nakładki PNG do mapy.

Uruchomienie:  python narzedzia/przygotuj_dane.py <folder wyniki analizy> [folder strony]
Wymaga:        pip install numpy tifffile imagecodecs pyproj "laspy[lazrs]" pillow
"""
import base64
import gzip
import json
import sys
from pathlib import Path

import laspy
import numpy as np
import tifffile
from PIL import Image
from pyproj import Transformer

src = Path(sys.argv[1])
out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parents[1]
(out / "data").mkdir(exist_ok=True)
(out / "img").mkdir(exist_ok=True)

NODATA = -9999
H_SCALE = 0.5  # CHM zapisany jako uint8, krok 0,5 m (max 127 m)


def raster(name):
    with tifffile.TiffFile(src / name) as tf:
        p = tf.pages[0]
        a = p.asarray()
        sx, sy, _ = p.tags["ModelPixelScaleTag"].value
        x0, y0 = p.tags["ModelTiepointTag"].value[3:5]
    return a, float(x0), float(y0), float(sx)


def zapisz_js(name, meta, arrays):
    """window.ALS[name] = {meta..., b64: base64(gzip(bajty kolejnych tablic))}"""
    raw = b"".join(a.tobytes() for a in arrays)
    meta = dict(meta, b64=base64.b64encode(gzip.compress(raw, 9)).decode())
    js = f"(window.ALS=window.ALS||{{}})[{json.dumps(name)}]={json.dumps(meta)};\n"
    (out / "data" / f"{name}.js").write_text(js, encoding="utf-8")
    print(f"data/{name}.js: {len(js) / 1e6:.2f} MB (surowe {len(raw) / 1e6:.2f} MB)")


# --- CHM do kalkulatora (pełna rozdzielczość 0,5 m) --------------------------
chm, X0, Y0, RES = raster("CHM.tif")
H, W = chm.shape
ok = chm != NODATA
# wysokość zaokrąglona w dół do 0,5 m: progi 2 m i 5 m zostają dokładne,
# przy odczycie bierzemy środek przedziału (v + 0,5) * 0,5 m
q = np.where(ok, np.clip(np.floor(chm / H_SCALE), 0, 254), 255).astype(np.uint8)
zapisz_js("chm", {"x0": X0, "y0": Y0, "res": RES, "w": W, "h": H, "skala": H_SCALE,
                  "nodata": 255, "epsg": 2180}, [q])

# --- drzewa ------------------------------------------------------------------
d = np.genfromtxt(src / "drzewa.csv", delimiter=";", names=True)
XS = 0.05  # m na jednostkę uint16 (zasięg 3276 m)
assert (d["x"] - X0).max() / XS < 65535 and (Y0 - d["y"]).max() / XS < 65535
tx = np.round((d["x"] - X0) / XS).astype(np.uint16)
ty = np.round((Y0 - d["y"]) / XS).astype(np.uint16)
th = np.round(d["wysokosc_m"] * 100).astype(np.uint16)
tk = np.round(d["sr_korony_m"] * 100).astype(np.uint16)
tz = np.round(np.nan_to_num(d["zwarcie"]) * 250).astype(np.uint8)
zapisz_js("drzewa", {"n": len(d), "x0": X0, "y0": Y0, "krok": XS,
                     "uklad": "x,y (uint16 * krok, y w dół od y0), h [cm], korona [cm] (uint16), zwarcie*250 (uint8)"},
          [tx, ty, th, tk, tz])

# --- statystyki do strony ----------------------------------------------------
v = chm[ok]
px = RES * RES
hist, edges = np.histogram(d["wysokosc_m"], bins=np.arange(5, 36, 1))
stats = {
    "pow_ha": float(ok.sum() * px / 1e4),
    "las_ha": float((v >= 5).sum() * px / 1e4),
    "drzewa": int(len(d)),
    "h_sr": float(d["wysokosc_m"].mean()),
    "h_med": float(np.median(d["wysokosc_m"])),
    "h_max": float(d["wysokosc_m"].max()),
    "korona_sr": float(np.nanmean(d["sr_korony_m"])),
    "zwarcie_sr": float(np.nanmean(d["zwarcie"])),
    "hist_h": {"od": 5, "krok": 1, "n": hist.tolist()},
}
# zwarcie vs wysokość: średnie zwarcie w klasach wysokości
cls = np.clip(((d["wysokosc_m"] - 5) // 2).astype(int), 0, 14)
stats["zwarcie_wg_h"] = [{"h": 5 + 2 * i + 1, "zw": float(np.nanmean(d["zwarcie"][cls == i])),
                          "n": int((cls == i).sum())} for i in range(15) if (cls == i).sum() >= 20]
(out / "data" / "statystyki.js").write_text(
    "(window.ALS=window.ALS||{}).statystyki=" + json.dumps(stats) + ";\n", encoding="utf-8")
print("statystyki:", {k: v for k, v in stats.items() if not isinstance(v, (list, dict))})

# --- nakładki mapy w EPSG:3857 (Leaflet) -------------------------------------
to3857 = Transformer.from_crs(2180, 3857, always_xy=True)
to2180 = Transformer.from_crs(3857, 2180, always_xy=True)
to4326 = Transformer.from_crs(3857, 4326, always_xy=True)
cx = [X0, X0 + W * RES, X0, X0 + W * RES]
cy = [Y0, Y0, Y0 - H * RES, Y0 - H * RES]
mx, my = to3857.transform(cx, cy)
mx0, mx1, my0, my1 = min(mx), max(mx), min(my), max(my)
PIX = 2.0  # m w układzie 3857 na piksel (ok. 1,25 m w terenie)
ow, oh = int(np.ceil((mx1 - mx0) / PIX)), int(np.ceil((my1 - my0) / PIX))
gx, gy = np.meshgrid(mx0 + (np.arange(ow) + 0.5) * PIX, my1 - (np.arange(oh) + 0.5) * PIX)
sx, sy = to2180.transform(gx, gy)
ci = np.floor((sx - X0) / RES).astype(int)
ri = np.floor((Y0 - sy) / RES).astype(int)
inside = (ci >= 0) & (ci < W) & (ri >= 0) & (ri < H)
ci, ri = np.clip(ci, 0, W - 1), np.clip(ri, 0, H - 1)
lon0, lat0 = to4326.transform(mx0, my0)
lon1, lat1 = to4326.transform(mx1, my1)
bounds = [[lat0, lon0], [lat1, lon1]]


def lut(stops, n=256):
    stops = np.array(stops, float)
    t = np.linspace(0, 1, n)
    return np.stack([np.interp(t, stops[:, 0], stops[:, k]) for k in (1, 2, 3)], 1).astype(np.uint8)


def png(name, rgba):
    im = Image.fromarray(rgba, "RGBA").quantize(128, method=Image.Quantize.FASTOCTREE)
    im.save(out / "img" / name, optimize=True)
    print(f"img/{name}: {(out / 'img' / name).stat().st_size / 1e6:.2f} MB")


samp = lambda a: a[ri, ci]  # noqa: E731

# CHM: od jasnej zieleni (niskie) do ciemnej (wysokie), < 2 m przezroczyste
VIR = lut([(0, 253, 231, 37), (.25, 94, 201, 98), (.5, 33, 145, 140), (.75, 59, 82, 139), (1, 68, 1, 84)])
c = samp(chm)
valid = inside & (c != NODATA)
idx = np.clip(c / 32 * 255, 0, 255).astype(int)
rgba = np.zeros((oh, ow, 4), np.uint8)
rgba[..., :3] = VIR[idx]
rgba[..., 3] = np.where(valid & (c >= 2), 235, 0)
png("chm.png", rgba)

# cieniowanie DTM (azymut 315, wys. 45) + lekki kolor wysokości
dtm, *_ = raster("DTM.tif")
dz = np.where(dtm == NODATA, np.nan, dtm)
fill = np.nanmean(dz)
z = np.nan_to_num(dz, nan=fill)
gy_, gx_ = np.gradient(z, RES)
slope = np.arctan(np.hypot(gx_, gy_) * 2.0)  # x2: wyraźniejsza rzeźba
aspect = np.arctan2(-gx_, gy_)
az, alt = np.radians(315), np.radians(45)
hs = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
hs = np.clip(hs, 0, 1)
TER = lut([(0, 46, 120, 70), (.5, 214, 201, 140), (1, 150, 95, 60)])
zn = (z - np.nanmin(dz)) / (np.nanmax(dz) - np.nanmin(dz))
col = TER[np.clip(zn * 255, 0, 255).astype(int)].astype(float) * (0.35 + 0.65 * hs[..., None])
rgba = np.zeros((oh, ow, 4), np.uint8)
rgba[..., :3] = samp(col.astype(np.uint8))
rgba[..., 3] = np.where(inside & (samp(dtm) != NODATA), 255, 0)
png("dtm.png", rgba)

# zwarcie koron: każdy piksel korony w kolorze zwarcia swojego drzewa
kor, *_ = raster("korony.tif")
zw_by_id = np.zeros(int(kor.max()) + 1, np.float32)
ids = d["id"].astype(int)
ok_id = ids < len(zw_by_id)
zw_by_id[ids[ok_id]] = np.nan_to_num(d["zwarcie"][ok_id])
k = samp(kor)
zw = zw_by_id[k]
ZW = lut([(0, 215, 48, 39), (.5, 254, 224, 139), (1, 26, 152, 80)])
rgba = np.zeros((oh, ow, 4), np.uint8)
rgba[..., :3] = ZW[np.clip((zw - 0.4) / 0.6 * 255, 0, 255).astype(int)]
rgba[..., 3] = np.where(inside & (k > 0), 230, 0)
png("zwarcie.png", rgba)

# zasięg danych (obrys) w WGS84 do mapy
ring = [(X0, Y0), (X0 + W * RES, Y0), (X0 + W * RES, Y0 - H * RES), (X0, Y0 - H * RES), (X0, Y0)]
t84 = Transformer.from_crs(2180, 4326, always_xy=True)
zasieg = [[round(b, 7), round(a, 7)] for a, b in zip(*t84.transform(*zip(*ring)))]
(out / "data" / "mapa.js").write_text(
    "(window.ALS=window.ALS||{}).mapa=" + json.dumps({"bounds": bounds, "zasieg": zasieg}) + ";\n",
    encoding="utf-8")

# --- chmura punktów 3D (wycinek) ---------------------------------------------
las = laspy.read(src / "wycinek_3d.laz")
x, y, zc = np.asarray(las.x), np.asarray(las.y), np.asarray(las.z)
keep = np.asarray(las.classification) != 7  # bez szumu
MAXP = 320_000  # przerzedzenie, żeby plik miał ok. 3 MB
if keep.sum() > MAXP:
    idx = np.flatnonzero(keep)
    keep[:] = False
    keep[np.random.default_rng(0).choice(idx, MAXP, replace=False)] = True
cxm, cym, zmin = (x.min() + x.max()) / 2, (y.min() + y.max()) / 2, zc[keep].min()
P = np.stack([(x - cxm) * 100, (y - cym) * 100, (zc - zmin) * 100], 1)[keep]
P = np.round(P).astype(np.int16)
rgb = np.stack([las.red, las.green, las.blue], 1)[keep]
lo, hi = np.percentile(rgb, [2, 98])  # kolory z nalotu są ciemne: rozciągamy kontrast
rgb = np.clip((rgb - lo) / (hi - lo) * 255, 0, 255).astype(np.uint8)
cl = np.asarray(las.classification)[keep].astype(np.uint8)
hg = np.clip(np.asarray(las.wys_nad_gruntem)[keep] * 5, 0, 255).astype(np.uint8)
zk = np.clip(np.nan_to_num(np.asarray(las.zwarcie_korony)[keep]) * 250, 0, 255).astype(np.uint8)
tid = np.asarray(las.drzewo_id)[keep].astype(np.uint32)
tcol = ((tid.astype(np.uint64) * 2654435761) % 2**32 >> 24).astype(np.uint8)  # pseudolosowy odcień dla drzewa
tcol[tid == 0] = 0
zapisz_js("chmura", {"n": int(keep.sum()), "rozmiar_m": float(x.max() - x.min()),
                     "srodek": [float(cxm), float(cym)], "zmin": float(zmin),
                     "uklad": "xyz int16 [cm], rgb uint8 x3, klasa, wys*5, zwarcie*250, drzewo(odcień)"},
          [P, rgb, cl, hg, zk, tcol])
