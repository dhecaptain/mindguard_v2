import type { Metadata } from 'next'
import { PageHero, SectionHeading, Card, Check, CtaBand, Eyebrow } from '@/components/ui'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'
import { Icons } from '@/components/icons'
import { SecurityDiagram } from '@/components/SecurityDiagram'
import { UserCheck, Scale, ShieldCheck } from 'lucide-react'
export const metadata: Metadata = {
  title: 'Security & compliance — MindGuard',
  description:
    'MindGuard security and compliance: encryption, FERPA, COPPA, incident response, and our SOC 2 roadmap.',
}

const PILLARS = [
  {
    icon: <Icons.Lock />,
    title: 'Privacy',
    text: 'Consent-first and data-minimal. Only explicitly shared content is processed, and analysed content is never stored between sessions.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Security',
    text: 'Encryption at rest and in transit, least-privilege access, signed single-use consent tokens, and an immutable audit trail.',
  },
  {
    icon: <Scale className="w-6 h-6" />,
    title: 'Compliance',
    text: 'Designed for FERPA and COPPA, with a DPA for your records and a SOC 2 readiness roadmap.',
  },
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: 'Human oversight',
    text: 'Every AI output is reviewed by a trained counsellor. MindGuard never makes an automated decision.',
  },
]

const CONTROLS = [
  {
    icon: <Icons.Lock />,
    title: 'Encryption at rest',
    text: 'Student PII — names, emails, dates of birth — is encrypted at the column level with AES-256-GCM. Keys are managed separately from the data and never shipped in code or images.',
  },
  {
    icon: <Icons.Key />,
    title: 'Signed, single-use consent tokens',
    text: 'Consent links use HMAC-SHA256 tokens with a random nonce. They are single-use, verified server-side, and hashed at rest so a database leak does not enable replay.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Rate limiting',
    text: 'Login and registration are limited per IP, demo submissions are limited to 5 per hour per IP, and each consent page is limited to 20 loads per token.',
  },
  {
    icon: <Icons.DocCheck />,
    title: 'Immutable audit trail',
    text: 'Every consent state change — created, sent, delivered, opened, accepted, declined, expired, revoked, bounced — writes an append-only audit log entry.',
  },
  {
    icon: <Icons.ShieldCheck />,
    title: 'Data minimisation',
    text: 'Only content a student explicitly shares is analysed, and the output is a summary for a counsellor to review — never an automated action. CSV validators read only whitelisted columns; extra columns are never stored.',
  },
  {
    icon: <Icons.Lock />,
    title: 'Access control',
    text: 'Role-based permissions gate every action — roster uploads, consent management, analysis and the audit log. Access is limited to institution-authorised staff.',
  },
]

const COMPLIANCE = [
  {
    title: 'FERPA-conscious design',
    text: 'Student education records are treated with the confidentiality FERPA requires. Institutions stay in control of their data and who can access it.',
  },
  {
    title: 'COPPA-aware design',
    text: 'Minors only participate with verifiable parental consent. The age-of-majority threshold is configurable per institution, and parent emails are required for minors on the roster.',
  },
  {
    title: 'Data Processing Agreement',
    text: 'A DPA template is available for your records and can be tailored to your institution before you go live.',
  },
  {
    title: 'SOC 2 Readiness Roadmap',
    text: 'We operate with SOC 2 principles in mind — least privilege, encryption, audit logging, incident response — and are on a roadmap to formal SOC 2 readiness.',
  },
]

const RESPONSE = [
  'Every consent state change is logged with actor, timestamp and metadata — we can reconstruct exactly what happened and when.',
  'Security incidents are triaged by the engineering team and affected institutions are notified with a clear summary and remediation plan.',
  'Backups of the database are taken daily, and restore is tested on a schedule.',
  'Keys and secrets are held in environment-level secret management, not in the repository.',
]

export default function SecurityPage() {
  return (
    <div>
      <PageHero
        eyebrow="Security & compliance"
        title="Trust is part of the product"
        subtitle="Encryption, consent integrity, audit trails and regulatory awareness — engineered in from the start, not bolted on."
      />

      {/* Pillars */}
      <section className="py-20 sm:py-24">
        <div className="mg-section">
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((p) => (
              <StaggerItem key={p.title}>
                <div className="mg-card mg-card-hover h-full p-7">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                    {p.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-ink">{p.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed">{p.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Architecture visualization (single dark panel) */}
      <section className="py-20 bg-white">
        <div className="mg-section">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-12">
              <Eyebrow>Architecture</Eyebrow>
              <h2 className="display text-3xl sm:text-4xl text-ink mt-3">
                A consent-gated pipeline
              </h2>
              <p className="mt-4 text-base text-ink-soft max-w-xl mx-auto">
                How data moves through MindGuard — with consent at every gate and a human always
                in the loop.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <SecurityDiagram />
          </Reveal>
        </div>
      </section>

      {/* Controls */}
      <section className="py-20 sm:py-24">
        <div className="mg-section">
          <Reveal>
            <SectionHeading title="Security controls & auditing" subtitle="Institutional-grade safeguards protecting student identity and data." />
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONTROLS.map((c) => (
              <StaggerItem key={c.title}>
                <Card icon={c.icon} title={c.title}>
                  {c.text}
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20 sm:py-24 bg-white border-y border-[rgba(23,33,29,0.08)]">
        <div className="mg-section">
          <Reveal>
            <SectionHeading title="Compliance standards" subtitle="Designed for the regulatory reality of education." />
          </Reveal>
          <Stagger className="grid md:grid-cols-2 gap-6">
            {COMPLIANCE.map((c) => (
              <StaggerItem key={c.title}>
                <div className="mg-card mg-card-hover p-8">
                  <h3 className="text-xl font-semibold text-ink mb-3">{c.title}</h3>
                  <p className="text-sm text-ink-soft leading-relaxed">{c.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Incident response */}
      <section className="py-20 sm:py-24">
        <div className="mg-section">
          <Reveal>
            <SectionHeading title="Incident response & transparency" />
          </Reveal>
          <Reveal delay={0.08}>
            <div className="max-w-3xl mx-auto mg-card p-8">
              <ul className="flex flex-col gap-5">
                {RESPONSE.map((r) => (
                  <Check key={r}>{r}</Check>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand title="Want the details for your security review?" subtitle="We'll walk your IT and legal teams through architecture, controls and the DPA." />
    </div>
  )
}
