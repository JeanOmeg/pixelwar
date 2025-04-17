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
    'no-unused-vars': 'error',
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
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
    files: ['src/**/*.ts'],
    ...baseConfig,
    rules: {
      ...baseConfig.rules
    }
  }
]
