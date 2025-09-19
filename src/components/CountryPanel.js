import React, { useState, useEffect } from "react";
import parseJSONSafe from "../utils/safeJson";
import "./CountryPanel.css";

const CountryPanel = ({ country, onClose }) => {
  const [countryDetails, setCountryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [journalEntry, setJournalEntry] = useState("");
  const [visitStatus, setVisitStatus] = useState("not-visited");
  const [previousEntries, setPreviousEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  useEffect(() => {
    // Fetch detailed country information
    const fetchCountryDetails = async () => {
      try {
        const response = await fetch(
          `https://restcountries.com/v3.1/name/${country.name.common}?fullText=true`
        );
        const data = await parseJSONSafe(response);
        setCountryDetails(data[0]);
      } catch (error) {
        console.error("Error fetching country details:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch previous journal entries for this country
    const fetchPreviousEntries = async () => {
      try {
        const response = await fetch("/api/journal");
        if (response.ok) {
          const allEntries = (await parseJSONSafe(response)) || [];
          const countryEntries = allEntries.filter(
            (entry) =>
              entry.countryName === country.name.common ||
              entry.countryCode === country.cca3
          );
          setPreviousEntries(countryEntries);
        }
      } catch (error) {
        console.error("Error fetching previous entries:", error);
      } finally {
        setLoadingEntries(false);
      }
    };

    fetchCountryDetails();
    fetchPreviousEntries();
  }, [country]);

  const handleSaveEntry = async () => {
    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          countryCode: countryDetails?.cca3,
          countryName: country.name.common,
          entry: journalEntry,
          visitStatus: visitStatus,
        }),
      });
      const data = await parseJSONSafe(response);

      if (!response.ok) {
        throw new Error((data && data.error) || "Failed to save entry");
      }

      alert("Journal entry saved successfully!");
      setJournalEntry("");

      // Refresh previous entries
      const entriesResponse = await fetch("/api/journal");
      if (entriesResponse.ok) {
        const allEntries = (await parseJSONSafe(entriesResponse)) || [];
        const countryEntries = allEntries.filter(
          (entry) =>
            entry.countryName === country.name.common ||
            entry.countryCode === country.cca3
        );
        setPreviousEntries(countryEntries);
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save entry: " + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="country-panel">
        <div className="panel-header">
          <h2>Loading...</h2>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
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
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      </div>

      <div className="panel-content">
        <div className="country-info">
          <h3>Country Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Capital:</strong>
              <span>{countryDetails?.capital?.[0] || "N/A"}</span>
            </div>
            <div className="info-item">
              <strong>Population:</strong>
              <span>
                {countryDetails?.population?.toLocaleString() || "N/A"}
              </span>
            </div>
            <div className="info-item">
              <strong>Region:</strong>
              <span>{countryDetails?.region || "N/A"}</span>
            </div>
            <div className="info-item">
              <strong>Languages:</strong>
              <span>
                {countryDetails?.languages
                  ? Object.values(countryDetails.languages).join(", ")
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Previous Journal Entries Section */}
        <div className="previous-entries">
          <h3>Previous Journal Entries</h3>
          {loadingEntries ? (
            <div className="loading-entries">Loading entries...</div>
          ) : previousEntries.length > 0 ? (
            <div className="entries-list">
              {previousEntries.map((entry, index) => (
                <div key={index} className="entry-item">
                  <div className="entry-header">
                    <span className="entry-date">
                      {formatDate(entry.createdAt)}
                    </span>
                    <span className={`entry-status ${entry.visitStatus}`}>
                      {entry.visitStatus === "visited"
                        ? "✅ Visited"
                        : entry.visitStatus === "want-to-visit"
                        ? "🎯 Want to Visit"
                        : "❓ Not Visited"}
                    </span>
                  </div>
                  {entry.entry && <p className="entry-text">{entry.entry}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-entries">
              <p>
                No previous entries for this country. Add your first one below!
              </p>
            </div>
          )}
        </div>

        <div className="visit-status">
          <h3>Visit Status</h3>
          <div className="status-options">
            <label>
              <input
                type="radio"
                value="not-visited"
                checked={visitStatus === "not-visited"}
                onChange={(e) => setVisitStatus(e.target.value)}
              />
              Not Visited
            </label>
            <label>
              <input
                type="radio"
                value="want-to-visit"
                checked={visitStatus === "want-to-visit"}
                onChange={(e) => setVisitStatus(e.target.value)}
              />
              Want to Visit
            </label>
            <label>
              <input
                type="radio"
                value="visited"
                checked={visitStatus === "visited"}
                onChange={(e) => setVisitStatus(e.target.value)}
              />
              Visited
            </label>
          </div>
        </div>

        <div className="journal-section">
          <h3>Add New Journal Entry</h3>
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Write your thoughts, experiences, or plans about this country..."
            rows={6}
            className="journal-textarea"
          />
          <button
            onClick={handleSaveEntry}
            className="btn btn-primary save-btn"
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryPanel;
