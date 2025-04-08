const eslintPluginTypeScript = require('@typescript-eslint/eslint-plugin')
const parser = require('@typescript-eslint/parser')

const baseConfig = {
  languageOptions: {
    parser: parser,
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      projectService: true,
      tsconfigRootDir: __dirname,
    },
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
    // JavaScript
    'eqeqeq': 'error',
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'no-empty-function': 'warn',
    'no-mixed-spaces-and-tabs': 'error',
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],

    // TypeScript
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-inferrable-types': 'warn',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
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
