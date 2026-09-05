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
    '**/out/**',
    '**/.vscode/**',
    '**/build/**',
    '**/messages/**',
    '**/components.json',
    '**/components/ui/**',
    '**/components/magicui/**',
    '**/src-tauri/target/**',
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
]);
