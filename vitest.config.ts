import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['**/*.{test,spec}.{ts,tsx}'],
    resolve: {
      alias: [
        { find: '@', replacement: resolve(__dirname, '.') },
        { find: '@/lib', replacement: resolve(__dirname, './lib') },
        { find: '@/components', replacement: resolve(__dirname, './components') },
        { find: '@/app', replacement: resolve(__dirname, './app') },
        { find: '@/hooks', replacement: resolve(__dirname, './hooks') },
        { find: '@/__tests__', replacement: resolve(__dirname, './__tests__') }
      ]
    },
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
  }
});
