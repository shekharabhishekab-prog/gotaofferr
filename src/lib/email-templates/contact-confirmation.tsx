import * as React from 'react'

import { Text } from '@react-email/components'

import { BRAND, EmailLayout, styles } from './brand'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  message?: string
}

const ContactConfirmationEmail = ({ name, message }: Props) => (
  <EmailLayout
    preview="We received your message — Terbey"
    heading="We got your message"
    footerNote="You're receiving this because you contacted us through terbey.com."
  >
    <Text style={styles.text}>
      {name ? `Hi ${name},` : 'Hi there,'} thanks for reaching out to {BRAND.name}. Our
      team replies within 1–2 business days.
    </Text>
    {message ? (
      <Text style={{ ...styles.text, borderLeft: `3px solid ${BRAND.border}`, paddingLeft: '14px' }}>
        {message}
      </Text>
    ) : null}
    <Text style={styles.text}>
      If it's urgent, just reply to this email and it lands straight in our inbox.
    </Text>
  </EmailLayout>
)

export const template = {
  component: ContactConfirmationEmail,
  subject: 'We received your message — Terbey',
  displayName: 'Contact form confirmation',
  previewData: { name: 'Jane', message: 'My resume did not parse correctly.' },
} satisfies TemplateEntry

export default ContactConfirmationEmail
