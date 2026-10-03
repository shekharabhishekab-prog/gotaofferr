import * as React from 'react'

import { Button, Link, Text } from '@react-email/components'

import { EmailLayout, styles } from './brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <EmailLayout
    preview={`You've been invited to join ${siteName}`}
    heading="You've been invited"
    footerNote="If you weren't expecting this invitation, you can safely ignore this email."
  >
    <Text style={styles.text}>
      You've been invited to join{' '}
      <Link href={siteUrl} style={styles.link}>
        <strong>{siteName}</strong>
      </Link>
      . Accept below to create your account and start tailoring resumes.
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Accept Invitation
    </Button>
  </EmailLayout>
)

export default InviteEmail
