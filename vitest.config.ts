import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['{app,components,lib}/**/*.{test,spec}.{ts,tsx}', '__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov', 'html', 'json'],
      all: true,
      include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        'node_modules/**',
        '.next/**',
        '**/__mocks__/**',
        '**/*.stories.{ts,tsx}'
      ],
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
      // Ensure detailed coverage output
      reportOnFailure: true,
      // Generate summary for CI
      reporter: ['text', 'lcov', 'html', 'json', 'text-summary']
    },
    // Ensure verbose output for CI parsing
    reporters: ['verbose'],
    // Show test results clearly
    silent: false,
    // Ensure proper exit codes
    passWithNoTests: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  },
  esbuild: {
    target: 'node18'
  },
  // Fix ES Module issues
  optimizeDeps: {
    include: ['vitest']
  },
  // Ensure proper module resolution
  build: {
    target: 'node18'
  },
  // Fix module resolution issues
  ssr: {
    noExternal: ['vitest']
  }
});
