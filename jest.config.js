module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    'server/**/*.js',
    '!src/index.js',
    '!server/index.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  
  // Module name mapping for assets and styles
  moduleNameMapping: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  
  // Test environments
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
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'json'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true
};