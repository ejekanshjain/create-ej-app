import { SpanStatusCode } from '@opentelemetry/api'
import {
  ConsoleSpanExporter,
  ReadableSpan,
  SimpleSpanProcessor
} from '@opentelemetry/sdk-trace-base'
import { registerOTel } from '@vercel/otel'
import { siteConfig } from '~/lib/siteConfig'

/**
 * Custom SpanProcessor that samples spans to reduce telemetry volume.
 * Exports every error span, exports every span slower than 5s.
 */
class SmartSamplingSpanProcessor extends SimpleSpanProcessor {
  /**
   * Called when a span ends. Evaluates whether the span should be exported based on its properties.
   *
   * @param span - The readable span that has just ended
   */
  onEnd(span: ReadableSpan): void {
    const isError = span.status.code === SpanStatusCode.ERROR
    // span.duration is [seconds, nanoseconds]
    // Spans slower than 5s
    const isSlow = span.duration[0] * 1000 + span.duration[1] / 1e6 > 5000
    // Random sampling: Adjust probability as needed (e.g. 0.1 for 10%)
    const isLucky = Math.random() < 0 // Currently disabled for non-essential traces

    if (isError || isSlow || isLucky) {
      super.onEnd(span)
    }
  }
}

/**
 * Registers OpenTelemetry instrumentation for the application.
 * This function should be exported as `register` from `src/instrumentation.ts`
 * to be automatically picked up by Next.js.
 */
export function register() {
  registerOTel({
    serviceName: siteConfig.name,
    spanProcessors: [new SmartSamplingSpanProcessor(new ConsoleSpanExporter())]
  })
}
