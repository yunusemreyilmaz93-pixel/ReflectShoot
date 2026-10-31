import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import reactHooks from 'eslint-plugin-react-hooks';

/**
 * Intentionally small: the goal is to keep dead code out, not to restyle the codebase.
 * Unused imports are errors (and auto-fixable with `npx eslint . --fix`); unused variables are warnings.
 */
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'test-results/**', 'playwright-report/**', 'scripts/**', 'public/**'] },
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'unused-imports': unusedImports, 'react-hooks': reactHooks },
    rules: {
      // Real bugs only: hooks called conditionally. exhaustive-deps is off (several effects intentionally run once).
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  }
);
