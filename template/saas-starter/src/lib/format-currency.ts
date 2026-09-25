const formatters = new Map<string, Intl.NumberFormat>()

/**
 * Formats an amount in its currency, such as `$20.00` or `€20.00`.
 * `Intl` picks the symbol and the minor digits from the ISO currency code.
 *
 * @example
 * formatCurrency('USD', 20) // '$20.00'
 */
export function formatCurrency(
  currencyCode: string,
  value: number | string
): string {
  let formatter = formatters.get(currencyCode)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol',
      signDisplay: 'negative'
    })
    formatters.set(currencyCode, formatter)
  }
  return formatter.format(Number(value))
}
