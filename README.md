# GIS Portfolio – Karol Pietruszka

**Geospatial Data Analyst & Forest Engineer** · Vienna, Austria

👉 **Live site: [karolpiet.github.io/Portfolio](https://karolpiet.github.io/Portfolio/)**

I combine more than 10 years of experience in forestry and forest inventory with GIS, remote sensing and Python. My work focuses on LiDAR point cloud processing, satellite imagery analysis (Sentinel-2, Google Earth Engine) and automated geospatial workflows for forest and land management. Postgraduate education: UNIGIS Geographic Information Systems (Jagiellonian University) and, currently, Geomatics and Artificial Intelligence in Forestry (Forest Research Institute).

Open to **remote** and **on-site** opportunities in spatial analysis, remote sensing, LiDAR and cartography.

---

## 🗂 Projects

| Project | What it shows | Tools |
|---|---|---|
| [**Forest Inventory from Airborne LiDAR**](https://karolpiet.github.io/Portfolio/Projects/ALS_Forest_Inventory/index.html) | 70,554 trees, canopy height, crown closure and timber volume for a 255 ha pine forest from national ALS data, with an in-browser calculator for any cadastral parcel | Python, laspy, rasterio, scikit-image, Leaflet, three.js |
| [**LidarTreeSegmenter**](https://karolpiet.github.io/Portfolio/Projects/Lidar_Tree_Segmenter/index.html) *(work in progress)* | Tree detection, segmentation and DBH / height / volume estimation from terrestrial and mobile LiDAR point clouds. [Source code](https://github.com/karolpiet/LidarTreeSegmenter) | Python, laspy, NumPy, scikit-learn, three.js |
| [**Bohemian Switzerland Fire Severity**](https://karolpiet.github.io/Portfolio/Projects/Forest_Fire_Bohemian/index.html) | dNBR burn severity mapping of the 2022 wildfire in Bohemian Switzerland National Park, restricted to forest pixels | Google Earth Engine, Sentinel-2, geemap |
| [**Tuchola Forest Land Cover Change**](https://karolpiet.github.io/Portfolio/Projects/Tuchola/index.html) | Land cover classification and NDVI change detection (2015–2019) after the 2017 windstorm, with an interactive web map | ERDAS Imagine, Sentinel-2, Leaflet |
| [**Coastal Flood Risk**](https://karolpiet.github.io/Portfolio/Projects/Flood_Risk/index.html) | Population at risk from a 5 m sea level rise on the Polish coast | ArcGIS Pro, Spatial Analyst, EU-DEM, GHSL |
| [**Bicycle Accessibility – Wrocław**](https://karolpiet.github.io/Portfolio/Projects/Bike_Accessibility/index.html) | Network analysis of 5, 10 and 15-minute cycling ranges to railway stations | ArcGIS Pro (Service Area), OpenStreetMap |

---

## ⚙️ Skills

- **GIS & Remote Sensing:** ArcGIS Pro, ArcMap, QGIS, ERDAS Imagine, Google Earth Engine, Sentinel-2 (NDVI, NBR / dNBR), classification and change detection, network analysis
- **LiDAR:** point cloud filtering and classification, DTM / DSM, terrestrial and mobile scans, tree segmentation
- **Programming:** Python (ArcPy, GeoPandas, Pandas, NumPy, Rasterio, Shapely, GDAL, laspy, scikit-learn), SQL, Jupyter
- **Web:** HTML, CSS, JavaScript (Leaflet, three.js), Git & GitHub

---

## 🌐 About this website

A static site hosted on GitHub Pages, written in plain HTML, CSS and JavaScript (no framework).

- Three languages: English, Polish and German (language switcher, remembered between visits)
- Interactive Leaflet map with GeoJSON layers (Tuchola project)
- Contact form via EmailJS
- Downloadable CV (PDF)

```
index.html              main page
style.css               base styles
theme-topo.css          "topographic map" theme
script.js               translations, navigation, contact form
Karol_Pietruszka_CV.pdf CV
Projects/<name>/        one folder per project: index.html, styles, scripts, Data/
```

To view it locally, run a simple web server in the repository folder (the Tuchola map loads its data with `fetch`, which does not work when the file is opened directly):

```
python -m http.server
```

and open <http://localhost:8000>.

---

## 💬 Contact

- 📧 karolpietruszka88@gmail.com
- 💼 [LinkedIn](https://linkedin.com/in/karol-pietruszka-8b4645236/)
- 🌍 [Portfolio](https://karolpiet.github.io/Portfolio/)
