import React, { useState, useEffect } from 'react';
import './CountryPanel.css';

const CountryPanel = ({ country, onClose }) => {
  const [countryDetails, setCountryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [journalEntry, setJournalEntry] = useState('');
  const [visitStatus, setVisitStatus] = useState('not-visited');

  useEffect(() => {
    // Fetch detailed country information
    fetch(`https://restcountries.com/v3.1/name/${country.name.common}?fullText=true`)
      .then(response => response.json())
      .then(data => {
        setCountryDetails(data[0]);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching country details:', error);
        setLoading(false);
      });
  }, [country]);

  const handleSaveEntry = async () => {
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countryCode: countryDetails?.cca3,
          countryName: country.name.common,
          entry: journalEntry,
          visitStatus: visitStatus
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save entry');
      }
      
      alert('Journal entry saved successfully!');
      setJournalEntry('');
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="country-panel">
        <div className="panel-header">
          <h2>Loading...</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="loading">Loading country details...</div>
      </div>
    );
  }

  return (
    <div className="country-panel">
      <div className="panel-header">
        <h2>
          {countryDetails?.flag} {countryDetails?.name.common}
        </h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="panel-content">
        <div className="country-info">
          <h3>Country Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Capital:</strong>
              <span>{countryDetails?.capital?.[0] || 'N/A'}</span>
            </div>
            <div className="info-item">
              <strong>Population:</strong>
              <span>{countryDetails?.population?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="info-item">
              <strong>Region:</strong>
              <span>{countryDetails?.region || 'N/A'}</span>
            </div>
            <div className="info-item">
              <strong>Languages:</strong>
              <span>
                {countryDetails?.languages 
                  ? Object.values(countryDetails.languages).join(', ')
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="visit-status">
          <h3>Visit Status</h3>
          <div className="status-options">
            <label>
              <input
                type="radio"
                value="not-visited"
                checked={visitStatus === 'not-visited'}
                onChange={(e) => setVisitStatus(e.target.value)}
              />
              Not Visited
            </label>
            <label>
              <input
                type="radio"
                value="want-to-visit"
                checked={visitStatus === 'want-to-visit'}
                onChange={(e) => setVisitStatus(e.target.value)}
              />
              Want to Visit
            </label>
            <label>
              <input
                type="radio"
                value="visited"
                checked={visitStatus === 'visited'}
                onChange={(e) => setVisitStatus(e.target.value)}
              />
              Visited
            </label>
          </div>
        </div>

        <div className="journal-section">
          <h3>Journal Entry</h3>
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Write your thoughts, experiences, or plans about this country..."
            rows={6}
            className="journal-textarea"
          />
          <button onClick={handleSaveEntry} className="btn btn-primary save-btn">
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryPanel;