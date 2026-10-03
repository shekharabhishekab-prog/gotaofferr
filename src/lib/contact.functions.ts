import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { contactSchema } from '@/lib/contact-schema'

export const submitContactMessage = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email')
    const { enforcePolicy, clientIp } = await import('@/lib/rate-limit.server')
    const { verifyTurnstile } = await import('@/lib/turnstile.server')

    // This endpoint is public and sends email, so it is throttled twice:
    // per network address and per claimed sender address, with exponential
    // backoff on repeat offenders (thresholds live in rate-limit-config.ts),
    // behind a Turnstile bot gate.
    const ip = clientIp(getRequest())
    await verifyTurnstile(data.turnstileToken, ip)
    await enforcePolicy('contact-ip', ip)
    await enforcePolicy('contact-email', data.email.toLowerCase())

    const key = `contact-${Date.now()}-${data.email}`
    const { turnstileToken: _token, ...message } = data

    // Notify the team (fixed recipient defined on the template).
    await sendTemplateEmail('contact-notification', data.email, {
      templateData: message,
      idempotencyKey: `notify-${key}`,
      replyTo: data.email,
    })

    // Acknowledge the sender.
    const ack = await sendTemplateEmail('contact-confirmation', data.email, {
      templateData: { name: data.name, message: data.message },
      idempotencyKey: `ack-${key}`,
    })

    return { ok: true, acknowledged: ack.sent }
  })
