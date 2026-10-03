import * as React from 'react'

import { Button, Link, Text } from '@react-email/components'

import { EmailLayout, styles } from './brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <EmailLayout
    preview={`Confirm your email for ${siteName}`}
    heading="Confirm your email"
    footerNote="If you didn't create an account, you can safely ignore this email."
  >
    <Text style={styles.text}>
      Thanks for signing up for{' '}
      <Link href={siteUrl} style={styles.link}>
        <strong>{siteName}</strong>
      </Link>
      . You're one click away from tailoring ATS-ready resumes for every job you
      apply to.
    </Text>
    <Text style={styles.text}>
      Confirm{' '}
      <Link href={`mailto:${recipient}`} style={styles.link}>
        {recipient}
      </Link>{' '}
      to activate your account:
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Verify Email
    </Button>
  </EmailLayout>
)

export default SignupEmail
