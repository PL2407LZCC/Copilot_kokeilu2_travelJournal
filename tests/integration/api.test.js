const request = require('supertest');
const express = require('express');

// Import routes
const authRoutes = require('../../server/routes/auth');
const journalRoutes = require('../../server/routes/journal');
const countriesRoutes = require('../../server/routes/countries');

// Mock node-fetch for countries route
jest.mock('node-fetch', () => jest.fn());

// Mock database with a test database
jest.mock('../../server/config/database', () => {
  const mockPath = require('path');
  const mockFs = require('fs');
  const sqlite3 = require('sqlite3').verbose();
  
  const testDbPath = mockPath.join(__dirname, '../test.db');
  
  // Clean up any existing test database
  if (mockFs.existsSync(testDbPath)) {
    mockFs.unlinkSync(testDbPath);
  }
  
  const db = new sqlite3.Database(testDbPath);
  
  // Initialize test database
  db.serialize(() => {
    db.run(`
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

    db.run(`
      CREATE TABLE IF NOT EXISTS country_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        country_code TEXT NOT NULL UNIQUE,
        country_name TEXT NOT NULL,
        visit_status TEXT DEFAULT 'not-visited',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER DEFAULT 1
      )
    `);
  });
  
  return {
    getDb: () => db,
    close: () => {
      db.close();
      // Clean up test database after tests
      if (mockFs.existsSync(testDbPath)) {
        mockFs.unlinkSync(testDbPath);
      }
    }
  };
});

describe('API Integration Tests', () => {
  let app;
  let fetch;
  let database;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Mount routes
    app.use('/api/auth', authRoutes);
    app.use('/api/journal', journalRoutes);
    app.use('/api/countries', countriesRoutes);
    
    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        message: 'Travel Journal API is running',
        timestamp: new Date().toISOString() 
      });
    });

    fetch = require('node-fetch');
    database = require('../../server/config/database');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (database && database.close) {
      database.close();
    }
  });

  describe('Health Check', () => {
    test('GET /api/health should return OK status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Authentication Flow', () => {
    test('should allow user registration and login flow', async () => {
      const userData = {
        username: 'integrationtest',
        email: 'integration@test.com',
        password: 'testpassword123'
      };

      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body).toHaveProperty('token');
      expect(registerResponse.body.user.username).toBe(userData.username);

      // Login with registered user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body).toHaveProperty('token');
      expect(loginResponse.body.user.username).toBe(userData.username);
    });

    test('should reject duplicate user registration', async () => {
      const userData = {
        username: 'duplicate',
        email: 'duplicate@test.com',
        password: 'password123'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Second registration should fail
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'User already exists');
    });
  });

  describe('Journal Management Flow', () => {
    let authToken;

    beforeEach(async () => {
      // Login with demo user to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'demo',
          password: 'demo'
        });
      
      authToken = loginResponse.body.token;
    });

    test('should create, read, update, and delete journal entries', async () => {
      const entryData = {
        countryCode: 'FI',
        countryName: 'Finland',
        entry: 'Amazing trip to Finland!',
        visitStatus: 'visited'
      };

      // Create entry
      const createResponse = await request(app)
        .post('/api/journal')
        .set('Authorization', `Bearer ${authToken}`)
        .send(entryData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toMatchObject({
        countryCode: 'FI',
        countryName: 'Finland',
        entry: 'Amazing trip to Finland!',
        visitStatus: 'visited'
      });

      const entryId = createResponse.body.id;

      // Read entries
      const readResponse = await request(app)
        .get('/api/journal')
        .set('Authorization', `Bearer ${authToken}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body).toHaveLength(1);
      expect(readResponse.body[0]).toMatchObject(entryData);

      // Update entry
      const updateData = {
        entry: 'Updated: Even better trip to Finland!',
        visitStatus: 'visited'
      };

      const updateResponse = await request(app)
        .put(`/api/journal/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.entry).toBe(updateData.entry);

      // Delete entry
      const deleteResponse = await request(app)
        .delete(`/api/journal/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(204);

      // Verify deletion
      const verifyResponse = await request(app)
        .get('/api/journal')
        .set('Authorization', `Bearer ${authToken}`);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body).toHaveLength(0);
    });

    test('should get entries by country', async () => {
      const entryData = {
        countryCode: 'SE',
        countryName: 'Sweden',
        entry: 'Beautiful Sweden!',
        visitStatus: 'visited'
      };

      // Create entry
      await request(app)
        .post('/api/journal')
        .set('Authorization', `Bearer ${authToken}`)
        .send(entryData);

      // Get by country
      const response = await request(app)
        .get('/api/journal/country/SE')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].countryCode).toBe('SE');
    });

    test('should handle country status without journal entry', async () => {
      const statusData = {
        countryCode: 'NO',
        countryName: 'Norway',
        visitStatus: 'want-to-visit'
      };

      // Create country status without entry text
      const response = await request(app)
        .post('/api/journal')
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        countryCode: 'NO',
        countryName: 'Norway',
        visitStatus: 'want-to-visit'
      });
      expect(response.body).not.toHaveProperty('id'); // No journal entry created
    });

    test('should require authentication for journal operations', async () => {
      const entryData = {
        countryCode: 'FI',
        countryName: 'Finland',
        entry: 'Test entry'
      };

      // Try without token
      const response = await request(app)
        .post('/api/journal')
        .send(entryData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });
  });

  describe('Countries API Integration', () => {
    test('should fetch countries from external API', async () => {
      const mockCountries = [
        {
          name: { common: 'Finland' },
          cca2: 'FI',
          cca3: 'FIN',
          flag: '🇫🇮'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCountries
      });

      const response = await request(app)
        .get('/api/countries');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCountries);
    });

    test('should fetch specific country by code', async () => {
      const mockCountry = {
        name: { common: 'Finland' },
        cca2: 'FI',
        cca3: 'FIN',
        flag: '🇫🇮'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockCountry]
      });

      const response = await request(app)
        .get('/api/countries/FI');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCountry);
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown');

      expect(response.status).toBe(404);
    });

    test('should handle malformed JSON in requests', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });
  });
});