// @ts-check
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', '.output/**', '.vinxi/**', 'src/routeTree.gen.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  reactHooks.configs['recommended-latest'],
  reactRefresh.configs.vite,
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // shadcn/ui primitives intentionally co-export a cva variants helper alongside the
    // component (e.g. `buttonVariants`) — that's the documented shadcn shape, not a bug.
    files: ['src/shared/components/ui/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Each module's index.ts is its public API; reach a module's internals (api/,
    // components/, context/, hooks/, etc.) only via relative imports from within that
    // same module, never through the `@/modules/x/y` alias from outside it.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/modules/*/**'],
              message: "Import from the module's public entry point (e.g. \"@/modules/auth\") instead of reaching into its internals.",
            },
          ],
        },
      ],
    },
  },
);
