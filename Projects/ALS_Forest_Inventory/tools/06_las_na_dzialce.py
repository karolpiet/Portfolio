"""
Krok 6: ile lasu jest na działce (albo na dowolnym narysowanym obszarze).

Uruchomienie (w folderze analiza_claude):
    python skrypty\\06_las_na_dzialce.py --id 140905_5.0031.129/6
    python skrypty\\06_las_na_dzialce.py --nr "Wierzchowiska I 129/6"
    python skrypty\\06_las_na_dzialce.py --xy 675302 370920          (punkt w EPSG:2180)
    python skrypty\\06_las_na_dzialce.py --plik ..\\dzialka_11.shp    (.shp .kml .gpx .geojson)
    python skrypty\\06_las_na_dzialce.py --caly                       (cały obszar analizy)
Opcje:  --bez-bdl  (nie pytaj Banku Danych o Lasach),  --wyniki <folder>  (domyślnie: wyniki)

Wymaga:  pip install numpy rasterio shapely pyproj pyshp
Internet jest potrzebny tylko do ULDK (granice działki) i BDL (opisy wydzieleń).

Co liczymy:
- powierzchnia działki i ile z niej mamy w danych ALS (pokrycie),
- powierzchnia lasu = piksele CHM >= 5 m (korony drzew); osobno krzewy/podrost 2-5 m,
- drzewa z drzewa.csv, których wierzchołek leży w działce: liczba, wysokości,
- miąższość grubizny [m3] na dwa sposoby (patrz niżej), jako przedział.

Miąższość - to są SZACUNKI, nie pomiar. Laser widzi wysokość, nie pierśnicę.
  A) "z drzew": dla każdej wykrytej sosny pierśnica d = 1,3*h - 2,5 cm (typowa
     relacja h-d dla dojrzałej sosny), v = pi/4 * d^2 * h * f, f = 0,42 + 1/h
     (pierśnicowa liczba kształtu grubizny sosny). Zwykle ZANIŻA: z góry nie
     widać drzew podokapowych, a zrośnięte korony liczą się jako jedno drzewo.
  B) "z wysokości drzewostanu": w kwadratach 20x20 m V = G * zwarcie * H * f,
     H = 95. percentyl CHM, G = 28 m2/ha (pierśnicowe pole przekroju w pełni
     zadrzewionej dojrzałej sośnie). Zwykle bliżej tablic zasobności, ale G
     to założenie: luźny drzewostan może mieć 20, gęsty 35 m2/ha.
  Do tego: dane ALS są z kwietnia 2014. Sosna w wieku 60-90 lat przyrasta ok.
  5-8 m3/ha/rok, więc dziś może być więcej (albo mniej, jeśli była wycinka).
"""
import argparse
import json
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

import numpy as np
import rasterio
from pyproj import CRS, Transformer
from rasterio.features import geometry_mask
from rasterio.windows import from_bounds
import shapely
from shapely import wkt
from shapely.geometry import Polygon, box, mapping, shape
from shapely.ops import polygonize, unary_union

EPSG = 2180
H_LAS = 5.0          # od tej wysokości liczymy "las" (korony drzew)
H_KRZ = 2.0          # 2-5 m: krzewy, podrost, młodnik
G_HA = 28.0          # założone pierśnicowe pole przekroju [m2/ha] dla metody B
KOM = 20.0           # bok kwadratu w metodzie B [m]

ULDK = "https://uldk.gugik.gov.pl/"
BDL = "https://ogcapi.bdl.lasy.gov.pl/collections"
RDLP = ["Radom", "Lublin", "Lodz", "Krakow", "Katowice", "Warszawa", "Bialystok", "Krosno",
        "Olsztyn", "Pila", "Poznan", "Szczecin", "Szczecinek", "Torun", "Wroclaw",
        "Zielona_Gora", "Gdansk"]  # najpierw okolice Wierzchowisk, potem reszta kraju


def get(url, params, timeout=30):
    full = url + "?" + urllib.parse.urlencode(params, safe=",/")
    req = urllib.request.Request(full, headers={"User-Agent": "las-na-dzialce/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8")


def transform(fn, geom):
    return shapely.transform(geom, lambda c: np.column_stack(fn(c[:, 0], c[:, 1])))


def jako_wielobok(g):
    """Obrys narysowany jako linia (np. pomiar z Geoportalu) zamieniamy na wielobok."""
    if g.geom_type in ("Polygon", "MultiPolygon"):
        return g
    polys = list(polygonize(unary_union(g)))
    if not polys and g.geom_type == "LineString" and len(g.coords) >= 3:
        polys = [Polygon(g.coords)]
    return unary_union(polys)


def to2180(geom, epsg):
    geom = jako_wielobok(geom)
    if epsg == EPSG:
        return geom
    t = Transformer.from_crs(epsg, EPSG, always_xy=True)
    return transform(t.transform, geom)


# --- skąd wziąć granicę ------------------------------------------------------
def z_uldk(request, key, value):
    """Zwraca listę (opis, geometria EPSG:2180) z usługi ULDK GUGiK."""
    txt = get(ULDK, {"request": request, key: value,
                     "result": "geom_wkt,id,parcel,region,commune", "srid": EPSG})
    lines = [ln.strip() for ln in txt.strip().splitlines() if ln.strip()]
    if not lines or lines[0].startswith("-1"):
        sys.exit(f"ULDK nie znalazł działki ({value}): {' '.join(lines)[:200]}")
    out = []
    for ln in lines[1:]:
        parts = ln.split("|")
        g = next(p for p in parts if "POLYGON" in p)
        g = wkt.loads(g.split(";", 1)[-1])
        meta = [p for p in parts if "POLYGON" not in p]
        ident, nr, obreb, gmina = (meta + ["?"] * 4)[:4]
        out.append((f"działka {nr}, obręb {obreb}, gm. {gmina} ({ident})", g))
    return out


def z_pliku(path):
    path = Path(path)
    ext = path.suffix.lower()
    if ext == ".shp":
        import shapefile  # pip install pyshp
        epsg = 4326
        prj = path.with_suffix(".prj")
        if prj.exists():
            epsg = CRS.from_wkt(prj.read_text()).to_epsg() or 4326
        r = shapefile.Reader(str(path))
        names = [f[0] for f in r.fields[1:]]
        out = []
        for i, (s, rec) in enumerate(zip(r.shapes(), r.records())):
            g = shape(s.__geo_interface__)
            if epsg == 4326 and g.bounds[0] > 180:   # plik bez .prj w układzie płaskim
                epsg = 2178 if g.bounds[0] > 7e6 else EPSG
            d = dict(zip(names, rec))
            label = d.get("ID_DZIAL") or d.get("name") or f"{path.stem} #{i + 1}"
            out.append((str(label), to2180(g, epsg)))
        return out
    if ext in (".kml", ".gpx"):
        root = ET.parse(path).getroot()
        rings = []
        for el in root.iter():
            tag = el.tag.split("}")[-1]
            if tag == "coordinates" and el.text:  # KML: lon,lat[,alt]
                pts = [tuple(map(float, c.split(",")[:2])) for c in el.text.split()]
                rings.append(pts)
            elif tag in ("trkseg", "rte"):         # GPX: trasa obrysu działki
                pts = [(float(p.get("lon")), float(p.get("lat")))
                       for p in el if p.tag.split("}")[-1] in ("trkpt", "rtept")]
                rings.append(pts)
        polys = [Polygon(p) for p in rings if len(p) >= 3]
        if not polys:
            sys.exit(f"W pliku {path.name} nie ma wieloboku")
        return [(path.stem, to2180(unary_union(polys), 4326))]
    if ext in (".geojson", ".json"):
        gj = json.loads(path.read_text(encoding="utf-8"))
        feats = gj["features"] if "features" in gj else [gj]
        epsg = 4326
        name = gj.get("crs", {}).get("properties", {}).get("name", "")
        if name:
            epsg = CRS.from_user_input(name).to_epsg()
        return [(f"{path.stem} #{i + 1}", to2180(shape(f.get("geometry", f)), epsg))
                for i, f in enumerate(feats)]
    sys.exit(f"Nie umiem czytać plików {ext}")


# --- Bank Danych o Lasach ----------------------------------------------------
def bdl_wydzielenia(geom):
    """Wydzielenia leśne BDL przecinające obszar (lista słowników)."""
    t = Transformer.from_crs(EPSG, 4326, always_xy=True)
    g84 = transform(t.transform, geom)
    bbox = ",".join(f"{v:.6f}" for v in g84.bounds)
    back = Transformer.from_crs(4326, EPSG, always_xy=True)
    for rd in RDLP:
        try:
            txt = get(f"{BDL}/RDLP_{rd}_wydzielenia/items",
                      {"f": "json", "bbox": bbox, "limit": 500}, timeout=20)
        except Exception as e:  # noqa: BLE001 - usługa bywa niedostępna
            print(f"  (BDL nie odpowiada: {e.__class__.__name__}, pomijam opisy)")
            return None, []
        feats = json.loads(txt).get("features", [])
        if not feats:
            continue
        out = []
        for f in feats:
            g = transform(back.transform, shape(f["geometry"]))
            czesc = g.intersection(geom).area
            if czesc < 1:
                continue
            p = f["properties"]
            p["_ha_na_dzialce"] = czesc / 1e4
            out.append(p)
        return rd, out
    return None, []


# --- liczenie ----------------------------------------------------------------
def objetosc_drzew(h):
    d = np.clip(1.3 * h - 2.5, 7, None)          # pierśnica [cm]
    f = 0.42 + 1.0 / h                           # liczba kształtu grubizny sosny
    return np.pi / 4 * (d / 100) ** 2 * h * f, d


def policz(geom, wyniki, drzewa):
    with rasterio.open(wyniki / "CHM.tif") as r:
        b = geom.bounds
        win = from_bounds(*b, transform=r.transform).round_offsets().round_lengths()
        chm = r.read(1, window=win, boundless=True, fill_value=r.nodata).astype(float)
        tf = r.window_transform(win)
        nod = r.nodata
        res = r.res[0]
    inside = ~geometry_mask([mapping(geom)], chm.shape, tf, all_touched=False)
    dane = inside & (chm != nod) & np.isfinite(chm)
    px = res * res
    wynik = {
        "pow_dzialki_ha": geom.area / 1e4,
        "pow_z_danymi_ha": dane.sum() * px / 1e4,
    }
    h = np.where(dane, chm, np.nan)
    las = dane & (h >= H_LAS)
    wynik["las_ha"] = las.sum() * px / 1e4
    wynik["krzewy_ha"] = (dane & (h >= H_KRZ) & (h < H_LAS)).sum() * px / 1e4
    wynik["wys_koron_sr"] = float(np.nanmean(h[las])) if las.any() else 0.0

    # drzewa z wierzchołkiem w działce
    from shapely import contains_xy
    m = contains_xy(geom, drzewa["x"], drzewa["y"])
    th = drzewa["wysokosc_m"][m]
    v, d = objetosc_drzew(th) if len(th) else (np.array([]), np.array([]))
    wynik["drzewa"] = int(m.sum())
    wynik["h"] = th
    wynik["d_sr"] = float(d.mean()) if len(d) else 0.0
    wynik["V_drzewa"] = float(v.sum())

    # metoda B: kwadraty KOM x KOM m
    k = max(1, int(round(KOM / res)))
    V_B = 0.0
    for i in range(0, h.shape[0], k):
        for j in range(0, h.shape[1], k):
            blok = h[i:i + k, j:j + k]
            ok = np.isfinite(blok)
            if not ok.any():
                continue
            zw = (blok[ok] >= H_LAS).mean()
            if zw == 0:
                continue
            H = np.percentile(blok[ok][blok[ok] >= H_LAS], 95)
            pow_ha = ok.sum() * px / 1e4
            V_B += G_HA * zw * H * (0.42 + 1.0 / H) * pow_ha
    wynik["V_B"] = V_B
    return wynik


def raport(nazwa, w, bdl=None):
    print("\n" + "=" * 70)
    print(nazwa)
    print("=" * 70)
    print(f"Powierzchnia obszaru:        {w['pow_dzialki_ha']:8.2f} ha")
    if w["pow_z_danymi_ha"] < 0.99 * w["pow_dzialki_ha"]:
        print(f"  UWAGA: dane ALS obejmują tylko {100 * w['pow_z_danymi_ha'] / w['pow_dzialki_ha']:.0f}% obszaru "
              f"({w['pow_z_danymi_ha']:.2f} ha) - liczby niżej dotyczą tylko tej części")
    if w["pow_z_danymi_ha"] == 0:
        print("  Brak danych ALS dla tego obszaru.")
        return
    los = w["pow_z_danymi_ha"]
    print(f"Las (korony >= {H_LAS:.0f} m):       {w['las_ha']:8.2f} ha  "
          f"({100 * w['las_ha'] / los:.0f}% obszaru)")
    print(f"Krzewy/podrost 2-{H_LAS:.0f} m:        {w['krzewy_ha']:8.2f} ha")
    print(f"Wykryte drzewa (> 5 m):      {w['drzewa']:8d} szt."
          + (f"  ({w['drzewa'] / w['las_ha']:.0f} szt./ha lasu)" if w["las_ha"] > 0 else ""))
    h = w["h"]
    if len(h):
        p = np.percentile(h, [10, 50, 90])
        print(f"Wysokość drzew:              średnia {h.mean():.1f} m, mediana {p[1]:.1f} m, "
              f"10-90%: {p[0]:.1f}-{p[2]:.1f} m, max {h.max():.1f} m")
        print(f"Szacowana średnia pierśnica: {w['d_sr']:.0f} cm")
    a, b = sorted([w["V_drzewa"], w["V_B"]])
    print(f"Miąższość grubizny (2014):   ok. {a:.0f}-{b:.0f} m3"
          + (f"  ({a / w['las_ha']:.0f}-{b / w['las_ha']:.0f} m3/ha lasu)" if w["las_ha"] > 0 else ""))
    print(f"  A) suma wykrytych drzew:   {w['V_drzewa']:.0f} m3  (raczej zaniżone)")
    print(f"  B) z wysokości i zwarcia:  {w['V_B']:.0f} m3  (zakłada G = {G_HA:.0f} m2/ha)")
    print("  To szacunek z lasera z kwietnia 2014, błąd rzędu +/-25%. Do sprzedaży drewna")
    print("  potrzebny jest pomiar w terenie (pierśnice) albo opis taksacyjny.")
    if bdl is None:
        return
    rd, wyd = bdl
    if not wyd:
        print("\nBDL: brak wydzieleń leśnych na tym obszarze (albo usługa nie odpowiada).")
        return
    print(f"\nBank Danych o Lasach (RDLP {rd}), wydzielenia na obszarze:")
    print(f"  {'adres leśny':28s} {'na dz. ha':>9s} {'gat.':>5s} {'wiek':>5s} {'siedl.':>7s} "
          f"{'funkcja':>8s} {'rok':>5s}")
    for p in sorted(wyd, key=lambda p: -p["_ha_na_dzialce"]):
        print(f"  {str(p.get('adr_for', '')).replace('  ', ''):28s} {p['_ha_na_dzialce']:9.2f} "
              f"{str(p.get('species_cd') or '-'):>5s} {str(p.get('spec_age') or '-'):>5s} "
              f"{str(p.get('site_type') or '-'):>7s} {str(p.get('forest_fun') or '-'):>8s} "
              f"{str(p.get('a_year') or '-'):>5s}")
    print("  (gat. = gatunek panujący, wiek w roku stanu danych; zasobności BDL nie")
    print("   udostępnia w tej usłudze, pełny opis: bdl.lasy.gov.pl > kliknij wydzielenie)")


def zapisz(wyniki, wiersze, geomy):
    csv = wyniki / "dzialki_raport.csv"
    nowy = not csv.exists()
    with open(csv, "a", encoding="utf-8") as fo:
        if nowy:
            fo.write("obszar;pow_ha;pow_z_danymi_ha;las_ha;krzewy_ha;drzewa;h_sr_m;h_max_m;"
                     "d_sr_cm;V_drzewa_m3;V_wysokosc_m3\n")
        for nazwa, w in wiersze:
            h = w["h"]
            fo.write(f"{nazwa};{w['pow_dzialki_ha']:.3f};{w['pow_z_danymi_ha']:.3f};"
                     f"{w['las_ha']:.3f};{w['krzewy_ha']:.3f};{w['drzewa']};"
                     f"{h.mean() if len(h) else 0:.1f};{h.max() if len(h) else 0:.1f};"
                     f"{w['d_sr']:.0f};{w['V_drzewa']:.0f};{w['V_B']:.0f}\n")
    gj = {"type": "FeatureCollection",
          "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG::2180"}},
          "features": [{"type": "Feature", "properties": {"obszar": n}, "geometry": mapping(g)}
                       for n, g in geomy]}
    (wyniki / "dzialki.geojson").write_text(json.dumps(gj), encoding="utf-8")
    print(f"\nDopisano do {csv} ; granice zapisane w {wyniki / 'dzialki.geojson'} (do QGIS)")


def main():
    ap = argparse.ArgumentParser(description="Ile lasu jest na działce (z danych ALS)")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--id", nargs="+", help="identyfikator działki, np. 140905_5.0031.129/6")
    g.add_argument("--nr", nargs="+", help='obręb i numer, np. "Wierzchowiska I 129/6"')
    g.add_argument("--xy", nargs=2, type=float, metavar=("X", "Y"),
                   help="punkt w działce, EPSG:2180")
    g.add_argument("--plik", help="obrys: .shp .kml .gpx .geojson")
    g.add_argument("--caly", action="store_true", help="cały obszar analizy")
    ap.add_argument("--wyniki", default="wyniki")
    ap.add_argument("--bez-bdl", action="store_true")
    a = ap.parse_args()

    wyniki = Path(a.wyniki)
    drzewa = np.genfromtxt(wyniki / "drzewa.csv", delimiter=";", names=True)

    if a.id:
        obszary = [o for i in a.id for o in z_uldk("GetParcelById", "id", i)]
    elif a.nr:
        obszary = [o for n in a.nr for o in z_uldk("GetParcelByIdOrNr", "id", n)]
    elif a.xy:
        obszary = z_uldk("GetParcelByXY", "xy", f"{a.xy[0]},{a.xy[1]},{EPSG}")
    elif a.plik:
        obszary = z_pliku(a.plik)
    else:
        with rasterio.open(wyniki / "CHM.tif") as r:
            obszary = [("cały obszar analizy ALS", box(*r.bounds))]

    wiersze = []
    for nazwa, geom in obszary:
        geom = geom.buffer(0)
        if geom.is_empty or geom.area < 1:
            print(f"\n{nazwa}: obrys nie tworzy zamkniętego wieloboku, pomijam")
            continue
        w = policz(geom, wyniki, drzewa)
        bdl = None if (a.bez_bdl or a.caly) else bdl_wydzielenia(geom)
        raport(nazwa, w, bdl)
        wiersze.append((nazwa, w))
    if len(wiersze) > 1:
        s = {k: sum(w[k] for _, w in wiersze)
             for k in ("pow_dzialki_ha", "las_ha", "drzewa", "V_drzewa", "V_B")}
        lo, hi = sorted([s["V_drzewa"], s["V_B"]])
        print(f"\nRAZEM {len(wiersze)} obszarów: {s['pow_dzialki_ha']:.2f} ha, las "
              f"{s['las_ha']:.2f} ha, {s['drzewa']} drzew, ok. {lo:.0f}-{hi:.0f} m3")
    zapisz(wyniki, wiersze, obszary)


if __name__ == "__main__":
    main()
