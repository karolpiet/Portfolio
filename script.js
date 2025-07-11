




// Language switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const elementsToTranslate = document.querySelectorAll('.lang');

    // Translations dictionary
    const translations = {
        'en': {
            'home': 'Home',
            'about': 'About',
            'cv': 'My carrier',
            'projects': 'Projects',
            'contact': 'Contact',
            'hero-title': 'GIS & Remote Sensing for Forest and Land Use',
            'hero-subtitle': 'Welcome to my portfolio. Here you will find spatial projects blending technology and terrain',
            'cta-button': 'View my projects',
            'about-title': 'About Me',
            'about-text-1': 'As an experienced forest surveyor and GIS specialist, I combine traditional forestry knowledge with modern spatial technologies. I have over 10 years of practical experience in forest inventories, spatial data processing, and remote sensing.',
            'about-text-2': 'My education in Forest Management, complemented by postgraduate studies in Geographic Information Systems (UNIGIS), has equipped me with theoretical knowledge and practical skills to solve complex spatial problems.',
            'about-text-3': 'I am passionate about innovative solutions that leverage technology to better understand and manage our natural resources.',
            'about-text-4': 'My interests include developing GIS tools, forest ecosystems, and motorcycle adventures off the beaten path.',
            'cv-title': 'Curriculum Vitae',
            'cv-brief-title': 'Professional Summary',
            'cv-brief-text': 'Forest Tech Specialist with 10+ years experience in GIS, spatial analysis, and forest management. Expertise in LiDAR processing, Python automation, and remote sensing applications for sustainable forestry.',
            'download-cv': 'Download Full CV',
            'view-cv': 'View Full CV',
            'cv-subtitle': 'Forest & GIS Specialist',
            'cv-experience': '10+ years of experience in forest management and spatial analysis',
            'work-experience': 'Work Experience',
            'exp1-date': 'Jul 2024 - Present',
            'exp1-company': 'Umweltdata',
            'exp1-desc': 'Forest inventory, map production, GIS solutions, orthophoto and satellite imagery processing.',
            'exp2-date': 'Mar 2024 - Jul 2024',
            'exp2-company': 'Vicena, Vienna',
            'exp2-desc': 'Garden design and maintenance.',
            'exp3-date': 'Oct 2015 - Apr 2023',
            'exp3-company': 'The Bureau for Forest Management and Geodesy, Kraków',
            'exp3-role': 'Forest Surveyor: inventories, maps, spatial analysis',
            'exp3-gis': 'GIS and remote sensing (LiDAR, ArcMap, QGIS)',
            'exp3-projects': 'Projects: National Forest Inventory, Biostrateg, Beskidy Monitoring',
            'education-title': 'Education',
            'edu1-date': '2022 - 2023',
            'edu1-school': 'Jagiellonian University, Kraków',
            'edu1-desc': 'Postgraduate studies - UNIGIS Geographic Information Systems',
            'edu2-date': '2010 - 2016',
            'edu2-school': 'University of Agriculture, Kraków',
            'edu2-desc': 'BSc/MSc in Forest Management',
            'skills-title': 'Skills',
            'skills-gis': 'GIS & Spatial',
            'skills-gis1': 'ArcMap, ArcGIS Pro, QGIS',
            'skills-gis2': 'LiDAR processing',
            'skills-gis3': 'Spatial analysis',
            'skills-gis4': 'Map composition',
            'skills-gis5': 'Spatial databases',
            'skills-prog': 'Programming',
            'skills-prog1': 'Python (ArcPy, Pandas, Numpy)',
            'skills-prog2': 'Jupyter, SQL, Shapely, Rasterio',
            'skills-prog3': 'JavaScript basics',
            'skills-lang': 'Languages',
            'lang-en': 'English - Intermediate',
            'lang-de': 'German - Basic',
            'lang-pl': 'Polish - Native',
            'skills-other': 'Other',
            'skills-other1': 'MS Office, Project management',
            'skills-other2': 'Team collaboration',
            'skills-other3': 'Driving licenses A, B, C',
            'projects-title': 'Projects',
            'project1-title': 'Forest Inventory System',
            'project1-desc': 'Comprehensive system for managing forest inventory using spatial data and satellite analysis.',
            'project2-title': 'Spatial Analysis Toolkit',
            'project2-desc': 'Set of Python scripts for automating spatial data processing and generating forest reports.',
            'project3-title': 'Forest Atlas',
            'project3-desc': 'Interactive forest atlas presenting the diversity of forest ecosystems using WebGIS technology.',
            'project4-title': 'Forest Health Monitoring',
            'project4-desc': 'Satellite-based system for monitoring forest health and detecting disease outbreaks.',
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
            'cv-brief-text': 'Specjalista Technologii Leśnych z 10+ letnim doświadczeniem w GIS, analizie przestrzennej i zarządzaniu lasami. Ekspert w przetwarzaniu LiDAR, automatyzacji Python i zastosowaniach teledetekcji w zrównoważonej leśnictwie.',
            'download-cv': 'Pobierz Pełne CV',
            'view-cv': 'Zobacz Pełne CV',
            'cv-subtitle': 'Specjalista Leśny & GIS',
            'cv-experience': '10+ lat doświadczenia w zarządzaniu lasem i analizach przestrzennych',
            'work-experience': 'Doświadczenie zawodowe',
            'exp1-date': 'Lip 2024 – Obecnie',
            'exp1-company': 'Umweltdata',
            'exp1-desc': 'Inwentaryzacja lasów, produkcja map, rozwiązania GIS, przetwarzanie ortofotomap i obrazów satelitarnych.',
            'exp2-date': 'Mar 2024 – Lip 2024',
            'exp2-company': 'Vicena, Wiedeń',
            'exp2-desc': 'Projektowanie i utrzymanie terenów zielonych.',
            'exp3-date': 'Paź 2015 – Kwi 2023',
            'exp3-company': 'Biuro Urządzania Lasu i Geodezji Leśnej, Kraków',
            'exp3-role': 'Geodeta leśny: inwentaryzacje, mapy, analizy przestrzenne',
            'exp3-gis': 'GIS i teledetekcja (LiDAR, ArcMap, QGIS)',
            'exp3-projects': 'Projekty: Narodowa Inwentaryzacja Lasów, Biostrateg, Monitoring Beskidów',
            'education-title': 'Edukacja',
            'edu1-date': '2022 – 2023',
            'edu1-school': 'Uniwersytet Jagielloński, Kraków',
            'edu1-desc': 'Studia podyplomowe – UNIGIS Systemy Informacji Geograficznej',
            'edu2-date': '2010 – 2016',
            'edu2-school': 'Uniwersytet Rolniczy, Kraków',
            'edu2-desc': 'Inżynier/Magister Urządzania Lasu',
            'skills-title': 'Umiejętności',
            'skills-gis': 'GIS & Przestrzeń',
            'skills-gis1': 'ArcMap, ArcGIS Pro, QGIS',
            'skills-gis2': 'Przetwarzanie LiDAR',
            'skills-gis3': 'Analizy przestrzenne',
            'skills-gis4': 'Kompozycja map',
            'skills-gis5': 'Bazy danych przestrzennych',
            'skills-prog': 'Programowanie',
            'skills-prog1': 'Python (ArcPy, Pandas, Numpy)',
            'skills-prog2': 'Jupyter, SQL, Shapely, Rasterio',
            'skills-prog3': 'Podstawy JavaScript',
            'skills-lang': 'Języki',
            'lang-en': 'Angielski – B2',
            'lang-de': 'Niemiecki – A2',
            'lang-pl': 'Polski – ojczysty',
            'skills-other': 'Inne',
            'skills-other1': 'MS Office, Zarządzanie projektami',
            'skills-other2': 'Praca zespołowa',
            'skills-other3': 'Prawo jazdy kat. A, B, C',
            'projects-title': 'Projekty',
            'project1-title': 'System Inwentaryzacji Lasu',
            'project1-desc': 'Kompleksowy system do zarządzania inwentaryzacją leśną z wykorzystaniem danych przestrzennych i analiz satelitarnych.',
            'project2-title': 'Narzędzia Analizy Przestrzennej',
            'project2-desc': 'Zestaw skryptów Python do automatyzacji przetwarzania danych przestrzennych i generowania raportów leśnych.',
            'project3-title': 'Atlas Leśny',
            'project3-desc': 'Interaktywny atlas leśny prezentujący różnorodność ekosystemów leśnych z wykorzystaniem technologii WebGIS.',
            'project4-title': 'Monitoring Zdrowia Lasu',
            'project4-desc': 'System satelitarny do monitorowania zdrowia lasu i wykrywania ognisk chorób.',
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
            'cv-brief-text': 'Forsttechnologie-Spezialist mit mehr als 10 Jahren Erfahrung in GIS, räumlicher Analyse und Forstwirtschaft. Expertise in LiDAR-Verarbeitung, Python-Automatisierung und Fernerkundungsanwendungen für nachhaltige Forstwirtschaft.',
            'download-cv': 'Vollständigen Lebenslauf herunterladen',
            'view-cv': 'Vollständigen Lebenslauf ansehen',
            'cv-subtitle': 'Forst- und GIS-Spezialist',
            'cv-experience': '10+ Jahre Erfahrung in Forstwirtschaft und räumlicher Analyse',
            'work-experience': 'Berufserfahrung',
            'exp1-date': 'Juli 2024 - Heute',
            'exp1-company': 'Umweltdata',
            'exp1-desc': 'Waldinventur, Kartenproduktion, GIS-Lösungen, Verarbeitung von Orthofotos und Satellitenbildern.',
            'exp2-date': 'März 2024 - Juli 2024',
            'exp2-company': 'Vicena, Wien',
            'exp2-desc': 'Gartengestaltung und -pflege.',
            'exp3-date': 'Okt 2015 - Apr 2023',
            'exp3-company': 'Büro für Forsteinrichtung und Forstvermessung, Krakau',
            'exp3-role': 'Forstvermessungsingenieur: Inventuren, Karten, räumliche Analysen',
            'exp3-gis': 'GIS und Fernerkundung (LiDAR, ArcMap, QGIS)',
            'exp3-projects': 'Projekte: Nationale Waldinventur, Biostrateg, Beskiden-Monitoring',
            'education-title': 'Ausbildung',
            'edu1-date': '2022 - 2023',
            'edu1-school': 'Jagiellonen-Universität, Krakau',
            'edu1-desc': 'Postgraduales Studium - UNIGIS Geoinformationssysteme',
            'edu2-date': '2010 - 2016',
            'edu2-school': 'Landwirtschaftliche Universität, Krakau',
            'edu2-desc': 'BSc/MSc in Forsteinrichtung',
            'skills-title': 'Fähigkeiten',
            'skills-gis': 'GIS & Raum',
            'skills-gis1': 'ArcMap, ArcGIS Pro, QGIS',
            'skills-gis2': 'LiDAR-Verarbeitung',
            'skills-gis3': 'Räumliche Analyse',
            'skills-gis4': 'Kartenerstellung',
            'skills-gis5': 'Räumliche Datenbanken',
            'skills-prog': 'Programmierung',
            'skills-prog1': 'Python (ArcPy, Pandas, Numpy)',
            'skills-prog2': 'Jupyter, SQL, Shapely, Rasterio',
            'skills-prog3': 'JavaScript Grundlagen',
            'skills-lang': 'Sprachen',
            'lang-en': 'Englisch - B2',
            'lang-de': 'Niemiecki - A2',
            'lang-pl': 'Polnisch - Muttersprache',
            'skills-other': 'Andere',
            'skills-other1': 'MS Office, Projektmanagement',
            'skills-other2': 'Teamarbeit',
            'skills-other3': 'Führerscheine A, B, C',
            'projects-title': 'Projekte',
            'project1-title': 'Waldinventursystem',
            'project1-desc': 'Umfassendes System zur Verwaltung der Waldinventur unter Verwendung räumlicher Daten und Satellitenanalyse.',
            'project2-title': 'Toolkit für räumliche Analysen',
            'project2-desc': 'Satz von Python-Skripten zur Automatisierung der räumlichen Datenverarbeitung und Generierung von Forstberichten.',
            'project3-title': 'Waldatlas',
            'project3-desc': 'Interaktiver Waldatlas, der die Vielfalt der Waldökosysteme mit WebGIS-Technologie präsentiert.',
            'project4-title': 'Überwachung der Waldgesundheit',
            'project4-desc': 'Satellitengestütztes System zur Überwachung der Waldgesundheit und Erkennung von Krankheitsausbrüchen.',
            'project-link': 'Details ansehen →',
            'contact-title': 'Kontakt',
            'email': 'E-Mail',
            'phone': 'Telefon',
            'location': 'Standort',
            'city': 'Wien, Osterreich',
            'send-message': 'Nachricht senden',
            'name': 'Vollständiger Name',
            'email-field': 'E-Mail',
            'subject': 'Betreff',
            'message': 'Nachricht',
            'submit-btn': 'Nachricht senden',
            'footer-text': 'Forstliche Geoinformatik & Raumtechnologien'
        }
    };

    // Set default language to English
    let currentLang = 'en';

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
    }
                
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

    // POPRAWIONA FUNKCJONALNOŚĆ MODALA
    const modal = document.getElementById('cv-modal');
    const viewCvBtn = document.querySelector('.cv-view-btn');
    const closeModal = document.querySelector('.close-modal');

    // Otwieranie modala
    if (viewCvBtn) {
        viewCvBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Zamykanie modala przyciskiem X
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Zamykanie modala kliknięciem poza obszarem
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

    
    
    
    
//To MOja Java do filmu 


const videoElement = document.querySelector('video');

if (videoElement) {
    // Ustaw płynną prędkość odtwarzania
    video.playbackRate = 1.0;
    
    // Optymalizacja dla różnych przeglądarek
    const setPlaybackRate = () => {
        try {
            video.playbackRate = 1.0;
            
            // Dodatkowe ustawienia dla Safari
            if (typeof video.webkitSetPlaybackRate === 'function') {
                video.webkitSetPlaybackRate(1.0);
            }
        } catch(e) {
            console.log("Playback rate error:", e);
        }
    };

    // Ustaw przy kilku okazjach
    setPlaybackRate();
    video.addEventListener('loadedmetadata', setPlaybackRate);
    video.addEventListener('canplay', setPlaybackRate);
    video.addEventListener('play', setPlaybackRate);
    
    // Wymuś odświeżenie dla Safari
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        video.addEventListener('play', function() {
            this.pause();
            this.play();
        });
    }
}


    // Java do maila
// Email EmailJS 




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
      .then(() => alert('Wysłano!'))
      .catch(err => alert('Błąd: ' + err.text));
  });
});

    

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    // Usuń active ze wszystkich
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    // Dodaj active do klikniętego
    this.classList.add('active');
  });
});

// Działanie przycisków od CV

document.querySelector('.cv-download-btn').addEventListener('click', function(e) {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = 'files/cv_full.pdf';
    link.download = 'cv_full.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

document.querySelector('.cv-view-btn').addEventListener('click', function(e) {
    e.preventDefault();
    window.open('files/cv_full.pdf', '_blank');
});
