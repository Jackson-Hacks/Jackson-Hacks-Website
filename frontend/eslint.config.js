import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginUnusedImports from 'eslint-plugin-unused-imports';

const sharedRules = {
  'no-unused-vars': 'off',
  'unused-imports/no-unused-imports': 'error',
  'unused-imports/no-unused-vars': ['warn', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }],
};

export default [
  { ignores: ['dist/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'] },
  {
    files: ['src/**/*.{js,jsx}'],
    ...pluginJs.configs.recommended,
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: { react: pluginReact, 'react-hooks': pluginReactHooks, 'unused-imports': pluginUnusedImports },
    rules: {
      ...sharedRules,
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'error',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unknown-property': ['error', { ignore: ['toast-close'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['scripts/**/*.{js,mjs}', 'tests/**/*.js', 'playwright.config.js'],
    ...pluginJs.configs.recommended,
    languageOptions: { globals: globals.node, parserOptions: { ecmaVersion: 2022, sourceType: 'module' } },
    plugins: { 'unused-imports': pluginUnusedImports },
    rules: sharedRules,
  },
];
