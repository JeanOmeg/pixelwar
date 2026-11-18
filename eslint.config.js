const eslintPluginTypeScript = require('@typescript-eslint/eslint-plugin')
const parser = require('@typescript-eslint/parser')

const baseConfig = {
  languageOptions: {
    parser: parser,
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: {
    '@typescript-eslint': eslintPluginTypeScript
  },
  ignores: [
    '.vscode/**/*',
    'docs/**/*',
    'node_modules/**/*',
    'res/**/*',
    'dist/**/*'
  ],
  rules: {
    // the base rule doesn't understand TypeScript (type parameters, constructor properties)
    'no-unused-vars': 'off',
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'eqeqeq': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    '@typescript-eslint/prefer-namespace-keyword': 'off',
    '@typescript-eslint/no-namespace': 'off',
    "object-curly-spacing": ["error", "always"]
  }
}

module.exports = [
  {
    files: ['src/**/*.ts', 'tests/**/*.ts', 'scripts/**/*.ts', 'vitest.config.ts'],
    ...baseConfig,
    rules: {
      ...baseConfig.rules
    }
  }
]
