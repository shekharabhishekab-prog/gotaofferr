import * as React from 'react'

import { Text } from '@react-email/components'

import { EmailLayout, styles } from './brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({
  token,
}: ReauthenticationEmailProps) => (
  <EmailLayout
    preview="Your verification code"
    heading="Confirm it's you"
    footerNote="This code expires shortly. If you didn't request it, ignore this email."
  >
    <Text style={styles.text}>
      Use the verification code below to confirm your identity:
    </Text>
    <Text style={styles.code}>{token}</Text>
  </EmailLayout>
)

export default ReauthenticationEmail
