import React, { useState } from 'react';
import './assets/styles/App.css';
import Header from './components/Header';
import WorldMap from './components/WorldMap';
import InteractiveWorldMap from './components/InteractiveWorldMap';
import CountryPanel from './components/CountryPanel';
import AuthModal from './components/AuthModal';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState('map'); // 'map', 'journal', 'profile'
  const [useInteractiveMap, setUseInteractiveMap] = useState(true); // Toggle between old and new map

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSelectedCountry(null); // Close any open country panel when switching views
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile':
        return <Profile />;
      case 'journal':
        // For now, show the map but could be a separate journal view later
        return (
          <div className="map-container">
            {useInteractiveMap ? (
              <InteractiveWorldMap onCountrySelect={setSelectedCountry} />
            ) : (
              <WorldMap onCountrySelect={setSelectedCountry} />
            )}
          </div>
        );
      case 'map':
      default:
        return (
          <div className="map-container">
            {useInteractiveMap ? (
              <InteractiveWorldMap onCountrySelect={setSelectedCountry} />
            ) : (
              <WorldMap onCountrySelect={setSelectedCountry} />
            )}
          </div>
        );
    }
  };

  return (
    <AuthProvider>
      <div className="App">
        <Header 
          onShowAuth={() => setShowAuthModal(true)} 
          onViewChange={handleViewChange}
          currentView={currentView}
        />
        
        <main className="main-content">
          {renderCurrentView()}
          
          {selectedCountry && currentView !== 'profile' && (
            <CountryPanel 
              country={selectedCountry} 
              onClose={() => setSelectedCountry(null)} 
            />
          )}
        </main>

        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
        
        {/* Development toggle for map types */}
        <div className="dev-controls" style={{
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          <label>
            <input 
              type="checkbox" 
              checked={useInteractiveMap} 
              onChange={(e) => setUseInteractiveMap(e.target.checked)}
            />
            Use Interactive Map
          </label>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;