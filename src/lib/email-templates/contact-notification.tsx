import * as React from 'react'

import { Text } from '@react-email/components'

import { BRAND, EmailLayout, styles } from './brand'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  email?: string
  message?: string
}

const ContactNotificationEmail = ({ name, email, message }: Props) => (
  <EmailLayout
    preview={`New contact form message${name ? ` from ${name}` : ''}`}
    heading="New contact form message"
  >
    <Text style={styles.text}>
      <strong>Name:</strong> {name || '—'}
      <br />
      <strong>Email:</strong> {email || '—'}
    </Text>
    <Text style={{ ...styles.text, borderLeft: `3px solid ${BRAND.border}`, paddingLeft: '14px' }}>
      {message || '—'}
    </Text>
  </EmailLayout>
)

export const template = {
  component: ContactNotificationEmail,
  subject: 'New contact form message — Terbey',
  displayName: 'Contact form notification (internal)',
  previewData: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'My resume did not parse correctly.',
  },
  to: BRAND.supportEmail,
} satisfies TemplateEntry

export default ContactNotificationEmail
