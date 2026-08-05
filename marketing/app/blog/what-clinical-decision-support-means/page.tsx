import type { Metadata } from 'next'
import { BlogPost, H2 } from '@/components/BlogPost'

export const metadata: Metadata = {
  title: "What clinical decision support actually means (and doesn't) — MindGuard",
  description: 'The difference between a decision-support tool and a monitoring wiretap — and why the distinction is existential.',
}

export default function Post() {
  return (
    <BlogPost
      title="What clinical decision support actually means (and doesn't)"
      date="April 2025"
      author="MindGuard Team"
    >
      <p>
        &ldquo;Decision support&rdquo; is a phrase we use a lot, so let us be precise about what it
        means and — just as importantly — what it does not mean.
      </p>
      <H2>What it is</H2>
      <p>
        Decision support is an instrument, not an agent. A thermometer does not diagnose a
        fever; it gives a clinician a number to act on. In the same way, MindGuard takes
        consented digital content and returns a structured risk view — low, moderate, high or
        critical — with crisis resources attached, for a trained counsellor to review.
      </p>
      <p>
        The output is a starting point for a conversation, not a verdict about a student. It
        helps a counsellor with a caseload of hundreds decide who to prioritise. That is
        genuinely valuable, and it is all it claims to be.
      </p>
      <H2>What it is not</H2>
      <p>
        Decision support is not monitoring. It does not watch everything a student does. It
        only analyses content a student has explicitly chosen to share, and only after
        consent is in place. It is not a diagnosis tool — it never labels a student. It is
        not an automated decision maker — no flag escalates itself, because a human must
        review every output. And it does not replace care — a tool that cannot hold a
        conversation with a crying teenager is not a substitute for the person who can.
      </p>
      <H2>Why the distinction matters</H2>
      <p>
        Institutions face real pressure to &ldquo;do something&rdquo; about the student mental-health
        crisis. The risk is that they buy a wiretap dressed up as safety. These tools erode
        trust, discourage students from seeking help, and — because students learn quickly
        what is being watched — end up with a dataset that does not reflect how anyone
        actually feels.
      </p>
      <p>
        We built the line we are willing to stand behind: consent-first, human-in-the-loop,
        FERPA- and COPPA-aware, data-minimised. If a tool cannot explain itself to a
        student&apos;s parent in plain language, it should not be in a school.
      </p>
    </BlogPost>
  )
}
