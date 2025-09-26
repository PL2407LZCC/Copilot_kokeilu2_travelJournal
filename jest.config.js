module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    'server/**/*.js',
    '!src/index.js',
    '!server/index.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  projects: [
    {
      displayName: 'Backend',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/server/**/*.test.js', '<rootDir>/tests/integration/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-server.js']
    },
    {
      displayName: 'Frontend',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/unit/client/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-client.js']
    }
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  clearMocks: true,
  verbose: true
};
