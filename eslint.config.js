import js from '@eslint/js';
import ts from '@eslint/typescript';

export default [
  js(),
  ts(),
  {
    ignores: ['**/node_modules/**', '**/dist/**'],
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'warn',
      'eqeqeq': 'error',
      'curly': 'error',
      'semi': ['error', 'always'],
    },
  },
];
