import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // This file deliberately co-exports the pattern types and *_DEFAULTS next
    // to the canvas component (Controls and App import them). That trips the
    // react-refresh rule, which only governs dev-time Fast Refresh and has no
    // bearing on the build — scope it off here.
    files: ['src/components/PixelBackground.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
