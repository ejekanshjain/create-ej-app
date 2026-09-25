/**
 * Creates a promise that resolves after a specified delay
 * Useful for adding delays in async functions or testing
 *
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 *
 * @example
 * await delay(1000) // Wait 1 second
 */
export const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))
