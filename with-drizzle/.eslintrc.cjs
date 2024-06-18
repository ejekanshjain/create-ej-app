/** @type {import("eslint").Linter.Config} */
const eslintConfig = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true
  },
  plugins: ['@typescript-eslint', 'drizzle'],
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/array-type': 'off',
    'drizzle/enforce-delete-with-where': [
      'error',
      {
        drizzleObjectName: ['db', 'ctx.db']
      }
    ],
    'drizzle/enforce-update-with-where': [
      'error',
      {
        drizzleObjectName: ['db', 'ctx.db']
      }
    ]
  }
}

module.exports = eslintConfig
