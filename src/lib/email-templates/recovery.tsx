import * as React from 'react'

import { Button, Text } from '@react-email/components'

import { EmailLayout, styles } from './brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
  token?: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
  token,
}: RecoveryEmailProps) => (
  <EmailLayout
    preview={`Reset your password for ${siteName}`}
    heading="Reset your password"
    footerNote="If you didn't request a password reset, ignore this email — your password stays unchanged."
  >
    <Text style={styles.text}>
      We received a request to reset the password for your {siteName} account.
      Choose a new one below. This link expires shortly.
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Reset Password
    </Button>
    {token ? (
      <>
        <Text style={styles.text}>
          Or type this code on the page where you asked for the reset:
        </Text>
        <Text style={styles.code}>{token}</Text>
      </>
    ) : null}
  </EmailLayout>
)

export default RecoveryEmail
