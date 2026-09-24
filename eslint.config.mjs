import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
  prettierRecommended,
  globalIgnores([
    '**/dist/**',
    '**/node_modules/**',
    '**/.next/**',
    '**/.next-desktop-dev/**',
    '**/out/**',
    '**/.vscode/**',
    '**/build/**',
    '**/messages/**',
    '**/components.json',
    '**/components/ui/**',
    '**/components/magicui/**',
    '**/src-tauri/target/**',
    '**/public/vendor/**',
    '**/.desktop-build-backup/**',
    '**/.desktop-build-*/**',
  ]),
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'jsx-quotes': ['error', 'prefer-single'],
      '@next/next/no-img-element': 'off',
      'react/no-array-index-key': 'off',
      // The imported template predates the React 19 compiler lint rules. Keep
      // these compatibility rules opt-in until the upstream hooks are migrated.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'prettier/prettier': 'warn',
    },
  },
  {
    files: [
      'lib/platform/**/*.{ts,tsx}',
      'lib/features/**/*.ts',
      'network/upload/**/*.ts',
      'network/polling-manager.ts',
      'network/connection-test.ts',
      'tests/**/*.{ts,mts}',
    ],
    rules: { '@typescript-eslint/no-explicit-any': 'error', '@typescript-eslint/no-unused-vars': 'error' },
  },
  {
    // The pinned upstream canvas engine retains its original type-check and memoization
    // boundaries. Desktop integration, persistence, transport and tests remain linted.
    files: [
      'components/infinite-canvas/components/**/*.{ts,tsx}',
      'components/infinite-canvas/constant/**/*.{ts,tsx}',
      'components/infinite-canvas/lib/**/*.{ts,tsx}',
      'components/infinite-canvas/pages/**/*.{ts,tsx}',
      'components/infinite-canvas/services/**/*.{ts,tsx}',
      'components/infinite-canvas/types/**/*.{ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
]);
