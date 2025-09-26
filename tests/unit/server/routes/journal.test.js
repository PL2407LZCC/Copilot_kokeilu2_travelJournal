const request = require('supertest');
const express = require('express');
const journalRoutes = require('../../../../server/routes/journal');

// Mock the database module
jest.mock('../../../../server/config/database', () => ({
  getDb: jest.fn()
}));

// Mock the auth middleware
jest.mock('../../../../server/middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 1 }; // Mock authenticated user
    next();
  }
}));

describe('Journal Routes', () => {
  let app;
  let mockDb;
  let database;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/journal', journalRoutes);
    
    database = require('../../../../server/config/database');
  });

  beforeEach(() => {
    mockDb = {
      all: jest.fn(),
      get: jest.fn(),
      run: jest.fn(),
      serialize: jest.fn((callback) => callback())
    };
    database.getDb.mockReturnValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /journal', () => {
    test('should return journal entries for authenticated user', async () => {
      const mockEntries = [
        {
          id: 1,
          country_code: 'FI',
          country_name: 'Finland',
          entry: 'Great trip!',
          visit_status: 'visited',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          user_id: 1,
          country_visit_status: 'visited'
        },
        {
          id: 2,
          country_code: 'SE',
          country_name: 'Sweden',
          entry: 'Beautiful country!',
          visit_status: 'visited',
          created_at: '2024-01-02T10:00:00Z',
          updated_at: '2024-01-02T10:00:00Z',
          user_id: 1,
          country_visit_status: 'visited'
        }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockEntries);
      });

      const response = await request(app)
        .get('/journal');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: 1,
        countryCode: 'FI',
        countryName: 'Finland',
        entry: 'Great trip!',
        visitStatus: 'visited'
      });
    });

    test('should handle database error', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/journal');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /journal/country/:countryCode', () => {
    test('should return entries for specific country', async () => {
      const mockEntries = [
        {
          id: 1,
          country_code: 'FI',
          country_name: 'Finland',
          entry: 'First visit',
          visit_status: 'visited',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          user_id: 1,
          country_visit_status: 'visited'
        }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockEntries);
      });

      const response = await request(app)
        .get('/journal/country/FI');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].countryCode).toBe('FI');
    });
  });

  describe('POST /journal', () => {
    test('should create new journal entry with text', async () => {
      const mockEntry = {
        countryCode: 'FI',
        countryName: 'Finland',
        entry: 'Amazing trip!',
        visitStatus: 'visited'
      };

      // Mock country status update
      mockDb.run
        .mockImplementationOnce((query, params, callback) => {
          callback.call({ lastID: 1 }, null); // Country status update success
        })
        .mockImplementationOnce((query, params, callback) => {
          callback.call({ lastID: 123 }, null); // Journal entry creation success
        });

      const response = await request(app)
        .post('/journal')
        .send(mockEntry);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: 123,
        countryCode: 'FI',
        countryName: 'Finland',
        entry: 'Amazing trip!',
        visitStatus: 'visited'
      });
      expect(mockDb.run).toHaveBeenCalledTimes(2);
    });

    test('should create only country status without entry text', async () => {
      const mockEntry = {
        countryCode: 'SE',
        countryName: 'Sweden',
        visitStatus: 'want-to-visit'
      };

      mockDb.run.mockImplementationOnce((query, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      const response = await request(app)
        .post('/journal')
        .send(mockEntry);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        countryCode: 'SE',
        countryName: 'Sweden',
        visitStatus: 'want-to-visit'
      });
      expect(mockDb.run).toHaveBeenCalledTimes(1); // Only country status update
    });

    test('should reject request without country code', async () => {
      const response = await request(app)
        .post('/journal')
        .send({
          countryName: 'Finland',
          entry: 'Test entry'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Country code and name are required');
    });

    test('should reject request without country name', async () => {
      const response = await request(app)
        .post('/journal')
        .send({
          countryCode: 'FI',
          entry: 'Test entry'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Country code and name are required');
    });

    test('should handle database error during creation', async () => {
      mockDb.run.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .post('/journal')
        .send({
          countryCode: 'FI',
          countryName: 'Finland',
          entry: 'Test entry',
          visitStatus: 'visited'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('PUT /journal/:id', () => {
    test('should update journal entry', async () => {
      const updatedEntry = {
        id: 1,
        country_code: 'FI',
        country_name: 'Finland',
        entry: 'Updated entry text',
        visit_status: 'visited',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T12:00:00Z',
        user_id: 1,
        country_visit_status: 'visited'
      };

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, updatedEntry);
      });

      const response = await request(app)
        .put('/journal/1')
        .send({
          entry: 'Updated entry text',
          visitStatus: 'visited'
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        countryCode: 'FI',
        entry: 'Updated entry text'
      });
    });

    test('should return 404 if entry not found or access denied', async () => {
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const response = await request(app)
        .put('/journal/999')
        .send({
          entry: 'Updated entry'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Entry not found or access denied');
    });
  });

  describe('DELETE /journal/:id', () => {
    test('should delete journal entry', async () => {
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const response = await request(app)
        .delete('/journal/1');

      expect(response.status).toBe(204);
    });

    test('should return 404 if entry not found', async () => {
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const response = await request(app)
        .delete('/journal/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Entry not found or access denied');
    });
  });

  describe('GET /journal/status/:countryCode', () => {
    test('should return country status if exists', async () => {
      const mockStatus = {
        country_code: 'FI',
        country_name: 'Finland',
        visit_status: 'visited',
        updated_at: '2024-01-01T10:00:00Z'
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockStatus);
      });

      const response = await request(app)
        .get('/journal/status/FI');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        countryCode: 'FI',
        countryName: 'Finland',
        visitStatus: 'visited'
      });
    });

    test('should return default status if country not found', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .get('/journal/status/UNKNOWN');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        countryCode: 'UNKNOWN',
        visitStatus: 'not-visited'
      });
    });
  });
});