// Language switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const elementsToTranslate = document.querySelectorAll('.lang');

    // Translations dictionary
    const translations = {
        'en': {
            'home': 'Home',
            'about': 'About',
            'cv': 'My career',
            'projects': 'Projects',
            'contact': 'Contact',
            'hero-title': 'GIS & Remote Sensing for Forest and Land Use',
            'hero-subtitle': 'Welcome to my portfolio. Here you will find spatial projects blending technology and terrain.',
            'cta-button': 'View my projects',
            'about-title': 'About Me',
            'about-text-1': 'As an experienced forest surveyor and GIS specialist, I combine traditional forestry knowledge with modern spatial technologies. I have over 10 years of practical experience in forest inventories, spatial data processing, and remote sensing.',
            'about-text-2': 'My education in Forest Management, complemented by postgraduate studies in Geographic Information Systems (UNIGIS), has equipped me with theoretical knowledge and practical skills to solve complex spatial problems.',
            'about-text-3': 'I am passionate about innovative solutions that leverage technology to better understand and manage our natural resources.',
            'about-text-4': 'My interests include developing GIS tools, forest ecosystems, and motorcycle adventures off the beaten path.',
            'cv-title': 'Curriculum Vitae',
            'cv-brief-title': 'Professional Summary',
            'cv-brief-text': 'Geospatial data analyst and forest engineer with over 10 years of experience in forestry, spatial data analysis and remote sensing. Focus on LiDAR point cloud processing, satellite imagery analysis, automated Python workflows and GIS-based forest management.',
            'download-cv': 'Download Full CV',
            'view-cv': 'View CV',
            'cv-subtitle': 'Geospatial Data Analyst & Forest Engineer',
            'cv-experience': '10+ years of experience in forestry, spatial analysis and remote sensing',
            'work-experience': 'Work Experience',
            'exp1-date': 'Jul 2024 – Present',
            'exp1-company': 'Umweltdata GmbH, Austria',
            'exp1-role': 'GIS Technologist & Forest Assessor',
            'exp1-desc': 'Processing and validating large geospatial datasets for digital forest maps, management models and district plans; GIS solutions based on orthophotos and satellite imagery; quality control of forestry field data.',
            'exp2-date': 'Mar 2024 – Jul 2024',
            'exp2-company': 'Vicena, Vienna',
            'exp2-role': 'Landscape & Garden Design Technician',
            'exp2-desc': 'Urban garden layouts and green area maintenance.',
            'exp3-date': 'Oct 2015 – Apr 2023',
            'exp3-company': 'Bureau for Forest Management and Geodesy, Kraków',
            'exp3-role': 'Geospatial Data Analyst & Forest Assessor',
            'exp3-desc': 'Automated LiDAR point cloud filtering and classification to generate DTM/DSM; forest road network design in ArcMap and QGIS; geodata quality management and maps for the National Forest Inventory, Biostrateg and Monitoring Beskidy.',
            'exp4-date': 'Aug 2013 – Sep 2015',
            'exp4-company': 'Taxus SI, Poland',
            'exp4-role': 'Forest Management Specialist / Assessor',
            'exp4-desc': 'Field work on full and simplified forest inventories and spatial data collection.',
            'exp5-date': 'Nov 2012 – Aug 2013',
            'exp5-company': 'SMREK, Poland',
            'exp5-role': 'Green Space Development Specialist',
            'exp5-desc': 'Planning and arranging urban and rural green areas.',
            'exp6-date': 'Oct 2011 – Oct 2012',
            'exp6-company': 'State Forests, Daleszyce Forest District',
            'exp6-role': 'Graduate Forestry Intern',
            'exp6-desc': 'Forest administration, silviculture, timber harvesting and logistics.',
            'education-title': 'Education',
            'edu1-date': '2026 – present',
            'edu1-school': 'Forest Research Institute, Poland',
            'edu1-desc': 'Postgraduate studies – Geomatics and Artificial Intelligence in Forestry',
            'edu2-date': '2022 – 2023',
            'edu2-school': 'Jagiellonian University, Kraków',
            'edu2-desc': 'Postgraduate diploma – UNIGIS Geographic Information Systems',
            'edu3-date': '2010 – 2016',
            'edu3-school': 'University of Agriculture, Kraków',
            'edu3-desc': 'Engineer in Forestry (Forest Management)',
            'edu4-date': '2004 – 2008',
            'edu4-school': 'Forest Technical School, Bałtów',
            'edu4-desc': 'Certified Forest Technician',
            'skills-title': 'Skills',
            'skills-gis': 'GIS & Remote Sensing',
            'skills-gis1': 'ArcGIS Pro, ArcMap, QGIS, ERDAS Imagine',
            'skills-gis2': 'Google Earth Engine, Sentinel-2 (NDVI, NBR / dNBR)',
            'skills-gis3': 'Image classification and change detection',
            'skills-gis4': 'Spatial and network analysis (Spatial Analyst, Service Area)',
            'skills-gis5': 'Map composition and spatial databases',
            'skills-lidar': 'LiDAR',
            'skills-lidar1': 'LiDAR data for terrain and forest structure',
            'skills-lidar2': 'Terrestrial / mobile point clouds (.las / .laz)',
            'skills-lidar3': 'Tree detection, segmentation and DBH measurement',
            'skills-prog': 'Programming',
            'skills-prog1': 'Python (ArcPy, NumPy, Pandas, geemap)',
            'skills-prog2': 'GDAL, Rasterio, Shapely, laspy, scikit-learn',
            'skills-prog3': 'SQL, Jupyter Notebook',
            'skills-prog4': 'JavaScript (Leaflet, three.js), HTML / CSS, Git',
            'skills-lang': 'Languages',
            'lang-en': 'English – B2',
            'lang-de': 'German – A2',
            'lang-pl': 'Polish – native',
            'skills-other': 'Other',
            'skills-other1': 'Spatial data quality control, automated cartography',
            'skills-other2': 'Independent project management, teamwork',
            'skills-other3': 'Driving licence A, B, C',
            'skills-other4': 'ESRI Academy courses, MS Office',
            'projects-title': 'Projects',
            'project1-title': 'Tuchola Forest Land Cover Analysis',
            'project1-desc': 'Advanced GIS and remote sensing analysis of forest dynamics between 2015-2019.',
            'project2-title': 'Spatial Analysis Toolkit',
            'project2-desc': 'Population estimation in areas at risk of flooding due to sea level rise.',
            'project3-title': 'Bicycle Accessibility',
            'project3-desc': 'A network analysis showing the bicycle travel range to main railway stations in Wrocław within 5, 10, and 15 minutes.',
            'project4-title': 'Bohemian Switzerland Fire Severity Analysis',
            'project4-desc': 'Sentinel-2 and Google Earth Engine burn severity mapping of the 2022 wildfire in Bohemian Switzerland National Park.',
            'project5-title': 'LidarTreeSegmenter',
            'project5-desc': 'Work-in-progress Python tool for detecting and segmenting trees in terrestrial LiDAR scans and measuring DBH, height and volume.',
            'project-link': 'View details →',
            'contact-title': 'Contact',
            'email': 'Email',
            'phone': 'Phone',
            'location': 'Location',
            'city': 'Vienna, Austria',
            'send-message': 'Send a message',
            'name': 'Full Name',
            'email-field': 'Email',
            'subject': 'Subject',
            'message': 'Message',
            'submit-btn': 'Send Message',
            'footer-text': 'Forest Geoinformatics & Spatial Technologies'
        },
        'pl': {
            'home': 'Strona główna',
            'about': 'O mnie',
            'cv': 'Kariera',
            'projects': 'Projekty',
            'contact': 'Kontakt',
            'hero-title': 'Geoinformatyka Leśna & Technologie Przestrzenne',
            'hero-subtitle': 'Łączę wiedzę leśną z nowoczesnymi technologiami GIS',
            'cta-button': 'Zobacz moje projekty',
            'about-title': 'O mnie',
            'about-text-1': 'Jako doświadczony leśnik i specjalista GIS, łączę tradycyjną wiedzę leśną z nowoczesnymi technologiami przestrzennymi. Posiadam ponad 10 lat praktycznego doświadczenia w inwentaryzacji lasów, przetwarzaniu danych przestrzennych i teledetekcji.',
            'about-text-2': 'Moje wykształcenie w dziedzinie Urządzania Lasu, uzupełnione o studia podyplomowe w zakresie Systemów Informacji Geograficznej (UNIGIS), wyposażyło mnie w wiedzę teoretyczną i praktyczne umiejętności potrzebne do rozwiązywania złożonych problemów przestrzennych.',
            'about-text-3': 'Jestem pasjonatem innowacyjnych rozwiązań, które wykorzystują technologię do lepszego poznawania i zarządzania naszymi zasobami naturalnymi.',
            'about-text-4': 'Moje zainteresowania obejmują rozwój narzędzi GIS, ekosystemy leśne oraz motocyklowe podróże po bezdrożach.',
            'cv-title': 'Curriculum Vitae',
            'cv-brief-title': 'Podsumowanie Zawodowe',
            'cv-brief-text': 'Analityk danych przestrzennych i inżynier leśnik z ponad 10-letnim doświadczeniem w leśnictwie, analizie danych przestrzennych i teledetekcji. Specjalizuję się w przetwarzaniu chmur punktów LiDAR, analizie zdjęć satelitarnych, automatyzacji w Pythonie i GIS w urządzaniu lasu.',
            'download-cv': 'Pobierz Pełne CV',
            'view-cv': 'Zobacz Pełne CV',
            'cv-subtitle': 'Analityk danych przestrzennych i inżynier leśnik',
            'cv-experience': 'Ponad 10 lat doświadczenia w leśnictwie, analizach przestrzennych i teledetekcji',
            'work-experience': 'Doświadczenie zawodowe',
            'exp1-date': 'Lip 2024 – obecnie',
            'exp1-company': 'Umweltdata GmbH, Austria',
            'exp1-role': 'Technolog GIS i taksator',
            'exp1-desc': 'Przetwarzanie i walidacja dużych zbiorów danych przestrzennych do cyfrowych map leśnych, modeli gospodarczych i planów urządzeniowych; rozwiązania GIS oparte na ortofotomapach i zdjęciach satelitarnych; kontrola jakości danych terenowych.',
            'exp2-date': 'Mar 2024 – Lip 2024',
            'exp2-company': 'Vicena, Wiedeń',
            'exp2-role': 'Technik projektowania terenów zielonych',
            'exp2-desc': 'Zakładanie ogrodów miejskich i utrzymanie terenów zielonych.',
            'exp3-date': 'Paź 2015 – Kwi 2023',
            'exp3-company': 'Biuro Urządzania Lasu i Geodezji Leśnej, Kraków',
            'exp3-role': 'Analityk danych przestrzennych i taksator',
            'exp3-desc': 'Automatyzacja filtrowania i klasyfikacji chmur punktów LiDAR do generowania NMT/NMPT; projektowanie sieci dróg leśnych w ArcMap i QGIS; kontrola jakości geodanych i mapy dla Wielkoobszarowej Inwentaryzacji Stanu Lasu, programu Biostrateg i Monitoringu Beskidów.',
            'exp4-date': 'Sie 2013 – Wrz 2015',
            'exp4-company': 'Taxus SI, Polska',
            'exp4-role': 'Specjalista urządzania lasu / taksator',
            'exp4-desc': 'Prace terenowe przy pełnych i uproszczonych inwentaryzacjach lasu oraz zbieranie danych przestrzennych.',
            'exp5-date': 'Lis 2012 – Sie 2013',
            'exp5-company': 'SMREK, Polska',
            'exp5-role': 'Specjalista ds. terenów zielonych',
            'exp5-desc': 'Planowanie i urządzanie terenów zielonych w miastach i na wsi.',
            'exp6-date': 'Paź 2011 – Paź 2012',
            'exp6-company': 'Lasy Państwowe, Nadleśnictwo Daleszyce',
            'exp6-role': 'Stażysta',
            'exp6-desc': 'Administracja leśna, hodowla lasu, pozyskanie drewna i logistyka.',
            'education-title': 'Edukacja',
            'edu1-date': '2026 – obecnie',
            'edu1-school': 'Instytut Badawczy Leśnictwa',
            'edu1-desc': 'Studia podyplomowe – Geomatyka i sztuczna inteligencja w leśnictwie',
            'edu2-date': '2022 – 2023',
            'edu2-school': 'Uniwersytet Jagielloński, Kraków',
            'edu2-desc': 'Studia podyplomowe – UNIGIS Systemy Informacji Geograficznej',
            'edu3-date': '2010 – 2016',
            'edu3-school': 'Uniwersytet Rolniczy, Kraków',
            'edu3-desc': 'Inżynier leśnictwa (urządzanie lasu)',
            'edu4-date': '2004 – 2008',
            'edu4-school': 'Technikum Leśne w Bałtowie',
            'edu4-desc': 'Technik leśnik',
            'skills-title': 'Umiejętności',
            'skills-gis': 'GIS i teledetekcja',
            'skills-gis1': 'ArcGIS Pro, ArcMap, QGIS, ERDAS Imagine',
            'skills-gis2': 'Google Earth Engine, Sentinel-2 (NDVI, NBR / dNBR)',
            'skills-gis3': 'Klasyfikacja obrazów i wykrywanie zmian',
            'skills-gis4': 'Analizy przestrzenne i sieciowe (Spatial Analyst, Service Area)',
            'skills-gis5': 'Kompozycja map i bazy danych przestrzennych',
            'skills-lidar': 'LiDAR',
            'skills-lidar1': 'Dane LiDAR do analizy terenu i struktury lasu',
            'skills-lidar2': 'Naziemne / mobilne chmury punktów (.las / .laz)',
            'skills-lidar3': 'Wykrywanie i segmentacja drzew, pomiar pierśnicy',
            'skills-prog': 'Programowanie',
            'skills-prog1': 'Python (ArcPy, NumPy, Pandas, geemap)',
            'skills-prog2': 'GDAL, Rasterio, Shapely, laspy, scikit-learn',
            'skills-prog3': 'SQL, Jupyter Notebook',
            'skills-prog4': 'JavaScript (Leaflet, three.js), HTML / CSS, Git',
            'skills-lang': 'Języki',
            'lang-en': 'Angielski – B2',
            'lang-de': 'Niemiecki – A2',
            'lang-pl': 'Polski – ojczysty',
            'skills-other': 'Inne',
            'skills-other1': 'Kontrola jakości danych przestrzennych, automatyzacja kartografii',
            'skills-other2': 'Samodzielne prowadzenie projektów, praca zespołowa',
            'skills-other3': 'Prawo jazdy kat. A, B, C',
            'skills-other4': 'Kursy ESRI Academy, MS Office',
            'projects-title': 'Projekty',
            'project1-title': 'Analiza pokrycia terenu w Borach Tucholskich',
            'project1-desc': 'Zaawansowana analiza GIS i teledetekcyjna zmian w lesie w latach 2015–2019.',
            'project2-title': 'Narzędzia Analizy Przestrzennej',
            'project2-desc': 'Szacowanie liczby ludności na terenach zagrożonych zalaniem w wyniku wzrostu poziomu morza.',
            'project3-title': 'Dostępność rowerowa',
            'project3-desc': 'Analiza sieciowa zasięgu dojazdu rowerem do głównych dworców kolejowych we Wrocławiu w ciągu 5, 10 i 15 minut.',
            'project4-title': 'Analiza Intensywności Pożaru w Czeskiej Szwajcarii',
            'project4-desc': 'Mapowanie intensywności pożaru z 2022 roku w Parku Narodowym Czeska Szwajcaria na podstawie danych Sentinel-2 i Google Earth Engine.',
            'project5-title': 'LidarTreeSegmenter',
            'project5-desc': 'Rozwijane narzędzie w Pythonie do wykrywania i segmentacji drzew w naziemnych skanach LiDAR oraz pomiaru pierśnicy, wysokości i miąższości.',
            'project-link': 'Zobacz szczegóły →',
            'contact-title': 'Kontakt',
            'email': 'Email',
            'phone': 'Telefon',
            'location': 'Lokalizacja',
            'city': 'Wiedeń, Austria',
            'send-message': 'Wyślij wiadomość',
            'name': 'Imię i Nazwisko',
            'email-field': 'Email',
            'subject': 'Temat',
            'message': 'Wiadomość',
            'submit-btn': 'Wyślij wiadomość',
            'footer-text': 'Geoinformatyka Leśna & Technologie Przestrzenne'
        },
        'de': {
            'home': 'Startseite',
            'about': 'Über mich',
            'cv': 'Lebenslauf',
            'projects': 'Projekte',
            'contact': 'Kontakt',
            'hero-title': 'GIS & Fernerkundung für Wald- und Landnutzung',
            'hero-subtitle': 'Kombination von forstlichem Wissen mit modernen GIS-Technologien',
            'cta-button': 'Meine Projekte ansehen',
            'about-title': 'Über mich',
            'about-text-1': 'Als erfahrener Forstvermessungsingenieur und GIS-Spezialist verbinde ich traditionelles forstliches Wissen mit modernen Raumtechnologien. Ich verfüge über mehr als 10 Jahre praktische Erfahrung in Waldinventur, räumlicher Datenverarbeitung und Fernerkundung.',
            'about-text-2': 'Meine Ausbildung in Forsteinrichtung, ergänzt durch ein postgraduales Studium in Geoinformationssystemen (UNIGIS), hat mich mit theoretischem Wissen und praktischen Fähigkeiten ausgestattet, um komplexe räumliche Probleme zu lösen.',
            'about-text-3': 'Ich bin leidenschaftlich an innovativen Lösungen interessiert, die Technologie nutzen, um unsere natürlichen Ressourcen besser zu verstehen und zu verwalten.',
            'about-text-4': 'Zu meinen Interessen gehören die Entwicklung von GIS-Tools, Waldökosysteme und Motorradabenteuer abseits der ausgetretenen Pfade.',
            'cv-title': 'Lebenslauf',
            'cv-brief-title': 'Berufliche Zusammenfassung',
            'cv-brief-text': 'Geodatenanalyst und Forstingenieur mit über 10 Jahren Erfahrung in Forstwirtschaft, räumlicher Datenanalyse und Fernerkundung. Schwerpunkte: Verarbeitung von LiDAR-Punktwolken, Satellitenbildanalyse, automatisierte Python-Workflows und GIS in der Forsteinrichtung.',
            'download-cv': 'Vollständigen Lebenslauf herunterladen',
            'view-cv': 'Vollständigen Lebenslauf ansehen',
            'cv-subtitle': 'Geodatenanalyst & Forstingenieur',
            'cv-experience': 'Über 10 Jahre Erfahrung in Forstwirtschaft, räumlicher Analyse und Fernerkundung',
            'work-experience': 'Berufserfahrung',
            'exp1-date': 'Juli 2024 – heute',
            'exp1-company': 'Umweltdata GmbH, Österreich',
            'exp1-role': 'GIS-Technologe & Forsteinrichter',
            'exp1-desc': 'Verarbeitung und Validierung großer Geodatensätze für digitale Forstkarten, Bewirtschaftungsmodelle und Revierpläne; GIS-Lösungen auf Basis von Orthofotos und Satellitenbildern; Qualitätskontrolle forstlicher Felddaten.',
            'exp2-date': 'März 2024 – Juli 2024',
            'exp2-company': 'Vicena, Wien',
            'exp2-role': 'Techniker für Landschafts- und Gartengestaltung',
            'exp2-desc': 'Anlage städtischer Gärten und Pflege von Grünflächen.',
            'exp3-date': 'Okt 2015 – Apr 2023',
            'exp3-company': 'Büro für Forsteinrichtung und Forstgeodäsie, Krakau',
            'exp3-role': 'Geodatenanalyst & Forsteinrichter',
            'exp3-desc': 'Automatisierte Filterung und Klassifizierung von LiDAR-Punktwolken zur Erstellung von DGM/DOM; Planung von Forstwegenetzen in ArcMap und QGIS; Geodaten-Qualitätsmanagement und Karten für die Nationale Waldinventur, Biostrateg und Monitoring Beskidy.',
            'exp4-date': 'Aug 2013 – Sep 2015',
            'exp4-company': 'Taxus SI, Polen',
            'exp4-role': 'Forsteinrichtungsspezialist',
            'exp4-desc': 'Feldarbeit bei vollständigen und vereinfachten Waldinventuren sowie Erfassung von Geodaten.',
            'exp5-date': 'Nov 2012 – Aug 2013',
            'exp5-company': 'SMREK, Polen',
            'exp5-role': 'Spezialist für Grünflächenentwicklung',
            'exp5-desc': 'Planung und Gestaltung städtischer und ländlicher Grünflächen.',
            'exp6-date': 'Okt 2011 – Okt 2012',
            'exp6-company': 'Staatsforsten, Forstbezirk Daleszyce',
            'exp6-role': 'Forstpraktikant',
            'exp6-desc': 'Forstverwaltung, Waldbau, Holzernte und Logistik.',
            'education-title': 'Ausbildung',
            'edu1-date': '2026 – heute',
            'edu1-school': 'Forstliches Forschungsinstitut, Polen',
            'edu1-desc': 'Postgraduales Studium – Geomatik und Künstliche Intelligenz in der Forstwirtschaft',
            'edu2-date': '2022 – 2023',
            'edu2-school': 'Jagiellonen-Universität, Krakau',
            'edu2-desc': 'Postgraduales Diplom – UNIGIS Geoinformationssysteme',
            'edu3-date': '2010 – 2016',
            'edu3-school': 'Landwirtschaftliche Universität, Krakau',
            'edu3-desc': 'Ingenieur der Forstwirtschaft (Forsteinrichtung)',
            'edu4-date': '2004 – 2008',
            'edu4-school': 'Forsttechnische Schule, Bałtów',
            'edu4-desc': 'Staatlich geprüfter Forsttechniker',
            'skills-title': 'Fähigkeiten',
            'skills-gis': 'GIS & Fernerkundung',
            'skills-gis1': 'ArcGIS Pro, ArcMap, QGIS, ERDAS Imagine',
            'skills-gis2': 'Google Earth Engine, Sentinel-2 (NDVI, NBR / dNBR)',
            'skills-gis3': 'Bildklassifikation und Veränderungserkennung',
            'skills-gis4': 'Räumliche und Netzwerkanalysen (Spatial Analyst, Service Area)',
            'skills-gis5': 'Kartenerstellung und räumliche Datenbanken',
            'skills-lidar': 'LiDAR',
            'skills-lidar1': 'LiDAR-Daten für Gelände- und Waldstrukturanalyse',
            'skills-lidar2': 'Terrestrische / mobile Punktwolken (.las / .laz)',
            'skills-lidar3': 'Baumerkennung, Segmentierung und BHD-Messung',
            'skills-prog': 'Programmierung',
            'skills-prog1': 'Python (ArcPy, NumPy, Pandas, geemap)',
            'skills-prog2': 'GDAL, Rasterio, Shapely, laspy, scikit-learn',
            'skills-prog3': 'SQL, Jupyter Notebook',
            'skills-prog4': 'JavaScript (Leaflet, three.js), HTML / CSS, Git',
            'skills-lang': 'Sprachen',
            'lang-en': 'Englisch – B2',
            'lang-de': 'Deutsch – A2',
            'lang-pl': 'Polnisch – Muttersprache',
            'skills-other': 'Andere',
            'skills-other1': 'Qualitätskontrolle von Geodaten, automatisierte Kartografie',
            'skills-other2': 'Selbstständiges Projektmanagement, Teamarbeit',
            'skills-other3': 'Führerschein A, B, C',
            'skills-other4': 'ESRI-Academy-Kurse, MS Office',
            'projects-title': 'Projekte',
            'project1-title': 'Landbedeckungsanalyse Tucheler Heide',
            'project1-desc': 'Fortgeschrittene GIS- und Fernerkundungsanalyse der Waldentwicklung 2015–2019.',
            'project2-title': 'Toolkit für räumliche Analysen',
            'project2-desc': 'Abschätzung der Bevölkerung in Gebieten, die durch den Meeresspiegelanstieg von Überflutung bedroht sind.',
            'project3-title': 'Fahrrad-Erreichbarkeit',
            'project3-desc': 'Netzwerkanalyse der Fahrrad-Erreichbarkeit der wichtigsten Bahnhöfe in Wrocław innerhalb von 5, 10 und 15 Minuten.',
            'project4-title': 'Brandschweregrad-Analyse Böhmische Schweiz',
            'project4-desc': 'Kartierung der Brandschwere des Waldbrands 2022 im Nationalpark Böhmische Schweiz mit Sentinel-2 und Google Earth Engine.',
            'project5-title': 'LidarTreeSegmenter',
            'project5-desc': 'Python-Tool in Entwicklung zur Erkennung und Segmentierung von Bäumen in terrestrischen LiDAR-Scans sowie zur Messung von BHD, Höhe und Volumen.',
            'project-link': 'Details ansehen →',
            'contact-title': 'Kontakt',
            'email': 'E-Mail',
            'phone': 'Telefon',
            'location': 'Standort',
            'city': 'Wien, Österreich',
            'send-message': 'Nachricht senden',
            'name': 'Vollständiger Name',
            'email-field': 'E-Mail',
            'subject': 'Betreff',
            'message': 'Nachricht',
            'submit-btn': 'Nachricht senden',
            'footer-text': 'Forstliche Geoinformatik & Raumtechnologien'
        }
    };

    // Default language: last choice saved in the browser, otherwise English
    let currentLang = 'en';
    try {
        const saved = localStorage.getItem('lang');
        if (saved && translations[saved]) currentLang = saved;
    } catch (e) {}

    // Language button click event
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            
            // Update active button
            langButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Translate page
            translatePage(lang);
            currentLang = lang;
            try { localStorage.setItem('lang', lang); } catch (e) {}
        });
    });

    // Function to translate the page
    function translatePage(lang) {
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('key');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
        document.documentElement.lang = lang;
        langButtons.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-lang') === lang));
    }

    if (currentLang !== 'en') translatePage(currentLang);
                
                // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    });
                
    // Smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Animation for project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Kliknięcie w dowolne miejsce karty projektu przenosi do projektu (tak samo jak "View details")
    projectCards.forEach(card => {
        const link = card.querySelector('.project-link');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        card.classList.add('clickable');
        card.addEventListener('click', e => {
            if (e.target.closest('a')) return; // the link itself already navigates
            if (e.ctrlKey || e.metaKey) {
                window.open(href, '_blank');
            } else {
                window.location.href = href;
            }
        });
    });
});

// Ustawienia odtwarzania wideo w tle

const videoElement = document.querySelector('video');

if (videoElement) {
    // Ustaw płynną prędkość odtwarzania
    videoElement.playbackRate = 1.0;

    // Optymalizacja dla różnych przeglądarek
    const setPlaybackRate = () => {
        try {
            videoElement.playbackRate = 1.0;

            // Dodatkowe ustawienia dla Safari
            if (typeof videoElement.webkitSetPlaybackRate === 'function') {
                videoElement.webkitSetPlaybackRate(1.0);
            }
        } catch(e) {
            console.log("Playback rate error:", e);
        }
    };

    // Ustaw przy kilku okazjach
    setPlaybackRate();
    videoElement.addEventListener('loadedmetadata', setPlaybackRate);
    videoElement.addEventListener('canplay', setPlaybackRate);
    videoElement.addEventListener('play', setPlaybackRate);
}

// Wysyłka formularza kontaktowego przez EmailJS
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const dane = {
      From_Name: document.getElementById('name').value,
      From_Email: document.getElementById('email').value,
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value
    };

    emailjs.send('service_2el6l2o', 'template_1fp413z', dane)
      .then(() => {
        const lang = document.documentElement.lang;
        alert(lang === 'pl' ? 'Wiadomość wysłana!' : lang === 'de' ? 'Nachricht gesendet!' : 'Message sent!');
        this.reset();
      })
      .catch(err => alert('Error: ' + (err && err.text ? err.text : err)));
  });
});

// Przyciski "Download Full CV" i "View CV" to zwykłe linki do Karol_Pietruszka_CV.pdf
// (działają natywnie przez href, nie potrzebują dodatkowej obsługi JS)
