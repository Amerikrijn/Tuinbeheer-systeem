import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['{app,components,lib,__tests__}/**/*.{test,spec}.{ts,tsx}', '__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov', 'html'],
      all: true,
      include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        'node_modules/**',
        '.next/**',
        '**/__mocks__/**',
        '**/*.stories.{ts,tsx}'
      ],
      lines: 70,
      functions: 70,
      branches: 60,
      statements: 70
    }
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
  }
});
