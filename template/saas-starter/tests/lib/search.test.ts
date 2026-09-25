import { describe, expect, test } from 'bun:test'
import { escapeLikePattern, likeContains } from '~/lib/search'

describe('escapeLikePattern', () => {
  test('escapes LIKE wildcards and the escape character', () => {
    expect(escapeLikePattern('%')).toBe('\\%')
    expect(escapeLikePattern('_')).toBe('\\_')
    expect(escapeLikePattern('\\')).toBe('\\\\')
    expect(escapeLikePattern('100%_off\\sale')).toBe('100\\%\\_off\\\\sale')
  })

  test('leaves ordinary search text unchanged', () => {
    expect(escapeLikePattern('Quarterly report')).toBe('Quarterly report')
  })
})

describe('likeContains', () => {
  test('wraps an escaped pattern for contains matching', () => {
    expect(likeContains('report')).toBe('%report%')
    expect(likeContains('%')).toBe('%\\%%')
    expect(likeContains('_')).toBe('%\\_%')
  })
})
