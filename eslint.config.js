import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
    },
    rules: {
      'no-unused-vars': 'off', // TypeScript handles this
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn',
      'eqeqeq': 'error',
      'curly': 'error',
      'semi': 'off', // Let prettier handle this
      '@typescript-eslint/semi': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
