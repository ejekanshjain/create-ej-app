export const generateLabel = (str: string) =>
  str
    .replaceAll('_', ' ')
    .replaceAll(/([A-Z])/g, ' $1')
    .trim()
