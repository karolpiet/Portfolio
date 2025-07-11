document.addEventListener('DOMContentLoaded', function() {
  // 1. Initialize map without fixed center
  const map = L.map('main-map');

  // 2. Base layers
  const baseLayers = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }),
    "Aerial Imagery": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri, Maxar, Earthstar Geographics'
    })
  };

  // 3. Color functions
  const getNDVIColor = (code) => {
    switch (code) {
      case 0: return '#cccccc';
      case 1: return '#eb4539ff'; // Forest Loss
      case 2: return '#60cfa1ff'; // Stable
      case 3: return '#fe8be5ff'; // Forest Gain
      default: return '#ffffff';
    }
  };

  const getCoverColor = (className) => {
    if (!className) return '#cccccc';
    const lowerName = className.toString().toLowerCase();
    if (lowerName.includes('las')) return '#238443'; // Forest
    if (lowerName.includes('pole')) return '#f46d43'; // Built-up (previously Field)
    if (lowerName.includes('woda')) return '#225ea8'; // Water
    if (lowerName.includes('zabudowa')) return '#ffffbf'; // Field (previously Built-up)
    return '#cccccc';
  };

  // 4. Layer and legend variables
  let ndviLayer, cover2015Layer, cover2019Layer, borderLayer;
  const layerControl = L.control.layers(baseLayers, null, {
    collapsed: false,
    sortLayers: true,
    sortFunction: (a, b) => {
      const order = {
        "Land Cover 2015": 1,
        "Land Cover 2019": 2,
        "NDVI Changes": 3
      };
      return order[a.name] - order[b.name];
    }
  }).addTo(map);
  
  let currentLegends = [];

  // 5. Permanent border legend
  const borderLegend = L.control({position: 'bottomleft'});
  borderLegend.onAdd = function() {
    const div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = `
      <h4>Boundary</h4>
      <div>
        <i style="border: 3px solid #000000; width: 18px; height: 18px; display: inline-block;"></i>
        Forest District Boundary<br>
      </div>
    `;
    return div;
  };
  borderLegend.addTo(map);

  // 6. Update thematic legends
  const updateLegends = () => {
  currentLegends.forEach(legend => map.removeControl(legend));
  currentLegends = [];

  if (cover2015Layer && map.hasLayer(cover2015Layer)) {
    currentLegends.push(createCoverLegend('2015').addTo(map));
  }
  if (cover2019Layer && map.hasLayer(cover2019Layer)) {
    currentLegends.push(createCoverLegend('2019').addTo(map));
  }
  if (ndviLayer && map.hasLayer(ndviLayer)) {
    currentLegends.push(createNDVILegend().addTo(map));
  }
};

  // 7. Load border layer first (to set view)
  fetch('Data/border.geojson')
    .then(response => response.json())
    .then(data => {
      borderLayer = L.geoJSON(data, {
        style: {
          color: '#000000',
          weight: 3,
          fillOpacity: 0,
          interactive: false
        }
      }).addTo(map);
      
      map.fitBounds(borderLayer.getBounds(), {padding: [50, 50]});
      borderLayer.bringToFront();
      baseLayers.OpenStreetMap.addTo(map);
    })
    .catch(error => {
      console.error('Border layer error:', error);
      map.setView([53.6, 17.8], 10);
      baseLayers.OpenStreetMap.addTo(map);
    });

  // 8. Load Land Cover 2015
  fetch('Data/cover_2015.json')
    .then(response => response.json())
    .then(data => {
      cover2015Layer = L.geoJSON(data, {
        style: feature => ({
          fillColor: getCoverColor(feature.properties?.Class_Names),
          weight: 0.5,
          color: '#333333',
          fillOpacity: 0.5
        }),
        onEachFeature: onEachCoverFeature('2015')
      });
      layerControl.addOverlay(cover2015Layer, "Land Cover 2015");
    })
    .catch(error => console.error('2015 Cover error:', error));

  // 9. Load Land Cover 2019
  fetch('Data/cover_2019.json')
    .then(response => response.json())
    .then(data => {
      cover2019Layer = L.geoJSON(data, {
        style: feature => ({
          fillColor: getCoverColor(feature.properties?.Class_Names),
          weight: 0.5,
          color: '#333333',
          fillOpacity: 0.5
        }),
        onEachFeature: onEachCoverFeature('2019')
      });
      layerControl.addOverlay(cover2019Layer, "Land Cover 2019");
    })
    .catch(error => console.error('2019 Cover error:', error));

  // 10. Load NDVI Changes
  fetch('Data/NDVI_changes.json')
    .then(response => response.json())
    .then(data => {
      ndviLayer = L.geoJSON(data, {
        style: feature => ({
          fillColor: getNDVIColor(feature.properties.gridcode),
          weight: 1,
          color: 'white',
          fillOpacity: 0.7
        }),
        onEachFeature: onEachNDVIFeature
      });
      layerControl.addOverlay(ndviLayer, "NDVI Changes");
      updateLegends();
    })
    .catch(error => console.error('NDVI error:', error));

  // 11. Layer change handler
  map.on('overlayadd overlayremove', function() {
    updateLegends();
    if (borderLayer) borderLayer.bringToFront();
  });

  // Helper functions
  function getNDVIText(code) {
    switch(code) {
      case 1: return 'Forest Loss';
      case 2: return 'Stable';
      case 3: return 'Forest Gain';
      default: return 'Unknown';
    }
  }

  function onEachNDVIFeature(feature, layer) {
    layer.bindPopup(`
      <div class="map-popup">
        <h4>NDVI Change</h4>
        <p>Status: ${getNDVIText(feature.properties.gridcode)}</p>
        <p>ID: ${feature.properties.OBJECTID || '?'}</p>
        <p>Area: ${feature.properties.Area_ha?.toFixed(2) || '?'} ha</p>
      </div>
    `);
  }

  function onEachCoverFeature(year) {
    return function(feature, layer) {
      let displayType = feature.properties?.Class_Names || 'unknown';
      if (displayType.toLowerCase().includes('pole')) displayType = 'Built-up';
      else if (displayType.toLowerCase().includes('zabudowa')) displayType = 'Field';
      
      layer.bindPopup(`
        <div class="map-popup">
          <h4>Land Cover ${year}</h4>
          <p>Type: ${displayType}</p>
        </div>
      `);
    };
  }

  function createNDVILegend() {
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = '<h4>NDVI Changes (2015-2019)</h4>';
      
      const items = [
        {code: 1, label: 'Forest Loss', color: '#eb4539ff'},
        {code: 2, label: 'Forest Gain', color: '#fe8be5ff'},
        {code: 3, label: 'Stable', color: '#60cfa1ff'}
      ];

      items.forEach(item => {
        div.innerHTML += `
          <div>
            <i style="background:${item.color}; width: 18px; height: 18px; display: inline-block;"></i>
            ${item.label}<br>
          </div>
        `;
      });

      return div;
    };
    return legend;
  }

  function createCoverLegend(year) {
    const legend = L.control({position: 'topright'});
    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = `<h4>Land Cover ${year}</h4>`;
      
      const classTypes = [
        {name: 'forest', color: '#238443'},
        {name: 'built-up', color: '#f46d43'},
        {name: 'water', color: '#225ea8'},
        {name: 'field', color: '#ffffbf'}
      ];

      classTypes.forEach(type => {
        div.innerHTML += `
          <div>
            <i style="background:${type.color}; width: 18px; height: 18px; display: inline-block;"></i>
            ${type.name.charAt(0).toUpperCase() + type.name.slice(1)}<br>
          </div>
        `;
      });

      return div;
    };
    return legend;
  }
});