// Server-side test setup
const path = require('path');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_PATH = path.join(__dirname, '../database/test.db');

// Clean up database before each test suite
beforeAll(async () => {
  // Database cleanup will be handled in individual test files
});

afterAll(async () => {
  // Global cleanup
});