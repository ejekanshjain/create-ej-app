import type { Config } from 'prettier'

const prettierConfig: Config = {
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
  arrowParens: 'avoid',
  trailingComma: 'none',
  semi: false,
  singleQuote: true,
  tabWidth: 2
}

export default prettierConfig
