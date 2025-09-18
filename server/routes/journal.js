const express = require('express');
const router = express.Router();

// In-memory journal storage (replace with database)
const journalEntries = [];
let nextEntryId = 1;

// Get all journal entries for a user
router.get('/', (req, res) => {
  // In a real app, filter by authenticated user
  res.json(journalEntries);
});

// Get journal entries for a specific country
router.get('/country/:countryCode', (req, res) => {
  const { countryCode } = req.params;
  const entries = journalEntries.filter(entry => entry.countryCode === countryCode);
  res.json(entries);
});

// Create a new journal entry
router.post('/', (req, res) => {
  const { countryCode, countryName, entry, visitStatus } = req.body;

  if (!countryCode || !countryName || !entry) {
    return res.status(400).json({ error: 'Country code, name, and entry are required' });
  }

  const newEntry = {
    id: nextEntryId++,
    countryCode,
    countryName,
    entry,
    visitStatus: visitStatus || 'not-visited',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 1 // Would come from authenticated user
  };

  journalEntries.push(newEntry);
  res.status(201).json(newEntry);
});

// Update a journal entry
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { entry, visitStatus } = req.body;

  const entryIndex = journalEntries.findIndex(e => e.id === parseInt(id));
  if (entryIndex === -1) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  journalEntries[entryIndex] = {
    ...journalEntries[entryIndex],
    entry: entry || journalEntries[entryIndex].entry,
    visitStatus: visitStatus || journalEntries[entryIndex].visitStatus,
    updatedAt: new Date().toISOString()
  };

  res.json(journalEntries[entryIndex]);
});

// Delete a journal entry
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const entryIndex = journalEntries.findIndex(e => e.id === parseInt(id));
  
  if (entryIndex === -1) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  journalEntries.splice(entryIndex, 1);
  res.status(204).send();
});

module.exports = router;