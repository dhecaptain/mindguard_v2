import type { Metadata } from 'next'
import { BlogPost, H2 } from '@/components/BlogPost'

export const metadata: Metadata = {
  title: 'Why we built MindGuard consent-first — MindGuard',
  description: "Surveillance tools fail in a counselling room. Trust doesn't. The founder's story of why consent is the product.",
}

export default function Post() {
  return (
    <BlogPost
      title="Why we built MindGuard consent-first"
      date="March 2025"
      author="Diana Opiyo"
    >
      <p>
        When we started building MindGuard, the hard part was never the model. Fine-tuning a
        transformer to recognise early signs of distress in digital text is a solvable
        engineering problem. The hard part was deciding what kind of product we were building
        — and what we were willing to be.
      </p>
      <H2>Two ways to build this</H2>
      <p>
        You can build a surveillance product. Scan everything a student posts, flag them to
        administrators without their knowledge, and justify it as safety. It is technically
        easier, operationally simpler, and ethically wrong. It would also fail — because a
        school that cannot tell its students what it is doing has already lost the trust it
        needs to help them.
      </p>
      <p>
        Or you can build a consent-first product. Students and parents decide, in plain
        language, whether their content can be analysed. Every request is recorded, every
        response is audited, and anyone can withdraw at any time with one click. It is harder
        to build. It is the only version that works in a counselling room.
      </p>
      <H2>Consent is not a checkbox</H2>
      <p>
        For us, consent means the workflow is the product. Roster uploads route requests to
        the right person — parents for minors, students for adults. Signed, single-use links
        carry the terms. Reminders arrive at day 3 and day 7. Requests expire at day 30.
        Every view, accept, decline and revocation lands in an immutable audit trail.
      </p>
      <p>
        And when a student or parent withdraws, withdrawal is one click, requires no login,
        and stops analysis immediately. We made the frictionless path the ethical one,
        because friction here is just a way of wearing people down.
      </p>
      <H2>Built for humans</H2>
      <p>
        MindGuard supports counsellors; it never replaces them. It surfaces signals a trained
        professional should review, and offers crisis resources when those signals are
        urgent. The human keeps the decision. That is what clinical decision support means,
        and it is the only contract we will sign with a school.
      </p>
    </BlogPost>
  )
}
