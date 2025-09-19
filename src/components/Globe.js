import React, { useState, useEffect, useRef } from "react";
import GlobeGL from "react-globe.gl";
import parseJSONSafe from "../utils/safeJson";
import "./Globe.css";

const Globe = ({ onCountrySelect }) => {
  console.log(
    "Globe component rendered with onCountrySelect:",
    typeof onCountrySelect
  );

  const [countries, setCountries] = useState([]);
  const [countriesGeo, setCountriesGeo] = useState({ features: [] });
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const globeEl = useRef();

  useEffect(() => {
    // Fetch countries from REST Countries API
    const fetchCountries = fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flag"
    ).then((response) => response.json());

    // Fetch country polygons for the globe
    const fetchGeoData = fetch(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    ).then((response) => response.json());

    // Fetch journal entries to show country visit status
    const fetchJournalEntries = fetch("/api/journal")
      .then((response) => parseJSONSafe(response))
      .then((data) => data || []);

    Promise.all([fetchCountries, fetchGeoData, fetchJournalEntries])
      .then(([countriesData, geoData, journalData]) => {
        setCountries(countriesData);
        setCountriesGeo(geoData);
        setJournalEntries(journalData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  // Get visit status for a country
  const getCountryVisitStatus = (polygon) => {
    const properties = polygon?.properties || {};
    const countryName =
      properties.NAME ||
      properties.name ||
      properties.NAME_EN ||
      properties.ADMIN ||
      properties.sovereignt ||
      properties.NAME_LONG ||
      "Unknown";
    const iso3 = properties.ISO_A3 || properties.iso_a3 || properties.ADM0_A3;

    const entry = journalEntries.find(
      (entry) => entry.countryName === countryName || entry.countryCode === iso3
    );

    return entry ? entry.visitStatus : "not-visited";
  };

  // Get color based on visit status
  const getCountryColor = (polygon) => {
    const visitStatus = getCountryVisitStatus(polygon);
    const properties = polygon?.properties || {};
    const countryName =
      properties.NAME ||
      properties.name ||
      properties.NAME_EN ||
      properties.ADMIN ||
      properties.sovereignt ||
      properties.NAME_LONG ||
      "Unknown";
    const isHovered = hoveredCountry === countryName;

    switch (visitStatus) {
      case "visited":
        return isHovered ? "rgba(76, 175, 80, 0.9)" : "rgba(76, 175, 80, 0.7)"; // Green
      case "want-to-visit":
        return isHovered ? "rgba(255, 193, 7, 0.9)" : "rgba(255, 193, 7, 0.7)"; // Amber
      default:
        return isHovered
          ? "rgba(120, 120, 120, 0.8)"
          : "rgba(120, 120, 120, 0.6)"; // Gray
    }
  };

  const handleCountryClick = (polygon, event) => {
    console.log("Globe country clicked!", polygon, event);
    console.log("Polygon properties:", polygon?.properties);

    // Find the country data from REST Countries API that matches this polygon
    const properties = polygon?.properties || {};

    // Try different possible property names for country name
    const countryName =
      properties.NAME ||
      properties.name ||
      properties.NAME_EN ||
      properties.ADMIN ||
      properties.sovereignt ||
      properties.NAME_LONG ||
      "Unknown Country";

    const iso3 = properties.ISO_A3 || properties.iso_a3 || properties.ADM0_A3;
    const iso2 = properties.ISO_A2 || properties.iso_a2;

    console.log("Country details:", { countryName, iso3, iso2 });
    console.log("All available properties:", Object.keys(properties));

    if (!countryName || countryName === "Unknown Country") {
      console.warn("Could not determine country name from polygon properties");
      return;
    }

    const matchedCountry = countries.find((country) => {
      // Try multiple matching strategies
      return (
        country.name.common.toLowerCase() === countryName.toLowerCase() ||
        country.cca3 === iso3 ||
        country.cca2 === iso2 ||
        // Additional fuzzy matching for common name variations
        country.name.common.toLowerCase().includes(countryName.toLowerCase()) ||
        countryName.toLowerCase().includes(country.name.common.toLowerCase())
      );
    });

    if (matchedCountry) {
      console.log("Selected country:", matchedCountry);
      console.log("Calling onCountrySelect with:", matchedCountry);
      onCountrySelect(matchedCountry);
    } else {
      // Fallback: create a basic country object from polygon data
      console.log(
        "Country not found in REST Countries data, using fallback:",
        countryName
      );
      const fallbackCountry = {
        name: { common: countryName },
        cca3: iso3 || "UNK",
        cca2: iso2 || "UN",
        flag: "🌍", // Default flag
      };
      console.log("Calling onCountrySelect with fallback:", fallbackCountry);
      onCountrySelect(fallbackCountry);
    }
  };

  if (loading) {
    return (
      <div className="globe-loading">
        <div className="loading-spinner"></div>
        <p>Loading 3D globe...</p>
      </div>
    );
  }

  return (
    <div className="globe-container">
      <div className="globe-header">
        <h3>🌍 Interactive 3D Globe</h3>
        <p>Click on any country to view details and add journal entries</p>
      </div>
      <div className="globe-wrapper">
        <GlobeGL
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          polygonsData={countriesGeo.features}
          polygonAltitude={0.01}
          polygonCapColor={getCountryColor}
          polygonSideColor={() => "rgba(120, 120, 120, 0.2)"}
          polygonStrokeColor={() => "#111"}
          polygonLabel={({ properties: d }) => {
            const visitStatus = getCountryVisitStatus({ properties: d });
            const statusEmoji =
              visitStatus === "visited"
                ? "✅"
                : visitStatus === "want-to-visit"
                ? "🎯"
                : "🌍";
            const statusText =
              visitStatus === "visited"
                ? "Visited"
                : visitStatus === "want-to-visit"
                ? "Want to Visit"
                : "Not Visited";

            const countryName =
              d.NAME ||
              d.name ||
              d.NAME_EN ||
              d.ADMIN ||
              d.sovereignt ||
              d.NAME_LONG ||
              "Unknown Country";

            return `
              <div style="background: rgba(0,0,0,0.8); padding: 12px; border-radius: 8px; color: white; max-width: 200px;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">
                  ${statusEmoji} ${countryName}
                </div>
                <div style="font-size: 12px; opacity: 0.8;">
                  Status: ${statusText}
                </div>
                <div style="font-size: 11px; opacity: 0.6; margin-top: 5px;">
                  Click to view details and add journal entry
                </div>
              </div>
            `;
          }}
          onPolygonClick={(polygon, event, { lat, lng, altitude }) => {
            console.log("Raw polygon click event:", {
              polygon,
              event,
              lat,
              lng,
              altitude,
            });
            handleCountryClick(polygon, event);
          }}
          onPolygonHover={(polygon, prevPolygon) => {
            // Update hover state for visual feedback
            if (polygon) {
              const properties = polygon.properties || {};
              const countryName =
                properties.NAME ||
                properties.name ||
                properties.NAME_EN ||
                properties.ADMIN ||
                properties.sovereignt ||
                properties.NAME_LONG ||
                "Unknown";
              setHoveredCountry(countryName);
            } else {
              setHoveredCountry(null);
            }
            // Pause auto-rotation on hover
            if (globeEl.current && globeEl.current.controls()) {
              globeEl.current.controls().autoRotate = !polygon;
            }
          }}
          // Globe controls
          width={800}
          height={600}
          showAtmosphere={true}
          atmosphereColor="lightskyblue"
          atmosphereAltitude={0.1}
          // Camera controls
          pointOfView={{ lat: 20, lng: 0, altitude: 2 }}
          animateIn={true}
          enablePointerInteraction={true}
        />
      </div>
      <div className="globe-controls">
        {/* Debug test button */}
        <button
          onClick={() => {
            console.log("Test button clicked");
            const testCountry = {
              name: { common: "Test Country" },
              cca3: "TST",
              cca2: "TS",
              flag: "🧪",
            };
            console.log(
              "Calling onCountrySelect with test country:",
              testCountry
            );
            onCountrySelect(testCountry);
          }}
          style={{
            margin: "10px",
            padding: "8px 16px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🧪 Test Country Selection
        </button>

        <div className="globe-legend">
          <h4>Country Status</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color visited"></div>
              <span>✅ Visited</span>
            </div>
            <div className="legend-item">
              <div className="legend-color want-to-visit"></div>
              <span>🎯 Want to Visit</span>
            </div>
            <div className="legend-item">
              <div className="legend-color not-visited"></div>
              <span>🌍 Not Visited</span>
            </div>
          </div>
        </div>
        <p className="globe-instructions">
          🖱️ Drag to rotate • 🔍 Scroll to zoom • ⏸️ Hover a country to pause
          rotation • 🌍 Click to explore
        </p>
      </div>
    </div>
  );
};

export default Globe;
