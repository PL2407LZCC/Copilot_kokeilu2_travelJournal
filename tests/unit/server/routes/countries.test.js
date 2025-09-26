const request = require('supertest');
const express = require('express');
const countriesRoutes = require('../../../../server/routes/countries');

// Mock node-fetch
jest.mock('node-fetch', () => jest.fn());

describe('Countries Routes', () => {
  let app;
  let fetch;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/countries', countriesRoutes);
    
    // Get the mocked fetch
    fetch = require('node-fetch');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /countries', () => {
    test('should fetch and return countries from API', async () => {
      const mockCountries = [
        {
          name: { common: 'Finland' },
          cca2: 'FI',
          cca3: 'FIN',
          flag: '🇫🇮',
          capital: ['Helsinki'],
          population: 5530719,
          region: 'Europe',
          languages: { fin: 'Finnish', swe: 'Swedish' }
        },
        {
          name: { common: 'Sweden' },
          cca2: 'SE',
          cca3: 'SWE',
          flag: '🇸🇪',
          capital: ['Stockholm'],
          population: 10353442,
          region: 'Europe',
          languages: { swe: 'Swedish' }
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCountries
      });

      const response = await request(app)
        .get('/countries');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCountries);
      expect(fetch).toHaveBeenCalledWith(
        'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flag,capital,population,region,languages'
      );
    });

    test('should return cached data on second request', async () => {
      const mockCountries = [
        {
          name: { common: 'Finland' },
          cca2: 'FI',
          cca3: 'FIN'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCountries
      });

      // First request - should fetch from API
      await request(app).get('/countries');
      
      // Second request - should use cache
      const response = await request(app).get('/countries');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCountries);
      expect(fetch).toHaveBeenCalledTimes(1); // Only called once due to caching
    });

    test('should handle API fetch error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const response = await request(app)
        .get('/countries');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to fetch countries data');
    });

    test('should handle network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const response = await request(app)
        .get('/countries');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to fetch countries data');
    });
  });

  describe('GET /countries/:code', () => {
    test('should fetch country by code', async () => {
      const mockCountry = {
        name: { common: 'Finland' },
        cca2: 'FI',
        cca3: 'FIN',
        flag: '🇫🇮',
        capital: ['Helsinki'],
        population: 5530719,
        region: 'Europe'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockCountry]
      });

      const response = await request(app)
        .get('/countries/FI');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCountry);
      expect(fetch).toHaveBeenCalledWith(
        'https://restcountries.com/v3.1/alpha/FI'
      );
    });

    test('should return 404 for invalid country code', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const response = await request(app)
        .get('/countries/INVALID');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Country not found');
    });

    test('should handle API error for country lookup', async () => {
      fetch.mockRejectedValueOnce(new Error('API error'));

      const response = await request(app)
        .get('/countries/FI');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to fetch country data');
    });
  });
});