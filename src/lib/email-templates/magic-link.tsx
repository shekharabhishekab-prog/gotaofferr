import * as React from 'react'

import { Button, Text } from '@react-email/components'

import { EmailLayout, styles } from './brand'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <EmailLayout
    preview={`Your login link for ${siteName}`}
    heading="Your login link"
    footerNote="If you didn't request this link, you can safely ignore this email."
  >
    <Text style={styles.text}>
      Click below to log in to {siteName}. For your security, this link expires
      shortly and can only be used once.
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Log In
    </Button>
  </EmailLayout>
)

export default MagicLinkEmail
