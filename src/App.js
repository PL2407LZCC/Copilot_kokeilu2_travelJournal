import React, { useState } from 'react';
import './assets/styles/App.css';
import Header from './components/Header';
import WorldMap from './components/WorldMap';
import CountryPanel from './components/CountryPanel';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <AuthProvider>
      <div className="App">
        <Header onShowAuth={() => setShowAuthModal(true)} />
        
        <main className="main-content">
          <div className="map-container">
            <WorldMap onCountrySelect={setSelectedCountry} />
          </div>
          
          {selectedCountry && (
            <CountryPanel 
              country={selectedCountry} 
              onClose={() => setSelectedCountry(null)} 
            />
          )}
        </main>

        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;