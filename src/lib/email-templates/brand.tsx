import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export const BRAND = {
  name: 'GotaOfferr',
  supportEmail: 'contact@gotaofferr.com',
  // Version the public URL so Gmail does not reuse its cached copy of an older email header.
  logoUrl: 'https://gotaofferr.com/favicon.png?v=email-logo-20261014',
  yellow: 'oklch(0.86 0.19 96)',
  black: '#0a0a0a',
  muted: '#55575d',
  faint: '#9b9b9b',
  border: '#ececec',
}

export const styles = {
  main: {
    backgroundColor: '#ffffff',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    margin: '0',
    padding: '0',
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '0 0 32px',
  },
  header: {
    backgroundColor: BRAND.black,
    borderRadius: '14px',
    padding: '22px 26px',
    margin: '24px 0 28px',
  },
  brandRow: {
    verticalAlign: 'middle' as const,
    margin: '0 0 10px',
  },
  logo: {
    display: 'inline-block',
    width: '64px',
    height: '64px',
    margin: '0 12px 0 0',
    verticalAlign: 'middle' as const,
  },
  wordmark: {
    display: 'inline-block',
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 'bold' as const,
    letterSpacing: '-0.4px',
    margin: '0',
    verticalAlign: 'middle' as const,
  },
  wordmarkAccent: { color: BRAND.yellow },
  tagline: {
    color: BRAND.faint,
    fontSize: '12px',
    margin: '6px 0 0',
    letterSpacing: '0.4px',
    textTransform: 'uppercase' as const,
  },
  body: { padding: '0 26px' },
  h1: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: BRAND.black,
    letterSpacing: '-0.5px',
    margin: '0 0 16px',
  },
  text: {
    fontSize: '15px',
    color: BRAND.muted,
    lineHeight: '1.6',
    margin: '0 0 22px',
  },
  button: {
    backgroundColor: BRAND.yellow,
    color: '#fffffd',
    fontSize: '15px',
    fontWeight: 'bold' as const,
    borderRadius: '10px',
    padding: '14px 26px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  link: { color: BRAND.black, textDecoration: 'underline' },
  code: {
    fontFamily: "'SFMono-Regular', Menlo, Courier, monospace",
    fontSize: '28px',
    fontWeight: 'bold' as const,
    letterSpacing: '6px',
    color: BRAND.black,
    backgroundColor: '#f6f6f6',
    borderRadius: '10px',
    padding: '16px 20px',
    margin: '0 0 26px',
    textAlign: 'center' as const,
  },
  hr: {
    borderTop: `1px solid ${BRAND.border}`,
    margin: '32px 0 18px',
  },
  footer: {
    fontSize: '12px',
    color: BRAND.faint,
    lineHeight: '1.6',
    margin: '0',
  },
}

interface LayoutProps {
  preview: string
  heading: string
  children: React.ReactNode
  footerNote?: string
}

export const EmailLayout = ({
  preview,
  heading,
  children,
  footerNote,
}: LayoutProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Section style={styles.brandRow}>
            <Img
              src={BRAND.logoUrl}
              width="64"
              height="64"
              alt="GotaOfferr logo"
              style={styles.logo}
            />
            <Text style={styles.wordmark}>
              GotaOfferr
            </Text>
          </Section>
          <Text style={styles.tagline}>Find → Tailor → Apply</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>{heading}</Heading>
          {children}
          <Section style={styles.hr} />
          <Text style={styles.footer}>
            {footerNote ? `${footerNote} ` : ''}
            Sent by {BRAND.name} · gotaofferr.com · Need help? {BRAND.supportEmail}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)
