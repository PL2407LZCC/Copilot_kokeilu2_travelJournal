import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './InteractiveWorldMap.css';

const InteractiveWorldMap = ({ onCountrySelect }) => {
  const [countries, setCountries] = useState([]);
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountryCode, setSelectedCountryCode] = useState(null);

  useEffect(() => {
    // Fetch both country data and GeoJSON data
    Promise.all([
      fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flag').then(r => r.json()),
      fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(r => r.json())
    ]).then(([countriesData, geoJsonData]) => {
      setCountries(countriesData);
      setGeoData(geoJsonData);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });
  }, []);

  const getCountryStyle = (feature) => {
    const isSelected = feature.id === selectedCountryCode;
    return {
      fillColor: isSelected ? '#007bff' : '#4CAF50',
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#0056b3' : 'white',
      dashArray: '',
      fillOpacity: isSelected ? 0.9 : 0.7
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.9
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(getCountryStyle(feature));
      },
      click: (e) => {
        // Find the corresponding country data
        const country = countries.find(c => 
          c.cca3 === feature.id || 
          c.cca2 === feature.id ||
          c.name.common.toLowerCase() === feature.properties.name?.toLowerCase()
        );
        
        if (country) {
          setSelectedCountryCode(feature.id);
          onCountrySelect(country);
        } else {
          // Fallback: create a basic country object from GeoJSON
          const fallbackCountry = {
            name: { common: feature.properties.name || 'Unknown' },
            cca3: feature.id,
            cca2: feature.id,
            flag: '🏳️'
          };
          setSelectedCountryCode(feature.id);
          onCountrySelect(fallbackCountry);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Loading interactive world map...</p>
      </div>
    );
  }

  return (
    <div className="interactive-world-map">
      <div className="map-info">
        <h3>🗺️ Interactive World Map</h3>
        <p>Click on any country to view details and add journal entries. Use mouse wheel to zoom.</p>
      </div>
      
      <div className="map-wrapper">
        <MapContainer 
          center={[20, 0]} 
          zoom={2} 
          style={{ height: '500px', width: '100%' }}
          zoomControl={false}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <ZoomControl position="topleft" />
          
          {geoData && (
            <GeoJSON 
              data={geoData} 
              style={getCountryStyle}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>
      
      <div className="map-controls">
        <p className="map-note">
          🎯 Click on countries to explore • 🔍 Scroll to zoom • 🖱️ Drag to pan
        </p>
      </div>
    </div>
  );
};

export default InteractiveWorldMap;