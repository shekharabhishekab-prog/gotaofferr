import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(5).max(5000),
  turnstileToken: z.string().trim().max(4000).optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
