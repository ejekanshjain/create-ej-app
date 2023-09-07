/** @type {import("prettier").Config} */
const prettierConfig = {
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  arrowParens: 'avoid',
  trailingComma: 'none',
  semi: false,
  singleQuote: true
}

module.exports = prettierConfig
