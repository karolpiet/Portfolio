"""
Krok 5: projekt QGIS z wynikami + warstwy WMS z internetu.

Jak uruchomić: w QGIS menu Wtyczki > Konsola Pythona > ikona "Pokaż edytor",
otwórz ten plik i kliknij "Uruchom". Wcześniej popraw FOLDER poniżej,
jeśli trzymasz wyniki gdzie indziej.

WMS (Web Map Service) to mapa podawana przez serwer jako obrazek "na żądanie":
QGIS pyta o kawałek mapy w danym zasięgu i dostaje gotowy obrazek. Nic nie
pobierasz na dysk, ale potrzebny jest internet.
"""
from pathlib import Path

from qgis.core import (QgsCoordinateReferenceSystem, QgsProject, QgsRasterLayer,
                       QgsVectorLayer)

FOLDER = Path(r"D:\LIDAR\ALS_pierwsze_kroki\Wierzchowiska_las\analiza_claude\wyniki")
proj = QgsProject.instance()
proj.setCrs(QgsCoordinateReferenceSystem("EPSG:2180"))


def wms(name, url, layers, fmt="image/png", styles=""):
    uri = (f"contextualWMSLegend=0&crs=EPSG:2180&dpiMode=7&format={fmt}"
           f"&layers={layers}&styles={styles}&url={url}")
    lyr = QgsRasterLayer(uri, name, "wms")
    if lyr.isValid():
        proj.addMapLayer(lyr)
        print("dodano:", name)
    else:
        print("NIE udało się dodać:", name, "- sprawdź internet albo adres w Warstwa > Dodaj WMS")
    return lyr


# --- warstwy z internetu (od spodu) --------------------------------------
# Ortofotomapa z Geoportalu (aktualna). Porównaj z koronami z CHM.
wms("Ortofotomapa (Geoportal)",
    "https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/StandardResolution",
    "Raster", fmt="image/jpeg")
# Cieniowanie oficjalnego NMT - porównaj ze swoim DTM.
wms("Cieniowanie NMT (Geoportal)",
    "https://mapy.geoportal.gov.pl/wss/service/PZGIK/NMT/GRID1/WMS/ShadedRelief",
    "Raster")
# Działki ewidencyjne z numerami (Krajowa Integracja Ewidencji Gruntów).
wms("Działki ewidencyjne (KIEG)",
    "https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaEwidencjiGruntow",
    "dzialki,numery_dzialek")

# Bank Danych o Lasach: wydzielenia leśne z gatunkiem panującym i wiekiem.
# To jest "prawda terenowa" do porównania z wysokościami drzew z lidaru.
# Nazwy warstw BDL bywają zmieniane, więc pobieramy listę z serwera.
BDL = "https://mapserver.bdl.lasy.gov.pl/ArcGIS/services/WMS_BDL/mapserver/WMSServer"
try:
    from owslib.wms import WebMapService
    w = WebMapService(BDL, version="1.3.0")
    names = [n for n, l in w.contents.items() if "wydziel" in (l.title or "").lower()]
    print("warstwy BDL z 'wydziel' w nazwie:", [w.contents[n].title for n in names])
    if names:
        wms("BDL - wydzielenia", BDL, names[0])
except Exception as e:
    print("BDL: dodaj ręcznie przez Warstwa > Dodaj warstwę WMS, adres:", BDL, "|", e)

# --- twoje wyniki (na wierzchu) ------------------------------------------
for name in ("DTM.tif", "DSM.tif", "CHM.tif"):
    p = FOLDER / name
    if p.exists():
        lyr = QgsRasterLayer(str(p), name.replace(".tif", ""))
        proj.addMapLayer(lyr)
        lyr.setOpacity(0.7)

csv = FOLDER / "drzewa.csv"
if csv.exists():
    uri = (f"file:///{csv.as_posix()}?type=csv&delimiter=;&xField=x&yField=y"
           f"&crs=EPSG:2180&detectTypes=yes")
    trees = QgsVectorLayer(uri, "drzewa (wierzchołki)", "delimitedtext")
    proj.addMapLayer(trees)
    print("drzew:", trees.featureCount())

print("Gotowe. Przybliż się do lasu (skala ok. 1:2000) - WMS-y rysują się dopiero przy zbliżeniu.")
