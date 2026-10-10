import eslint from '@eslint/js'
import react from 'eslint-plugin-react'
import hooks from 'eslint-plugin-react-hooks'
import a11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'
import tseslint from 'typescript-eslint'
export default [ { ignores: ['dist/**', '.prerender/**', 'node_modules/**'] }, { ...eslint.configs.recommended, languageOptions: { globals: { ...globals.browser, ...globals.node } } }, ...tseslint.configs.recommended, { files: ['scripts/*.cjs'], rules: { '@typescript-eslint/no-require-imports': 'off' } }, { files: ['**/*.tsx'], ...react.configs.flat.recommended, settings: { react: { version: 'detect' } } }, { files: ['**/*.tsx'], ...react.configs.flat['jsx-runtime'] }, { files: ['**/*.{ts,tsx}'], plugins: { 'react-hooks': hooks }, rules: hooks.configs.recommended.rules }, { files: ['**/*.tsx'], ...a11y.flatConfigs.recommended } ]
