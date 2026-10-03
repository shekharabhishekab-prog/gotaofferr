import * as React from 'react'

import { Button, Link, Text } from '@react-email/components'

import { EmailLayout, styles } from './brand'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <EmailLayout
    preview={`Confirm your email change for ${siteName}`}
    heading="Confirm your email change"
    footerNote="If you didn't request this change, secure your account immediately."
  >
    <Text style={styles.text}>
      You requested to change the email on your {siteName} account from{' '}
      <Link href={`mailto:${oldEmail}`} style={styles.link}>
        {oldEmail}
      </Link>{' '}
      to{' '}
      <Link href={`mailto:${newEmail}`} style={styles.link}>
        {newEmail}
      </Link>
      .
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Confirm Email Change
    </Button>
  </EmailLayout>
)

export default EmailChangeEmail
