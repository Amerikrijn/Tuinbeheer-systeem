const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Force jsdom environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Ignore setup files and other non-test files
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/setup/',
    '<rootDir>/__mocks__/',
  ],
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Mock Radix UI components
    '^@radix-ui/react-label$': '<rootDir>/__mocks__/radix-ui/label.ts',
    '^@radix-ui/react-toggle-group$': '<rootDir>/__mocks__/radix-ui/toggle-group.ts',
    // Handle CSS and static assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Enhanced timeout and error handling
  testTimeout: 30000, // 30 seconds for all tests
  maxWorkers: '50%', // Limit concurrent tests to avoid resource issues
  
  // Better error reporting
  verbose: true,
  
  // Handle async operations better
  forceExit: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // JSDOM specific options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
    resources: 'usable',
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
const config = createJestConfig(customJestConfig)

// Force the test environment to be jsdom
config.testEnvironment = 'jsdom'

module.exports = config