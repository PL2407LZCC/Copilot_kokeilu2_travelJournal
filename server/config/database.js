const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database directory if it doesn't exist
const dbPath = path.join(__dirname, '../../database/journal.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.init();
      }
    });
  }

  init() {
    // Create tables if they don't exist
    this.db.serialize(() => {
      // Journal entries table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS journal_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          country_code TEXT NOT NULL,
          country_name TEXT NOT NULL,
          entry TEXT,
          visit_status TEXT DEFAULT 'not-visited',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          user_id INTEGER DEFAULT 1
        )
      `);

      // Country visit status table - separate tracking for country status
      this.db.run(`
        CREATE TABLE IF NOT EXISTS country_status (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          country_code TEXT NOT NULL UNIQUE,
          country_name TEXT NOT NULL,
          visit_status TEXT DEFAULT 'not-visited',
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          user_id INTEGER DEFAULT 1
        )
      `);

      console.log('Database tables initialized');
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }

  getDb() {
    return this.db;
  }
}

module.exports = new Database();