import type { Config } from 'prettier'

const prettierConfig: Config = {
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  arrowParens: 'avoid',
  trailingComma: 'none',
  semi: false,
  singleQuote: true
}

export default prettierConfig
