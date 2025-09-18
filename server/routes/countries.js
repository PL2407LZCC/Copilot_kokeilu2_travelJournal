const express = require('express');
const router = express.Router();

// Proxy to REST Countries API with caching
let countriesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

router.get('/', async (req, res) => {
  try {
    // Check cache
    if (countriesCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      return res.json(countriesCache);
    }

    // Fetch from REST Countries API
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flag,capital,population,region,languages');
    
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }

    const countries = await response.json();
    
    // Update cache
    countriesCache = countries;
    cacheTimestamp = Date.now();
    
    res.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries data' });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Country not found' });
    }

    const country = await response.json();
    res.json(country[0]);
  } catch (error) {
    console.error('Error fetching country:', error);
    res.status(500).json({ error: 'Failed to fetch country data' });
  }
});

module.exports = router;