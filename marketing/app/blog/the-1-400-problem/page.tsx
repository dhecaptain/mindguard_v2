import type { Metadata } from 'next'
import { BlogPost, H2 } from '@/components/BlogPost'

export const metadata: Metadata = {
  title: 'The 1:400 problem: what counsellors need us to build — MindGuard',
  description: 'One counsellor, four hundred students. How technology can help without pretending to replace human care.',
}

export default function Post() {
  return (
    <BlogPost
      title="The 1:400 problem: what counsellors need us to build"
      date="May 2025"
      author="MindGuard Team"
    >
      <p>
        Ask a school counsellor what their hardest problem is and you will not hear about a
        lack of training, dedication or care. You will hear about ratio. In many schools the
        working reality is one counsellor to four hundred students — and in the worst cases,
        far worse.
      </p>
      <H2>The arithmetic of reactive care</H2>
      <p>
        Four hundred students, each with a life happening to them, largely in digital spaces
        no adult is watching. A counsellor might have meaningful touch with a fraction of
        them each year. Around 90% of young people who die by suicide showed warning signs
        beforehand — but a sign no one sees is not a sign. By the time distress reaches a
        waiting room, the school is already reacting, not preventing.
      </p>
      <H2>What counsellors actually asked for</H2>
      <p>
        When we talked to practitioners, they did not ask for surveillance. They asked for
        three things: earlier signals, fewer false alarms, and tools that respect the
        relationships they are paid to protect. In other words — help prioritising a caseload
        that mathematics says is impossible to give full attention to, without becoming an
        instrument of surveillance over the very students they are trying to help.
      </p>
      <H2>What that means we must build</H2>
      <p>
        It means a tool that turns consented, explicitly shared content into a prioritised,
        human-reviewed signal. It means the consent workflow has to be effortless enough that
        schools actually run it, and rigorous enough that parents trust it. It means reminders
        and expiry handling themselves, so the admin is not the bottleneck. It means crisis
        resources are one click away when a signal is urgent.
      </p>
      <p>
        Technology will not fix the counsellor-to-student ratio. But it can make the counsellor
        four hundred times more effective at knowing who needs them most. That is the problem
        we exist to solve — and we intend to keep solving it, consent-first, for as long as it
        takes.
      </p>
    </BlogPost>
  )
}
