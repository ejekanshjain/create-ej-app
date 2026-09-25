import { SpanStatusCode, trace, type Attributes } from '@opentelemetry/api'

const MAX_STRING_ATTR_LENGTH = 256
const MAX_ARRAY_ATTR_ITEMS = 20

/**
 * Helper function to retrieve the currently active span from the OpenTelemetry context.
 * Useful for attaching additional information to the current trace.
 */
function getSpan() {
  const span = trace.getActiveSpan()
  return span
}

/**
 * Records a "wide event" with arbitrary attributes to the current span.
 * This allows adding high-cardinality data or domain-specific context
 * to the trace without starting a new child span.
 *
 * @param attributes - Key-value pairs of attributes to add to the span
 */
export function recordWideEvent(attributes: Attributes) {
  const span = getSpan()
  if (!span) return

  span.setAttributes(attributes)
}

/**
 * Flatten a value tree into OTEL-safe attributes under `prefix`.
 * Nested objects use dotted keys; long strings are truncated; large
 * arrays are capped. Use for action `parsedInput` on wide events.
 */
export function flattenForWideEvent(
  value: unknown,
  prefix = 'input'
): Attributes {
  const out: Attributes = {}

  const visit = (current: unknown, path: string) => {
    if (current === null || current === undefined) return

    if (typeof current === 'string') {
      out[path] =
        current.length > MAX_STRING_ATTR_LENGTH
          ? `${current.slice(0, MAX_STRING_ATTR_LENGTH)}…`
          : current
      return
    }

    if (typeof current === 'number' || typeof current === 'boolean') {
      out[path] = current
      return
    }

    if (typeof current === 'bigint') {
      out[path] = current.toString()
      return
    }

    if (Array.isArray(current)) {
      const limited = current.slice(0, MAX_ARRAY_ATTR_ITEMS)
      const allPrimitive = limited.every(
        item =>
          item === null ||
          item === undefined ||
          typeof item === 'string' ||
          typeof item === 'number' ||
          typeof item === 'boolean'
      )
      if (allPrimitive) {
        out[path] = limited.map(item =>
          item === null || item === undefined ? '' : String(item)
        )
        if (current.length > MAX_ARRAY_ATTR_ITEMS) {
          out[`${path}.length`] = current.length
        }
        return
      }
      out[`${path}.length`] = current.length
      limited.forEach((item, index) => visit(item, `${path}.${index}`))
      return
    }

    if (typeof current === 'object') {
      for (const [key, child] of Object.entries(
        current as Record<string, unknown>
      )) {
        visit(child, path ? `${path}.${key}` : key)
      }
    }
  }

  visit(value, prefix)
  return out
}

/**
 * Records an exception to the current span and sets the span status to ERROR.
 * captures the error message and stack trace if available.
 *
 * @param err - The error to record (can be an Error object or unknown)
 * @returns The trace ID associated with the error, useful for correlation
 */
export function recordError(err: unknown) {
  const span = getSpan()
  if (!span) return

  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: err instanceof Error ? err.message : String(err)
  })

  span.recordException(err instanceof Error ? err : String(err))

  return span.spanContext().traceId
}
