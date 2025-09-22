import React, { useState, useContext } from "react";
import "./assets/styles/App.css";
import Header from "./components/Header";
import WorldMap from "./components/WorldMap";
import InteractiveWorldMap from "./components/InteractiveWorldMap";
import Globe from "./components/Globe";
import CountryPanel from "./components/CountryPanel";
import AuthModal from "./components/AuthModal";
import Profile from "./pages/Profile";
import Journal from "./components/Journal";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

function AppContent() {
  const { user } = useContext(AuthContext);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState("map"); // 'map', 'journal', 'profile'
  const [mapType, setMapType] = useState("globe"); // 'globe', 'interactive', 'simple'

  const [showProfile, setShowProfile] = useState(false);

  // Debug function to track country selection
  const handleCountrySelect = (country) => {
    console.log("App: Country selected:", country);
    setSelectedCountry(country);
  };

  const handleViewChange = (view) => {
    // Protect journal and profile views - require authentication
    if ((view === "journal" || view === "profile") && !user) {
      setShowAuthModal(true);
      return;
    }

    if (view === "profile") {
      setShowProfile(true);
    } else {
      setCurrentView(view);
      setSelectedCountry(null); // Close any open country panel when switching views
    }
  };

  const renderMap = () => {
    switch (mapType) {
      case "globe":
        return <Globe onCountrySelect={handleCountrySelect} />;
      case "interactive":
        return <InteractiveWorldMap onCountrySelect={handleCountrySelect} />;
      case "simple":
      default:
        return <WorldMap onCountrySelect={handleCountrySelect} />;
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "journal":
        return user ? (
          <Journal />
        ) : (
          <div className="map-container">{renderMap()}</div>
        );
      case "map":
      default:
        return <div className="map-container">{renderMap()}</div>;
    }
  };

  return (
    <div className="App">
      <Header
        onShowAuth={() => setShowAuthModal(true)}
        onViewChange={handleViewChange}
        currentView={currentView}
      />

      <main className="main-content">
        {renderCurrentView()}

        {selectedCountry && (
          <CountryPanel
            country={selectedCountry}
            onClose={() => setSelectedCountry(null)}
          />
        )}

        {/* Profile overlay */}
        {showProfile && user && (
          <Profile onClose={() => setShowProfile(false)} />
        )}

        {/* Debug info */}
        {console.log(
          "App render - selectedCountry:",
          selectedCountry,
          "currentView:",
          currentView
        )}
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Development toggle for map types */}
      <div
        className="dev-controls"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          fontSize: "12px",
          zIndex: 1000,
          minWidth: "150px",
        }}
      >
        <div style={{ marginBottom: "10px", fontWeight: "bold" }}>Map Type</div>
        <label style={{ display: "block", marginBottom: "5px" }}>
          <input
            type="radio"
            name="mapType"
            value="globe"
            checked={mapType === "globe"}
            onChange={(e) => setMapType(e.target.value)}
            style={{ marginRight: "8px" }}
          />
          🌍 3D Globe
        </label>
        <label style={{ display: "block", marginBottom: "5px" }}>
          <input
            type="radio"
            name="mapType"
            value="interactive"
            checked={mapType === "interactive"}
            onChange={(e) => setMapType(e.target.value)}
            style={{ marginRight: "8px" }}
          />
          🗺️ Leaflet Map
        </label>
        <label style={{ display: "block" }}>
          <input
            type="radio"
            name="mapType"
            value="simple"
            checked={mapType === "simple"}
            onChange={(e) => setMapType(e.target.value)}
            style={{ marginRight: "8px" }}
          />
          📋 Simple List
        </label>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
