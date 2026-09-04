import type { Metadata } from 'next'
import { PageHero, SectionHeading, Card, Check, CtaBand } from '@/components/ui'
import { Reveal, Stagger, StaggerItem, FloatingOrb, HoverLift } from '@/components/motion'
import { Icons } from '@/components/icons'
import { SecurityDiagram } from '@/components/SecurityDiagram'

export const metadata: Metadata = {
  title: 'Security & compliance — MindGuard',
  description:
    'MindGuard security and compliance: encryption, FERPA, COPPA, incident response, and our SOC 2 roadmap.',
}

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
    icon: <Icons.ShieldCheck />,
    title: 'Rate limiting',
    text: 'Login and registration are limited per IP, demo submissions are limited to 5 per hour per IP, and each consent page is limited to 20 loads per token.',
  },
  {
    icon: <Icons.DocCheck />,
    title: 'Immutable audit trail',
    text: 'Every consent state change — created, sent, delivered, opened, accepted, declined, expired, revoked, bounced — writes an append-only audit log entry.',
  },
  {
    icon: <Icons.Sparkles />,
    title: 'Data minimisation',
    text: 'Only content a student explicitly shares is analysed, and analysed content is not stored between sessions. CSV validators read only whitelisted columns; extra columns are never stored.',
  },
  {
    icon: <Icons.Lock />,
    title: 'Access control',
    text: 'Role-based permissions gate every action — roster uploads, consent management, analysis and the audit log. Access is limited to institution-authorised staff.',
  },
]

const COMPLIANCE = [
  {
    title: 'FERPA Compliance',
    text: 'Student education records are treated with the confidentiality FERPA requires. Institutions stay in control of their data and who can access it.',
  },
  {
    title: 'COPPA Verified',
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
    <div className="bg-[#FAFAFA]">
      <PageHero
        eyebrow="Security & Compliance Infrastructure"
        title="Built for institutions that take data seriously"
        subtitle="Encryption, consent integrity, audit trails and regulatory awareness — engineered in from the start, not bolted on."
      />

      {/* INTERACTIVE DATA PIPELINE DIAGRAM */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden bg-grid-pattern">
        <div className="max-w-6xl mx-auto px-6">
          <SecurityDiagram />
        </div>
      </section>

      {/* SECURITY CONTROLS */}
      <section className="relative py-24 overflow-hidden">
        <FloatingOrb className="bg-emerald-200 opacity-30 -top-20 -right-20" size={400} />
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionHeading title="Security Controls & Auditing" subtitle="Institutional-grade safeguards protecting student identity and data." />
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONTROLS.map((c) => (
              <StaggerItem key={c.title}>
                <HoverLift>
                  <Card icon={c.icon} title={c.title}>
                    {c.text}
                  </Card>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* COMPLIANCE STANDARDS */}
      <section className="py-24 bg-slate-50 border-y border-emerald-500/10">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionHeading title="Compliance Standards" subtitle="Designed for the regulatory reality of education." />
          </Reveal>
          <Stagger className="grid md:grid-cols-2 gap-6">
            {COMPLIANCE.map((c) => (
              <StaggerItem key={c.title}>
                <div className="bg-white/90 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-8 shadow-sm hover:border-emerald-500/40 transition-all">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{c.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{c.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* INCIDENT RESPONSE */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionHeading title="Incident Response & Transparency" />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="max-w-3xl mx-auto bg-white border border-emerald-500/20 rounded-2xl p-8 shadow-sm">
              <ul className="flex flex-col gap-4">
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

