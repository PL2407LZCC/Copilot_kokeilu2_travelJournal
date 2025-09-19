import React, { useContext, useState, useEffect } from "react";
import parseJSONSafe from "../utils/safeJson";
import { AuthContext } from "../contexts/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEntries: 0,
    countriesVisited: 0,
    countriesWantToVisit: 0,
    totalCountries: 195, // approximate total
  });

  useEffect(() => {
    // Fetch user's journal entries for statistics
    fetchJournalEntries();
  }, []);

  const fetchJournalEntries = async () => {
    try {
      const response = await fetch("/api/journal");
      if (response.ok) {
        const entries = (await parseJSONSafe(response)) || [];
        setJournalEntries(entries);
        calculateStats(entries);
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (entries) => {
    const visitedCountries = new Set();
    const wantToVisitCountries = new Set();

    entries.forEach((entry) => {
      if (entry.visitStatus === "visited") {
        visitedCountries.add(entry.countryCode);
      } else if (entry.visitStatus === "want-to-visit") {
        wantToVisitCountries.add(entry.countryCode);
      }
    });

    setStats({
      totalEntries: entries.length,
      countriesVisited: visitedCountries.size,
      countriesWantToVisit: wantToVisitCountries.size,
      totalCountries: 195,
    });
  };

  const calculateTravelProgress = () => {
    return Math.round((stats.countriesVisited / stats.totalCountries) * 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="no-user">
            <h2>👤 Profile</h2>
            <p>Please log in to view your travel profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-icon">🧳</span>
          </div>
          <div className="profile-info">
            <h1>{user.username}</h1>
            <p className="profile-subtitle">Travel Explorer</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🗂️</div>
            <div className="stat-value">{stats.totalEntries}</div>
            <div className="stat-label">Journal Entries</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.countriesVisited}</div>
            <div className="stat-label">Countries Visited</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{stats.countriesWantToVisit}</div>
            <div className="stat-label">Want to Visit</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🌍</div>
            <div className="stat-value">{calculateTravelProgress()}%</div>
            <div className="stat-label">World Coverage</div>
          </div>
        </div>

        <div className="progress-section">
          <h3>Travel Progress</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${calculateTravelProgress()}%` }}
            ></div>
          </div>
          <p className="progress-text">
            You've visited {stats.countriesVisited} out of{" "}
            {stats.totalCountries} countries!
          </p>
        </div>

        <div className="recent-entries">
          <h3>Recent Journal Entries</h3>
          {loading ? (
            <div className="loading">Loading entries...</div>
          ) : journalEntries.length > 0 ? (
            <div className="entries-list">
              {journalEntries.slice(0, 5).map((entry, index) => (
                <div key={index} className="entry-item">
                  <div className="entry-header">
                    <span className="entry-country">{entry.countryName}</span>
                    <span className="entry-date">
                      {entry.createdAt
                        ? formatDate(entry.createdAt)
                        : "Unknown date"}
                    </span>
                  </div>
                  <div className="entry-status">
                    <span className={`status-badge ${entry.visitStatus}`}>
                      {entry.visitStatus === "visited"
                        ? "✅ Visited"
                        : entry.visitStatus === "want-to-visit"
                        ? "🎯 Want to Visit"
                        : "❓ Not Visited"}
                    </span>
                  </div>
                  {entry.entry && (
                    <p className="entry-preview">
                      {entry.entry.length > 100
                        ? entry.entry.substring(0, 100) + "..."
                        : entry.entry}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-entries">
              <p>
                No journal entries yet. Start exploring the world map to add
                your first entry!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
