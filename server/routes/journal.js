const express = require('express');
const router = express.Router();
const database = require('../config/database');

// Get all journal entries for a user
router.get('/', (req, res) => {
  const db = database.getDb();
  const query = `
    SELECT je.*, cs.visit_status as country_visit_status 
    FROM journal_entries je
    LEFT JOIN country_status cs ON je.country_code = cs.country_code
    ORDER BY je.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching journal entries:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Convert snake_case to camelCase for frontend compatibility
    const entries = rows.map(row => ({
      id: row.id,
      countryCode: row.country_code,
      countryName: row.country_name,
      entry: row.entry,
      visitStatus: row.country_visit_status || row.visit_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id
    }));
    
    res.json(entries);
  });
});

// Get journal entries for a specific country
router.get('/country/:countryCode', (req, res) => {
  const { countryCode } = req.params;
  const db = database.getDb();
  
  const query = `
    SELECT je.*, cs.visit_status as country_visit_status 
    FROM journal_entries je
    LEFT JOIN country_status cs ON je.country_code = cs.country_code
    WHERE je.country_code = ?
    ORDER BY je.created_at DESC
  `;
  
  db.all(query, [countryCode], (err, rows) => {
    if (err) {
      console.error('Error fetching country entries:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const entries = rows.map(row => ({
      id: row.id,
      countryCode: row.country_code,
      countryName: row.country_name,
      entry: row.entry,
      visitStatus: row.country_visit_status || row.visit_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id
    }));
    
    res.json(entries);
  });
});

// Create a new journal entry
router.post('/', (req, res) => {
  const { countryCode, countryName, entry, visitStatus } = req.body;

  if (!countryCode || !countryName) {
    return res.status(400).json({ error: 'Country code and name are required' });
  }

  const db = database.getDb();
  
  db.serialize(() => {
    // First, update or insert country status
    const upsertCountryStatus = `
      INSERT OR REPLACE INTO country_status (country_code, country_name, visit_status, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    db.run(upsertCountryStatus, [countryCode, countryName, visitStatus || 'not-visited'], function(err) {
      if (err) {
        console.error('Error updating country status:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Only create journal entry if there's actual entry text
      if (entry && entry.trim()) {
        const insertJournalEntry = `
          INSERT INTO journal_entries (country_code, country_name, entry, visit_status, created_at, updated_at, user_id)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
        `;
        
        db.run(insertJournalEntry, [countryCode, countryName, entry, visitStatus || 'not-visited'], function(err) {
          if (err) {
            console.error('Error creating journal entry:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          const newEntry = {
            id: this.lastID,
            countryCode,
            countryName,
            entry,
            visitStatus: visitStatus || 'not-visited',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 1
          };
          
          res.status(201).json(newEntry);
        });
      } else {
        // Just return the country status update
        res.status(201).json({
          countryCode,
          countryName,
          visitStatus: visitStatus || 'not-visited',
          updatedAt: new Date().toISOString()
        });
      }
    });
  });
});

// Update a journal entry
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { entry, visitStatus } = req.body;

  const db = database.getDb();
  
  const updateQuery = `
    UPDATE journal_entries 
    SET entry = COALESCE(?, entry), 
        visit_status = COALESCE(?, visit_status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(updateQuery, [entry, visitStatus, id], function(err) {
    if (err) {
      console.error('Error updating journal entry:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    // Get the updated entry
    const selectQuery = `
      SELECT je.*, cs.visit_status as country_visit_status 
      FROM journal_entries je
      LEFT JOIN country_status cs ON je.country_code = cs.country_code
      WHERE je.id = ?
    `;
    
    db.get(selectQuery, [id], (err, row) => {
      if (err) {
        console.error('Error fetching updated entry:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const updatedEntry = {
        id: row.id,
        countryCode: row.country_code,
        countryName: row.country_name,
        entry: row.entry,
        visitStatus: row.country_visit_status || row.visit_status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        userId: row.user_id
      };
      
      res.json(updatedEntry);
    });
  });
});

// Delete a journal entry
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = database.getDb();
  
  const deleteQuery = 'DELETE FROM journal_entries WHERE id = ?';
  
  db.run(deleteQuery, [id], function(err) {
    if (err) {
      console.error('Error deleting journal entry:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.status(204).send();
  });
});

// Get country visit status (separate endpoint for country status tracking)
router.get('/status/:countryCode', (req, res) => {
  const { countryCode } = req.params;
  const db = database.getDb();
  
  const query = 'SELECT * FROM country_status WHERE country_code = ?';
  
  db.get(query, [countryCode], (err, row) => {
    if (err) {
      console.error('Error fetching country status:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.json({ 
        countryCode, 
        visitStatus: 'not-visited' 
      });
    }
    
    res.json({
      countryCode: row.country_code,
      countryName: row.country_name,
      visitStatus: row.visit_status,
      updatedAt: row.updated_at
    });
  });
});

module.exports = router;