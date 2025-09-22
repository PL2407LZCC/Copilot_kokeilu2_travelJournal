import React, { useState, useEffect, useContext } from "react";
import parseJSONSafe from "../utils/safeJson";
import { AuthContext } from "../contexts/AuthContext";
import "./Journal.css";

const Journal = () => {
  const { user, getAuthHeaders } = useContext(AuthContext);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, visited, want-to-visit, not-visited

  useEffect(() => {
    fetchJournalEntries();
  }, []);

  const fetchJournalEntries = async () => {
    if (!user) {
      setJournalEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await fetch("/api/journal", { headers });
      if (response.ok) {
        const entries = (await parseJSONSafe(response)) || [];
        setJournalEntries(entries);
      } else {
        setError("Failed to fetch journal entries");
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      setError("Error loading journal entries");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "visited":
        return "✅";
      case "want-to-visit":
        return "🎯";
      default:
        return "🌍";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "visited":
        return "Visited";
      case "want-to-visit":
        return "Want to Visit";
      default:
        return "Not Visited";
    }
  };

  const filteredEntries = journalEntries.filter((entry) => {
    if (filter === "all") return true;
    return entry.visitStatus === filter;
  });

  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const country = entry.countryName;
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(entry);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="journal-container">
        <div className="journal-header">
          <h2>📝 Travel Journal</h2>
          <p>Loading your travel memories...</p>
        </div>
        <div className="journal-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="journal-container">
        <div className="journal-header">
          <h2>📝 Travel Journal</h2>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="journal-container">
      <div className="journal-header">
        <h2>📝 Travel Journal</h2>
        <p>All your travel memories and plans in one place</p>

        <div className="journal-stats">
          <div className="stat">
            <span className="stat-number">{journalEntries.length}</span>
            <span className="stat-label">Total Entries</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {
                new Set(
                  journalEntries
                    .filter((e) => e.visitStatus === "visited")
                    .map((e) => e.countryCode)
                ).size
              }
            </span>
            <span className="stat-label">Countries Visited</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {
                new Set(
                  journalEntries
                    .filter((e) => e.visitStatus === "want-to-visit")
                    .map((e) => e.countryCode)
                ).size
              }
            </span>
            <span className="stat-label">Want to Visit</span>
          </div>
        </div>
      </div>

      <div className="journal-filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({journalEntries.length})
        </button>
        <button
          className={`filter-btn ${filter === "visited" ? "active" : ""}`}
          onClick={() => setFilter("visited")}
        >
          ✅ Visited (
          {journalEntries.filter((e) => e.visitStatus === "visited").length})
        </button>
        <button
          className={`filter-btn ${filter === "want-to-visit" ? "active" : ""}`}
          onClick={() => setFilter("want-to-visit")}
        >
          🎯 Want to Visit (
          {
            journalEntries.filter((e) => e.visitStatus === "want-to-visit")
              .length
          }
          )
        </button>
      </div>

      <div className="journal-content">
        {Object.keys(groupedEntries).length === 0 ? (
          <div className="no-entries">
            <h3>No journal entries yet</h3>
            <p>
              Start exploring countries on the map and add your first journal
              entry!
            </p>
          </div>
        ) : (
          <div className="entries-by-country">
            {Object.entries(groupedEntries)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([country, entries]) => (
                <div key={country} className="country-section">
                  <div className="country-header">
                    <h3>{country}</h3>
                    <span
                      className={`country-status ${entries[0].visitStatus}`}
                    >
                      {getStatusIcon(entries[0].visitStatus)}{" "}
                      {getStatusText(entries[0].visitStatus)}
                    </span>
                  </div>

                  <div className="country-entries">
                    {entries
                      .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      )
                      .map((entry) => (
                        <div key={entry.id} className="journal-entry">
                          <div className="entry-meta">
                            <span className="entry-date">
                              {formatDate(entry.createdAt)}
                            </span>
                          </div>
                          {entry.entry && (
                            <div className="entry-content">
                              <p>{entry.entry}</p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
