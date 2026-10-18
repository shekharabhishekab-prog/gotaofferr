import * as React from 'react'

import { Button, Link, Section, Text } from '@react-email/components'

import { BRAND, EmailLayout, styles } from './brand'
import type { TemplateEntry } from './registry'

interface AlertJob {
  title?: string
  company?: string
  location?: string
  workMode?: string
  experience?: string
  salary?: string
  source?: string
  url?: string
}

interface Props {
  role?: string
  location?: string | null
  experience?: string | null
  salaryRange?: string | null
  jobs?: AlertJob[]
  jobsUrl?: string
  emailNumber?: number
  unsubscribeUrl?: string
}

const card = {
  border: `1px solid ${BRAND.border}`,
  borderRadius: '12px',
  padding: '14px 16px',
  margin: '0 0 12px',
}

const jobTitle = {
  fontSize: '15px',
  fontWeight: 'bold' as const,
  color: BRAND.black,
  margin: '0 0 4px',
  textDecoration: 'none',
}

const jobMeta = {
  fontSize: '13px',
  color: BRAND.muted,
  lineHeight: '1.5',
  margin: '0',
}

const criteriaStyle = {
  ...styles.text,
  backgroundColor: '#f6f6f6',
  borderRadius: '10px',
  padding: '12px 14px',
  fontSize: '13px',
  margin: '0 0 22px',
}

const JobAlertEmail = ({
  role,
  location,
  experience,
  salaryRange,
  jobs = [],
  jobsUrl = 'https://gotaofferr.com/jobs?alert=1',
  emailNumber,
  unsubscribeUrl,
}: Props) => (
  <EmailLayout
    preview={`${jobs.length} new ${role ?? 'job'} openings matched your job alert`}
    heading={`${jobs.length} new matches for ${role ?? 'your role'}`}
    footerNote={`You're receiving this because you set a job alert in your GotaOfferr account.${emailNumber ? ` This is email ${emailNumber} of 3.` : ''}`}
  >
    <Text style={styles.text}>
      Here are fresh openings picked using the exact filters you saved in the AI job finder.
    </Text>

    <Text style={criteriaStyle}>
      <strong>Your alert:</strong> {role ?? '—'}
      {location ? ` · ${location}` : ''}
      {experience ? ` · ${experience}` : ''}
      {salaryRange ? ` · ${salaryRange}` : ''}
    </Text>

    {jobs.map((job, i) => (
      <Section key={`${job.url ?? i}`} style={card}>
        <Link href={job.url} style={jobTitle}>
          {job.title ?? 'Open role'}
        </Link>
        <Text style={jobMeta}>
          {[job.company, job.location, job.workMode].filter(Boolean).join(' · ')}
        </Text>
        <Text style={jobMeta}>
          {[
            job.experience ? `Experience: ${job.experience}` : '',
            job.salary ? `Salary: ${job.salary}` : '',
            job.source ? `via ${job.source}` : '',
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </Section>
    ))}

    <Section style={{ margin: '26px 0 8px' }}>
      <Button href={jobsUrl} style={styles.button}>
        Open all matches
      </Button>
    </Section>

    <Text style={{ ...styles.text, fontSize: '13px', margin: '18px 0 0' }}>
      Tailor your resume to any of these in one click — then apply the same day.
    </Text>
    {unsubscribeUrl ? (
      <Text style={{ ...styles.text, fontSize: '12px', margin: '14px 0 0' }}>
        Don't want these? <Link href={unsubscribeUrl}>Stop this alert</Link>.
      </Text>
    ) : null}
  </EmailLayout>
)

export const template = {
  component: JobAlertEmail,
  subject: (data: Record<string, any>) =>
    `${data?.jobs?.length ?? 0} new ${data?.role ?? 'job'} openings today — GotaOfferr`,
  displayName: 'Job alert (every 3 days)',
  previewData: {
    role: 'Brand Manager',
    location: 'Bengaluru, India',
    experience: '3-5 years',
    salaryRange: '₹15 - 25 LPA',
    jobs: Array.from({ length: 6 }).map((_, i) => ({
      title: `Brand Manager ${i + 1}`,
      company: 'Acme Corp',
      location: 'Bengaluru, India',
      workMode: 'Hybrid',
      experience: '3-5 years',
      salary: '₹18 - 24 LPA',
      source: 'LinkedIn',
      url: 'https://example.com/job',
    })),
  },
} satisfies TemplateEntry

export default JobAlertEmail

