import React, { useState, useEffect } from 'react';
import './WorldMap.css';

const WorldMap = ({ onCountrySelect }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch countries from REST Countries API
    fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flag')
      .then(response => response.json())
      .then(data => {
        setCountries(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
        setLoading(false);
      });
  }, []);

  const handleCountryClick = (country) => {
    onCountrySelect(country);
  };

  if (loading) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Loading world map...</p>
      </div>
    );
  }

  return (
    <div className="world-map">
      <div className="map-placeholder">
        <div className="map-info">
          <h3>🗺️ Interactive World Map</h3>
          <p>Click on a country to view details and add journal entries</p>
          <div className="countries-grid">
            {countries.slice(0, 20).map((country) => (
              <button
                key={country.cca3}
                className="country-button"
                onClick={() => handleCountryClick(country)}
                title={country.name.common}
              >
                <span className="country-flag">{country.flag}</span>
                <span className="country-name">{country.name.common}</span>
              </button>
            ))}
          </div>
          <p className="map-note">
            🚧 Full interactive map with Leaflet coming soon! 
            For now, click any country above to explore.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;