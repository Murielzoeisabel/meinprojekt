import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    cache: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'prisma/**',
        'data/**',
        'scripts/**',
        '*.config.*',
        '**/*.test.js',
        '**/*.spec.js'
      ]
    }
  }
});
